import 'server-only'

import { revalidatePath } from 'next/cache'
import { decide } from '@/lib/auth/decide'
import { addMergeRequest, correctClientCedula, getClient, mergeClients, setClientActive, softDeleteClient, unmergeClients } from '@/lib/db/memory/client-store'
import type { Actor } from '@/types/stores/client-store.types'
import { orderFacts } from '@/lib/db/memory/order-index'
import { auditEvent } from '@/lib/server/audit'
import { validateCedulaPair } from '@/lib/server/domain/client-rules'
import { getStaffContext, toDecisionSession } from '@/lib/server/session/current'
import { isStepUpFresh } from '@/lib/server/session/store'
import { strings } from '@/lib/strings'
import { normalizeName } from '@/lib/utils/format'
import type { LifecycleInput, LifecycleNeed, LifecycleResult } from '@/types/clients/lifecycle.types'
import type { StaffContext } from '@/types/session/session.types'
import type { Gate } from '@/types/server/client-lifecycle.types'

const text = strings.pendingReview.lifecycle

function fail(message: string, need: LifecycleNeed | null = null): LifecycleResult {
  return { ok: false, message, need }
}

function done(message: string): LifecycleResult {
  return { ok: true, message, need: null }
}

function actorOf(context: StaffContext): Actor {
  return { userId: context.account.id, userName: context.account.displayName, now: new Date().toISOString() }
}

/**
 * Asks the permission table first and writes the audit row for a refusal. A missing confirm,
 * step-up or motivo comes back as `need` so the screen can ask, and is audited as a refusal too.
 */
async function gate(
  command: string,
  recordId: string,
  facts: Record<string, boolean>,
  presented: { confirmed?: boolean; motivo?: string },
): Promise<Gate | LifecycleResult> {
  const context = await getStaffContext()
  if (!context) return fail(text.notAllowed)

  const decision = decide({
    session: toDecisionSession(context),
    command,
    facts,
    gestures: {
      confirmVerified: presented.confirmed === true,
      stepUpVerified: isStepUpFresh(context.session),
      motivo: presented.motivo,
    },
  })
  if (decision.allowed) {
    return { context, allowed: true, rowId: decision.rowId, result: null }
  }

  await auditEvent({
    command,
    outcome: 'REFUSED',
    reason: decision.reason,
    session: context.session,
    account: context.account,
    recordType: 'client',
    recordId,
    rowId: decision.rowId,
  })
  if (decision.reason === 'CONFIRM') return fail('', 'CONFIRM')
  if (decision.reason === 'STEP_UP') return fail('', 'STEP_UP')
  if (decision.reason === 'MOTIVO_REQUIRED') return fail(strings.auth.motivoRequired, 'MOTIVO')
  return fail(text.notAllowed)
}

function isResult(value: Gate | LifecycleResult): value is LifecycleResult {
  return 'need' in value
}

async function record(
  gateResult: Gate,
  command: string,
  recordId: string,
  change: { before: unknown; after: unknown } | null,
  motivo?: string,
): Promise<void> {
  await auditEvent({
    command,
    outcome: 'ALLOWED',
    session: gateResult.context.session,
    account: gateResult.context.account,
    recordType: 'client',
    recordId,
    rowId: gateResult.rowId,
    motivo: motivo?.trim() || null,
    change,
  })
}

function refresh(): void {
  revalidatePath('/clientes', 'layout')
}

export async function deactivateClient(input: LifecycleInput): Promise<LifecycleResult> {
  const current = getClient(input.clientId)
  if (!current) return fail(text.notFound)
  const gated = await gate('client.deactivate', input.clientId, {}, { confirmed: input.confirmed })
  if (isResult(gated)) return gated

  const result = setClientActive(input.clientId, false, actorOf(gated.context))
  if (!result.ok) return fail(text.notFound)
  // Running it a second time changes nothing and says so, instead of writing a second change row.
  if (!result.changed) return done(text.alreadyInactive)
  await record(gated, 'client.deactivate', input.clientId, { before: { active: true }, after: { active: false } })
  refresh()
  return done(text.deactivated)
}

export async function reactivateClient(input: LifecycleInput): Promise<LifecycleResult> {
  const current = getClient(input.clientId)
  if (!current) return fail(text.notFound)
  const gated = await gate('client.reactivate', input.clientId, {}, { confirmed: input.confirmed })
  if (isResult(gated)) return gated

  const result = setClientActive(input.clientId, true, actorOf(gated.context))
  if (!result.ok) return fail(text.notFound)
  if (!result.changed) return done(text.alreadyActive)
  await record(gated, 'client.reactivate', input.clientId, { before: { active: false }, after: { active: true } })
  refresh()
  return done(text.reactivated)
}

