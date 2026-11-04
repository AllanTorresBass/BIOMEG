'use server'

import { revalidatePath } from 'next/cache'
import { decide } from '@/lib/auth/decide'
import { getStub, updateStub } from '@/lib/db/memory/order-index'
import { dropIncoming, getResult, holdIncoming, queueDiscrepancy, setNote, writeResult } from '@/lib/db/memory/result-store'
import { demoSeed } from '@/lib/db/memory/seed'
import { autoMark, isNumericValue, parseLabNumber, resultOrderState } from '@/lib/domain/result-rules'
import { getClient } from '@/lib/db/memory/client-store'
import { auditEvent } from '@/lib/server/audit'
import { gate, gated, record, type Subject, type Target } from '@/lib/server/draft-gate'
import { hasBacteriologySection } from '@/lib/server/domain/result-grid'
import { getStaffContext } from '@/lib/server/session/current'
import { mayReach } from '@/lib/server/guard'
import { strings } from '@/lib/strings'
import { LAB_TIME_ZONE } from '@/lib/utils/format'
import type { OrderStub } from '@/types/domain/order-stub.types'
import type { ResultActionResult, SaveResultInput } from '@/types/orders/result.types'

const text = strings.pendingReview.results

function timeText(iso: string): string {
  return new Intl.DateTimeFormat('es-VE', { timeZone: LAB_TIME_ZONE, dateStyle: 'short', timeStyle: 'short' }).format(new Date(iso))
}

function refuse(message: string, need: ResultActionResult['need'] = null): ResultActionResult {
  return { ok: false, message, need }
}

interface Opened extends Subject {
  stub: OrderStub
  target: Target
}

async function open(orderId: string): Promise<Opened | ResultActionResult> {
  const context = await getStaffContext()
  if (!context || context.locked) return refuse(text.notAllowed)
  const stub = getStub(orderId)
  if (!stub || stub.voided) return refuse(text.orderMissing)
  const state = resultOrderState(stub)
  return { context, stub, target: { recordType: 'order', recordId: stub.id, state } }
}

function isRefusal(value: Opened | ResultActionResult): value is ResultActionResult {
  return 'ok' in value
}

function gateRefusal(value: { message: string; need: string | null }): ResultActionResult {
  return refuse(value.message, value.need === 'MOTIVO' ? 'MOTIVO' : null)
}

function touch(orderId: string): void {
  revalidatePath(`/ordenes/${orderId}/resultados`)
  revalidatePath('/hoja-de-trabajo')
}

export async function saveResult(input: SaveResultInput): Promise<ResultActionResult> {
  const opened = await open(input.orderId)
  if (isRefusal(opened)) return opened
  const { context, stub, target } = opened

  const line = demoSeed.resultLines.find((entry) => entry.id === input.lineId)
  if (!line) return refuse(text.notAllowed)

  const value = input.value.trim()
  if (value === '') return { ok: true, message: '', need: null }
  if (isNumericValue(line.value) && parseLabNumber(value) === null) return refuse(text.notNumber)

  const current = getResult(stub.id, line.id)
  const own = current === null || (current.byId === context.account.id && current.source === 'teclado')
  const state = resultOrderState(stub)

  const allowed = await gate(opened, 'result.enter', { state, cell_empty_or_own: own }, { motivo: input.motivo }, target)
  if (gated(allowed)) return gateRefusal(allowed)

  const isBioanalyst = context.account.roles.includes('BIOANALISTA')
  const sex = getClient(stub.clientId)?.sex ?? null
  const mark =
    isBioanalyst && input.manualMark !== undefined
      ? input.manualMark === ''
        ? null
        : input.manualMark
      : autoMark(line.reference, value, sex)

  const outcome = writeResult({
    orderId: stub.id,
    lineId: line.id,
    value,
    mark,
    source: 'teclado',
    byId: context.account.id,
    byName: context.account.displayName,
    expectedVersion: input.expectedVersion,
  })

  if (outcome.kind === 'conflict') {
    await auditEvent({
      command: 'result.enter',
      outcome: 'REFUSED',
      reason: 'OWNERSHIP',
      session: context.session,
      account: context.account,
      ...target,
      rowId: allowed.rowId,
    })
    return {
      ok: false,
      message: text.conflict(outcome.current.byName, timeText(outcome.current.at)),
      need: null,
      conflict: {
        byName: outcome.current.byName,
        at: outcome.current.at,
        storedValue: outcome.current.value,
        yourValue: value,
        version: outcome.current.version,
      },
    }
  }

  if (!stub.hasResult) updateStub(stub.id, { hasResult: true })
  await record(
    opened,
    'result.enter',
    allowed.rowId,
    { before: current?.value ?? null, after: value },
    input.motivo,
    target,
  )
  touch(stub.id)
  const saved = outcome.result
  return {
    ok: true,
    message: text.saved,
    need: null,
    saved: { version: saved.version, mark: saved.mark, byName: saved.byName, at: saved.at, value: saved.value },
  }
}

