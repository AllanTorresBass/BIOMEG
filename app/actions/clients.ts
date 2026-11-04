'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { decide } from '@/lib/auth/decide'
import { findByCedula, findSimilar, getClient, insertClient, summarize, updateClient } from '@/lib/db/memory/client-store'
import { flagForReview, orderFacts } from '@/lib/db/memory/order-index'
import { auditEvent } from '@/lib/server/audit'
import { parseBirthDate, validateClientInput } from '@/lib/server/domain/client-rules'
import { getStaffContext, toDecisionSession } from '@/lib/server/session/current'
import { strings } from '@/lib/strings'
import { LAB_TIME_ZONE } from '@/lib/utils/format'
import type { ClientFormInput, ClientFormState, ClientRecord, ConsentChannel } from '@/types/domain/client.types'

const EMPTY: ClientFormState = {
  error: null,
  field: null,
  similar: [],
  duplicate: null,
  conflict: null,
  needsConfirm: false,
  savedId: null,
}

function text(data: FormData, name: string): string {
  const value = data.get(name)
  return typeof value === 'string' ? value : ''
}

function readInput(data: FormData): ClientFormInput {
  const id = text(data, 'id')
  const version = Number(text(data, 'version'))
  return {
    id: id === '' ? null : id,
    version: Number.isInteger(version) && version > 0 ? version : null,
    fullName: text(data, 'fullName'),
    cedulaType: text(data, 'cedulaType'),
    cedulaNumber: text(data, 'cedulaNumber'),
    birthDate: text(data, 'birthDate'),
    sex: text(data, 'sex'),
    phone: text(data, 'phone'),
    email: text(data, 'email'),
    consentWhatsapp: data.get('consentWhatsapp') === 'on',
    consentEmail: data.get('consentEmail') === 'on',
    confirmSimilar: data.get('confirmSimilar') === 'on',
  }
}

/** Facts for client.update, read from the stored record and never from the form. */
function updateFacts(existing: ClientRecord, input: ClientFormInput): Record<string, boolean> {
  const typedType = input.cedulaType.trim().toUpperCase()
  const typedDigits = input.cedulaNumber.replace(/[.\-\s]/g, '')
  const typedSex = input.sex.trim().toUpperCase()
  return {
    cedula_changed: typedType !== (existing.cedulaType ?? '') || typedDigits !== (existing.cedulaDigits ?? ''),
    dob_or_sex_changed: parseBirthDate(input.birthDate) !== existing.birthDate || typedSex !== (existing.sex ?? ''),
    contact_changed:
      input.phone.trim() !== (existing.phone ?? '') || input.email.trim().toLowerCase() !== (existing.email ?? ''),
    ...orderFacts(existing.id),
  }
}

function labTime(iso: string): string {
  return new Intl.DateTimeFormat('es-VE', { timeZone: LAB_TIME_ZONE, hour: '2-digit', minute: '2-digit' }).format(
    new Date(iso),
  )
}

