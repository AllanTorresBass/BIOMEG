import 'server-only'

import type { DraftIdInput } from '@/types/orders/orders.schemas'
import { revalidatePath } from 'next/cache'
import { addNote } from '@/lib/db/memory/fiscal-store'
import { getStub } from '@/lib/db/memory/order-index'
import { getOrder, removeSavedLine, voidSavedOrder } from '@/lib/db/memory/order-store'
import { createQuote } from '@/lib/db/memory/quote-store'
import { demoSeed } from '@/lib/db/memory/seed'
import { computeOrderTotals } from '@/lib/domain/order-totals'
import { activeClient, fail, gate, gated, isResult, open, record, recordRefusal } from '@/lib/server/draft-gate'
import type { Subject } from '@/types/server/draft-gate.types'
import { orderActionFacts } from '@/lib/server/domain/order-facts'
import { getStaffContext } from '@/lib/server/session/current'
import { strings } from '@/lib/strings'
import { LAB_TIME_ZONE } from '@/lib/utils/format'
import type { OrderActionResult, RemoveLineInput, VoidOrderInput } from '@/types/orders/draft.types'

const text = strings.pendingReview.orders

function refresh(orderId: string): void {
  revalidatePath(`/ordenes/${orderId}`)
}

function timeText(iso: string): string {
  return new Intl.DateTimeFormat('es-VE', { timeZone: LAB_TIME_ZONE, dateStyle: 'short', timeStyle: 'short' }).format(new Date(iso))
}

async function subject(): Promise<Subject | null> {
  const context = await getStaffContext()
  return !context || context.locked ? null : { context }
}

export async function voidOrder(input: VoidOrderInput): Promise<OrderActionResult> {
  const opened = await subject()
  if (!opened) return fail(text.notAllowed)
  const order = getOrder(input.orderId)
  const stub = getStub(input.orderId)
  if (!order || !stub) return fail(text.orderMissing)
  const target = { recordType: 'order', recordId: order.id, state: order.state }

  if (order.state === 'ANULADA') {
    await recordRefusal(opened, 'order.void', 'STATE', target)
    return fail(text.alreadyVoided)
  }

  const facts = orderActionFacts(order, stub)
  const allowed = await gate(opened, 'order.void', facts, { confirmed: input.confirmed, motivo: input.motivo }, target)
  if (gated(allowed)) {
    if (allowed.need === null && facts.has_released_result) return fail(text.voidBlockedReleased)
    return allowed
  }

  const motivo = (input.motivo ?? '').trim()
  if (motivo === '') return fail(strings.auth.motivoRequired, 'MOTIVO')

  const voided = voidSavedOrder(order.id, {
    motivo,
    byId: opened.context.account.id,
    byName: opened.context.account.displayName,
    withCreditNote: facts.has_payment,
  })
  if (!voided) return fail(text.alreadyVoided)

  await record(
    opened,
    'order.void',
    allowed.rowId,
    { before: { state: order.state }, after: { state: voided.state, creditNote: voided.voided?.creditNote ?? null } },
    motivo,
    { ...target, state: voided.state },
  )
  refresh(order.id)
  const credit = voided.voided?.creditNote
  if (credit) {
    addNote({
      kind: 'CREDITO',
      number: credit,
      orderId: order.id,
      invoiceNumber: order.invoiceNumber,
      clientName: order.clientName,
      lines: [{ description: text.voidNoteLine, amount: order.totals.abono }],
      total: order.totals.abono,
      rateBs: order.rateBs,
      at: new Date().toISOString(),
      byName: opened.context.account.displayName,
    })
    await record(opened, 'note.issue', allowed.rowId, { before: null, after: { number: credit, kind: 'CREDITO', total: order.totals.abono } }, motivo, target)
  }
  return { ok: true, message: credit ? text.voidDoneCredit(order.number, credit) : text.voidDone(order.number), need: null }
}

export async function removeOrderLine(input: RemoveLineInput): Promise<OrderActionResult> {
  const opened = await subject()
  if (!opened) return fail(text.notAllowed)
  const order = getOrder(input.orderId)
  const stub = getStub(input.orderId)
  if (!order || !stub) return fail(text.orderMissing)
  const target = { recordType: 'order', recordId: order.id, state: order.state }

  const line = order.lines.find((candidate) => candidate.id === input.lineId)
  if (!line || order.state === 'ANULADA') {
    await recordRefusal(opened, 'order.line.remove', 'STATE', target)
    return fail(text.actionFailed)
  }
  if (order.lines.length === 1) return fail(text.lastLine)

  const facts = orderActionFacts(order, stub)
  const allowed = await gate(opened, 'order.line.remove', { has_result: facts.has_result }, { confirmed: input.confirmed }, target)
  if (gated(allowed)) return allowed

  const outcome = removeSavedLine(order.id, line.id)
  if (!outcome.ok) return fail(outcome.reason === 'LAST_LINE' ? text.lastLine : text.actionFailed)

  await record(
    opened,
    'order.line.remove',
    allowed.rowId,
    {
      before: { exam: line.examName, priceUsd: line.priceUsd, totalUsd: order.totals.totalUsd },
      after: { totalUsd: outcome.order.totals.totalUsd },
    },
    undefined,
    target,
  )
  refresh(order.id)
  return { ok: true, message: text.removeLineDone(outcome.removedName), need: null }
}

export async function generateQuote({ draftId }: DraftIdInput): Promise<OrderActionResult> {
  const opened = await open(draftId)
  if (isResult(opened)) return opened
  const { draft, context } = opened

  const allowed = await gate(opened, 'quote.create', {})
  if (gated(allowed)) return allowed

  const client = activeClient(draft.clientId)
  if (!client) return fail(text.quoteNeedsClient)
  if (draft.lines.length === 0) return fail(text.quoteNeedsLines)

  const { settings } = demoSeed
  const totals = computeOrderTotals({
    lines: draft.lines,
    rate: settings.rateBs === '' ? null : settings.rateBs,
    ivaRate: settings.ivaRate,
    igtfRate: settings.igtfRate,
    discountPct: draft.discountPct,
    payments: [],
  })
  const quote = createQuote({
    clientId: client.id,
    clientName: client.fullName,
    billing: draft.billing,
    lines: draft.lines,
    discountPct: draft.discountPct,
    rateBs: settings.rateBs,
    rateDate: settings.rateDate,
    ivaRate: settings.ivaRate,
    igtfRate: settings.igtfRate,
    totals,
    createdByName: context.account.displayName,
    createdAt: new Date().toISOString(),
  })
  await record(
    opened,
    'quote.create',
    allowed.rowId,
    { before: null, after: { number: quote.number, totalUsd: totals.totalUsd, at: timeText(quote.createdAt) } },
    undefined,
    { recordType: 'quote', recordId: quote.id, state: 'EMITIDO' },
  )
  return { ok: true, message: text.quoteDone(quote.number), need: null, quoteId: quote.id }
}