/** The bioanalyst settles an analyzer value that is waiting beside a typed one. */
export async function resolveIncoming(input: {
  orderId: string
  lineId: string
  choice: 'use' | 'keep'
  motivo?: string
}): Promise<ResultActionResult> {
  const opened = await open(input.orderId)
  if (isRefusal(opened)) return opened
  const { context, stub, target } = opened
  const current = getResult(stub.id, input.lineId)
  if (!current || !current.incoming) return refuse(text.orderMissing)

  const allowed = await gate(
    opened,
    'result.enter',
    { state: resultOrderState(stub), cell_empty_or_own: false },
    { motivo: input.motivo },
    target,
  )
  if (gated(allowed)) return gateRefusal(allowed)

  if (input.choice === 'keep') {
    dropIncoming(stub.id, current.lineId)
  } else {
    const line = demoSeed.resultLines.find((entry) => entry.id === current.lineId)
    const sex = getClient(stub.clientId)?.sex ?? null
    writeResult({
      orderId: stub.id,
      lineId: current.lineId,
      value: current.incoming.value,
      mark: line ? autoMark(line.reference, current.incoming.value, sex) : null,
      source: 'equipo',
      byId: 'analyzer',
      byName: 'Sistema: analizador',
      expectedVersion: current.version,
    })
  }
  await record(
    opened,
    'result.enter',
    allowed.rowId,
    { before: current.value, after: input.choice === 'use' ? current.incoming.value : current.value },
    input.motivo,
    target,
  )
  touch(stub.id)
  void context
  return { ok: true, message: text.saved, need: null }
}

/** Demo stand-in for the analyzer, which writes under its own system role. */
export async function simulateAnalyzer(input: { orderId: string; lineId: string; value: string }): Promise<ResultActionResult> {
  const opened = await open(input.orderId)
  if (isRefusal(opened)) return opened
  const { context, stub, target } = opened
  if (!mayReach(context, ['result.enter'])) return refuse(text.notAllowed)

  const line = demoSeed.resultLines.find((entry) => entry.id === input.lineId)
  const value = input.value.trim()
  if (!line || value === '') return refuse(text.notNumber)
  if (isNumericValue(line.value) && parseLabNumber(value) === null) return refuse(text.notNumber)

  const state = resultOrderState(stub)
  const current = getResult(stub.id, line.id)

  if (state === 'LIBERADO' || state === 'EN_CORRECCION') {
    queueDiscrepancy({ orderId: stub.id, lineId: line.id, name: line.name, value, at: new Date().toISOString() })
    await auditEvent({ command: 'result.import', outcome: 'REFUSED', reason: 'STATE', ...target, rowId: null })
    touch(stub.id)
    return { ok: true, message: text.analyzerQueued, need: null }
  }

  if (current && current.source === 'teclado') {
    holdIncoming(stub.id, line.id, value)
    await auditEvent({ command: 'result.import', outcome: 'REFUSED', reason: 'OWNERSHIP', ...target, rowId: null })
    touch(stub.id)
    return { ok: true, message: text.analyzerHeld, need: null }
  }

  const decision = decide({
    session: { valid: true, active: true, userId: 'analyzer', roles: ['SISTEMA_ANALIZADOR'] },
    command: 'result.import',
    facts: { state, cell_empty_or_equipo: true },
    gestures: { confirmVerified: false, stepUpVerified: false },
  })
  if (!decision.allowed) return refuse(text.notAllowed)

  const sex = getClient(stub.clientId)?.sex ?? null
  writeResult({
    orderId: stub.id,
    lineId: line.id,
    value,
    mark: autoMark(line.reference, value, sex),
    source: 'equipo',
    byId: 'analyzer',
    byName: 'Sistema: analizador',
    expectedVersion: current?.version ?? 0,
  })
  if (!stub.hasResult) updateStub(stub.id, { hasResult: true })
  await auditEvent({
    command: 'result.import',
    outcome: 'ALLOWED',
    ...target,
    rowId: decision.rowId,
    change: { before: current?.value ?? null, after: value },
  })
  touch(stub.id)
  return { ok: true, message: text.analyzerSaved, need: null }
}

export async function saveSectionNote(input: { orderId: string; section: string; text: string }): Promise<ResultActionResult> {
  const opened = await open(input.orderId)
  if (isRefusal(opened)) return opened
  const { stub, target } = opened
  if (!demoSeed.resultLines.some((line) => line.section === input.section)) return refuse(text.notAllowed)

  const allowed = await gate(opened, 'result.enter', { state: resultOrderState(stub), cell_empty_or_own: true }, {}, target)
  if (gated(allowed)) return gateRefusal(allowed)

  setNote(stub.id, input.section, input.text)
  await record(opened, 'result.enter', allowed.rowId, { before: null, after: { note: input.section } }, undefined, target)
  touch(stub.id)
  return { ok: true, message: text.noteSaved, need: null }
}

/** Bacteriology notes belong to the bioanalyst only. A catalog without that section stores nothing. */
export async function addBacteriologyNote(input: { orderId: string }): Promise<ResultActionResult> {
  const opened = await open(input.orderId)
  if (isRefusal(opened)) return opened
  const { stub, target } = opened

  const allowed = await gate(
    opened,
    'result.enter',
    { state: resultOrderState(stub), cell_empty_or_own: false },
    { motivo: 'Nota de bacteriología' },
    target,
  )
  if (gated(allowed)) return gateRefusal(allowed)
  if (!hasBacteriologySection()) return refuse(text.noBacteriology)
  return { ok: true, message: text.noteSaved, need: null }
}