export async function deleteClient(input: LifecycleInput): Promise<LifecycleResult> {
  const current = getClient(input.clientId)
  if (!current) return fail(text.notFound)
  const recent = orderFacts(input.clientId).order_last_30_days
  if (recent) {
    await auditEvent({
      command: 'client.delete',
      outcome: 'REFUSED',
      reason: 'STATE',
      session: (await getStaffContext())?.session,
      account: (await getStaffContext())?.account,
      recordType: 'client',
      recordId: input.clientId,
      rowId: 'R-018',
    })
    return fail(strings.clients.deleteRecent)
  }
  const gated = await gate('client.delete', input.clientId, { order_last_30_days: false }, { confirmed: input.confirmed })
  if (isResult(gated)) return gated

  const result = softDeleteClient(input.clientId, actorOf(gated.context))
  if (!result.ok) return fail(text.notFound)
  await record(gated, 'client.delete', input.clientId, { before: { deleted: false }, after: { deleted: true } })
  refresh()
  return done(text.deleted)
}

export async function correctCedula(
  input: LifecycleInput & { cedulaType: string; cedulaNumber: string },
): Promise<LifecycleResult> {
  const current = getClient(input.clientId)
  if (!current) return fail(text.notFound)

  const pair = validateCedulaPair(input.cedulaType, input.cedulaNumber)
  const messages: Record<string, string> = strings.pendingReview.clients.errors
  if (!pair.ok) {
    return fail(pair.refusal.code === 'CEDULA_DUPLICATE' ? strings.clients.cedulaDuplicate : (messages[pair.refusal.code] ?? text.notAllowed))
  }
  if (pair.type === null || pair.digits === null) return fail(messages.CEDULA_HALF_NUMBER ?? text.notAllowed)

  const gated = await gate('client.cedula.correct', input.clientId, { has_order: orderFacts(input.clientId).has_order }, {
    motivo: input.motivo,
  })
  if (isResult(gated)) return gated

  const result = correctClientCedula(input.clientId, pair.type, pair.digits, actorOf(gated.context))
  if (!result.ok) return fail(result.reason === 'CEDULA_TAKEN' ? strings.clients.cedulaDuplicate : text.notFound)
  await record(
    gated,
    'client.cedula.correct',
    input.clientId,
    {
      before: { cedulaType: result.before.cedulaType, cedulaDigits: result.before.cedulaDigits },
      after: { cedulaType: result.after.cedulaType, cedulaDigits: result.after.cedulaDigits, ordersUpdated: result.ordersUpdated },
    },
    input.motivo,
  )
  refresh()
  return done(text.correctedOk)
}

export async function requestMerge(input: LifecycleInput & { note: string }): Promise<LifecycleResult> {
  const current = getClient(input.clientId)
  if (!current) return fail(text.notFound)
  const gated = await gate('client.merge.request', input.clientId, {}, {})
  if (isResult(gated)) return gated

  const actor = actorOf(gated.context)
  addMergeRequest({ clientId: input.clientId, note: input.note.trim(), requestedBy: actor.userName, requestedAt: actor.now })
  await record(gated, 'client.merge.request', input.clientId, { before: null, after: { note: input.note.trim() } })
  refresh()
  return done(text.requestedOk)
}

export async function mergeClientRecords(
  input: LifecycleInput & { sourceId: string; retypedName: string },
): Promise<LifecycleResult> {
  const survivor = getClient(input.clientId)
  const source = getClient(input.sourceId)
  if (!survivor || !source) return fail(text.mergeErrors.MISSING)
  if (survivor.id === source.id) return fail(text.mergeErrors.SELF)
  if (normalizeName(input.retypedName).key !== survivor.nameKey) return fail(text.mergeErrors.NAME_MISMATCH)

  const bothComplete = Boolean(survivor.cedulaType && survivor.cedulaDigits && source.cedulaType && source.cedulaDigits)
  const different = survivor.cedulaType !== source.cedulaType || survivor.cedulaDigits !== source.cedulaDigits
  const gated = await gate('client.merge', input.clientId, { both_complete_and_different: bothComplete && different }, {})
  if (isResult(gated)) {
    if (!gated.need && bothComplete && different) return fail(text.mergeErrors.DIFFERENT_CEDULAS)
    return gated
  }

  const result = mergeClients(source.id, survivor.id, actorOf(gated.context))
  if (!result.ok) return fail(result.reason === 'SELF' ? text.mergeErrors.SELF : text.mergeErrors.MISSING)
  await record(gated, 'client.merge', survivor.id, {
    before: { sourceId: source.id, sourceName: source.fullName, orders: result.merge.movedOrders.length },
    after: { survivorId: survivor.id, mergeId: result.merge.id },
  })
  refresh()
  return done(text.mergedOk)
}

export async function undoMerge(input: { mergeId: string; clientId: string; motivo: string }): Promise<LifecycleResult> {
  const gated = await gate('client.unmerge', input.clientId, {}, { motivo: input.motivo })
  if (isResult(gated)) return gated

  const result = unmergeClients(input.mergeId, actorOf(gated.context))
  if (!result.ok) return fail(result.reason === 'CEDULA_TAKEN' ? text.unmergeCedulaTaken : text.notFound)
  await record(
    gated,
    'client.unmerge',
    result.merge.sourceId,
    { before: { mergeId: result.merge.id }, after: { restoredOrders: result.restoredOrders } },
    input.motivo,
  )
  refresh()
  return done(text.unmergedOk)
}