/** Creates or saves a client from the card. One audit row per attempt, refused ones included. */
export async function saveClient(_previous: ClientFormState, formData: FormData): Promise<ClientFormState> {
  const context = await getStaffContext()
  if (!context || context.locked) return { ...EMPTY, error: strings.pendingReview.clients.errors.REFUSED }

  const input = readInput(formData)
  const existing = input.id ? getClient(input.id) : null
  if (input.id && !existing) return { ...EMPTY, error: strings.pendingReview.clients.errors.NOT_FOUND }

  const command = existing ? 'client.update' : 'client.create'
  const facts = existing ? updateFacts(existing, input) : undefined
  const confirmed = formData.get('confirmGesture') === 'on'
  const decision = decide({
    session: toDecisionSession(context),
    command,
    facts,
    gestures: { confirmVerified: confirmed },
  })
  const audit = {
    command: 'patient.save',
    session: context.session,
    account: context.account,
    recordType: 'client',
    recordId: existing?.id ?? null,
    rowId: decision.rowId,
  }
  // A confirm is asked only after the form itself is valid, so the operator never confirms a save that cannot happen.
  const needsConfirm = !decision.allowed && decision.reason === 'CONFIRM'
  if (!decision.allowed && !needsConfirm) {
    await auditEvent({ ...audit, outcome: 'REFUSED', reason: decision.reason })
    const cedulaLocked = decision.reason === 'STATE' && facts?.cedula_changed && facts.has_order
    return { ...EMPTY, error: cedulaLocked ? strings.clients.cedulaLocked : strings.pendingReview.clients.errors.REFUSED }
  }

  const validation = validateClientInput(input)
  if (!validation.ok) {
    await auditEvent({ ...audit, outcome: 'REFUSED', reason: 'STATE' })
    return { ...EMPTY, error: strings.pendingReview.clients.errors[validation.refusal.code as keyof typeof strings.pendingReview.clients.errors] ?? strings.pendingReview.clients.errors.REFUSED, field: validation.refusal.field }
  }
  const value = validation.value

  if (value.cedulaType && value.cedulaDigits) {
    const duplicate = findByCedula(value.cedulaType, value.cedulaDigits, existing?.id ?? null)
    if (duplicate) {
      await auditEvent({ ...audit, outcome: 'REFUSED', reason: 'STATE', state: 'CEDULA_DUPLICATE' })
      return { ...EMPTY, error: strings.clients.cedulaDuplicate, field: 'cedulaNumber', duplicate: summarize(duplicate) }
    }
  }

  // A renamed or new client is checked against the others. An unchanged name is not asked about again.
  const nameChanged = !existing || existing.nameKey !== value.nameKey
  const similar = nameChanged ? findSimilar(value.nameKey, existing?.id ?? null) : []
  if (similar.length > 0 && !input.confirmSimilar) {
    await auditEvent({ ...audit, outcome: 'REFUSED', reason: 'STATE', state: 'SIMILAR_NAME' })
    return { ...EMPTY, similar: similar.map(summarize) }
  }

  if (needsConfirm) {
    await auditEvent({ ...audit, outcome: 'REFUSED', reason: 'CONFIRM' })
    return { ...EMPTY, needsConfirm: true }
  }

  const now = new Date().toISOString()
  const consents: ConsentChannel[] = [
    ...(input.consentWhatsapp ? (['WHATSAPP'] as const) : []),
    ...(input.consentEmail ? (['EMAIL'] as const) : []),
  ]
  const saveContext = {
    userName: context.account.displayName,
    userId: context.account.id,
    now,
    consents,
    confirmedSimilarIds: similar.map((record) => record.id),
  }

  let savedId: string
  if (existing) {
    const result = updateClient(existing.id, input.version ?? -1, value, saveContext)
    if (!result.ok) {
      await auditEvent({ ...audit, outcome: 'REFUSED', reason: 'STATE', state: 'VERSION_CONFLICT' })
      if (result.reason === 'NOT_FOUND') return { ...EMPTY, error: strings.pendingReview.clients.errors.NOT_FOUND }
      return {
        ...EMPTY,
        conflict: { savedBy: result.current.lastSavedBy, savedAt: labTime(result.current.lastSavedAt) },
      }
    }
    savedId = result.after.id
    // Fecha de nac. or sex changed on a client with orders: those orders need a second look (A5).
    if (facts?.dob_or_sex_changed) flagForReview(savedId)
    await auditEvent({
      ...audit,
      outcome: 'ALLOWED',
      recordId: savedId,
      change: { before: result.before, after: result.after },
    })
  } else {
    const created = insertClient(value, saveContext)
    savedId = created.id
    await auditEvent({ ...audit, outcome: 'ALLOWED', recordId: savedId, change: { before: null, after: created } })
  }

  revalidatePath('/clientes')
  redirect(`/clientes?id=${savedId}&saved=1`)
}
