import 'server-only'

import { revalidatePath } from 'next/cache'
import { getOrder, setOrderPayments } from '@/lib/db/memory/order-store'
import {
  addClose,
  addEntry,
  addMonthClose,
  entriesOfOrder,
  getClose,
  getEntry,
  markReversed,
  monthCloseOf,
  openEntriesOf,
  reopenClose,
} from '@/lib/db/memory/payment-store'
import { activePayments } from '@/lib/domain/cash'
import { computeOrderTotals, parseAmountCents } from '@/lib/domain/order-totals'
import { parseCents } from '@/lib/domain/pricing'
import { gate, gated, record, recordRefusal } from '@/lib/server/draft-gate'
import { summarizeEntries } from '@/lib/server/domain/cash-summary'
import { todayInLab } from '@/lib/server/domain/client-rules'
import { getAccount } from '@/lib/server/session/store'
import { getStaffContext } from '@/lib/server/session/current'
import { strings } from '@/lib/strings'
import type { SavedOrder } from '@/types/orders/order.types'
import type { PaymentEntry, PaymentResult } from '@/types/orders/payment.types'
import type { AbonoInput, CashCloseInput, CashReopenInput, MonthCloseInput, ReversePaymentInput } from '@/types/orders/payments.schemas'
import type { Subject } from '@/types/server/draft-gate.types'

const text = strings.pendingReview.payments

function fail(message: string, need: PaymentResult['need'] = null): PaymentResult {
  return { ok: false, message, need }
}

function done(message: string): PaymentResult {
  return { ok: true, message, need: null }
}

/** The gate's refusal keeps its message and its need, whichever draft or payment asked. */
function refusalOf(answer: { message: string; need: string | null }): PaymentResult {
  const need = answer.need === 'CONFIRM_OVERRIDE' || answer.need === 'STEP_UP' || answer.need === 'MOTIVO' ? answer.need : null
  return fail(answer.message, need)
}

async function subject(): Promise<Subject | null> {
  const context = await getStaffContext()
  return !context || context.locked ? null : { context }
}

function refresh(orderId?: string): void {
  revalidatePath('/pagos', 'layout')
  if (orderId) revalidatePath(`/ordenes/${orderId}`)
}

/** Totals come from the rows still in force, at the rate the order was saved with. A saved document keeps its rate. */
function totalsWith(order: SavedOrder, payments: SavedOrder['payments']) {
  return computeOrderTotals({
    lines: order.lines,
    rate: order.rateBs === '' ? null : order.rateBs,
    ivaRate: order.ivaRate,
    igtfRate: order.igtfRate,
    discountPct: order.discountPct,
    payments,
  })
}

function toDraftPayment({ method, amount, bank, reference }: PaymentEntry): SavedOrder['payments'][number] {
  return { method, amount, bank, reference }
}

/** R-060. Money owed never blocks release or the portal, so this touches nothing but the money. */
export async function addAbono({ orderId, method, amount, bank, reference }: AbonoInput): Promise<PaymentResult> {
  const opened = await subject()
  if (!opened) return fail(text.notAllowed)
  const order = getOrder(orderId)
  if (!order) return fail(text.orderMissing)
  const target = { recordType: 'order', recordId: order.id, state: order.state }

  const allowed = await gate(opened, 'payment.abono', {}, {}, target)
  if (gated(allowed)) return refusalOf(allowed)

  if (order.state === 'ANULADA') {
    await recordRefusal(opened, 'payment.record', 'STATE', target)
    return fail(text.orderVoided)
  }
  const cents = parseAmountCents(amount)
  if (cents === null || cents <= 0) return fail(text.badAmount)

  const next = [...activePayments(entriesOfOrder(order.id)).map(toDraftPayment), { method, amount, bank, reference }]
  const totals = totalsWith(order, next)
  if (parseCents(totals.abono) > parseCents(totals.totalUsd)) return fail(text.overpaid(order.totals.resta))

  const { account, session } = opened.context
  const entry = addEntry({
    orderId: order.id,
    orderNumber: order.number,
    invoiceNumber: order.invoiceNumber,
    method,
    amount,
    bank,
    reference,
    at: new Date().toISOString(),
    byId: account.id,
    byName: account.displayName,
    workstation: session.workstation,
    reversesId: null,
    motivo: null,
  })
  setOrderPayments(order.id, next, totals)
  await record(opened, 'payment.record', allowed.rowId, { before: { abono: order.totals.abono }, after: { id: entry.id, abono: totals.abono } }, undefined, target)
  refresh(order.id)
  return done(text.abonoDone(totals.resta))
}

/** R-061. Reception: own and same day, with a confirm. Otherwise Administración, with a re-entry. The original row stays. */
export async function reversePayment({ paymentId, confirmed, motivo }: ReversePaymentInput): Promise<PaymentResult> {
  const opened = await subject()
  if (!opened) return fail(text.notAllowed)
  const entry = getEntry(paymentId)
  const order = entry ? getOrder(entry.orderId) : null
  if (!entry || !order) return fail(text.paymentMissing)
  const target = { recordType: 'payment', recordId: entry.id, state: order.state }

  const sameDay = todayInLab(new Date(entry.at)) === todayInLab()
  const presented = { confirmed: confirmed === true, ...(motivo === undefined ? {} : { motivo }), ownerUserId: entry.byId }
  const allowed = await gate(opened, 'payment.reverse', { same_day: sameDay }, presented, target)
  if (gated(allowed)) return refusalOf(allowed)

  if (entry.reversesId || entry.reversedById || order.state === 'ANULADA') {
    await recordRefusal(opened, 'payment.reverse', 'STATE', target)
    return fail(text.notReversible)
  }
  const why = (motivo ?? '').trim()
  if (why === '') return fail(strings.auth.motivoRequired, 'MOTIVO')

  const { account, session } = opened.context
  const reversal = addEntry({
    orderId: entry.orderId,
    orderNumber: entry.orderNumber,
    invoiceNumber: entry.invoiceNumber,
    method: entry.method,
    amount: entry.amount,
    bank: entry.bank,
    reference: entry.reference,
    at: new Date().toISOString(),
    byId: account.id,
    byName: account.displayName,
    workstation: session.workstation,
    reversesId: entry.id,
    motivo: why,
  })
  markReversed(entry.id, reversal.id)
  const payments = activePayments(entriesOfOrder(order.id)).map(toDraftPayment)
  const totals = totalsWith(order, payments)
  setOrderPayments(order.id, payments, totals)
  await record(opened, 'payment.reverse', allowed.rowId, { before: { id: entry.id, abono: order.totals.abono }, after: { id: reversal.id, abono: totals.abono } }, why, target)
  refresh(order.id)
  return done(text.reverseDone)
}

/** R-062 and R-063. It closes that person's open payments on every workstation and deletes nothing. */
export async function closeCash({ userId, motivo }: CashCloseInput): Promise<PaymentResult> {
  const opened = await subject()
  if (!opened) return fail(text.notAllowed)
  const owner = getAccount(userId)
  if (!owner) return fail(text.drawerMissing)
  const target = { recordType: 'cash_drawer', recordId: owner.id, state: 'ABIERTA' }

  const presented = { ...(motivo === undefined ? {} : { motivo }), ownerUserId: owner.id }
  const allowed = await gate(opened, 'cash.close', {}, presented, target)
  if (gated(allowed)) return refusalOf(allowed)

  const entries = openEntriesOf(owner.id)
  if (entries.length === 0) return fail(text.nothingToClose)

  const { account } = opened.context
  const summary = summarizeEntries(entries)
  const close = addClose({
    userId: owner.id,
    userName: owner.displayName,
    closedById: account.id,
    closedByName: account.displayName,
    at: new Date().toISOString(),
    motivo: motivo?.trim() || null,
    summary,
    entryIds: entries.map((entry) => entry.id),
  })
  await record(opened, 'cash.close', allowed.rowId, { before: null, after: { id: close.id, owner: owner.id, totalUsd: summary.totalUsd, totalBs: summary.totalBs } }, motivo, target)
  refresh()
  return done(text.closeDone(owner.displayName))
}

/** R-064. The close stays as evidence, and its rows return to the open period. */
export async function reopenCash({ closeId, motivo }: CashReopenInput): Promise<PaymentResult> {
  const opened = await subject()
  if (!opened) return fail(text.notAllowed)
  const close = getClose(closeId)
  if (!close) return fail(text.closeMissing)
  const target = { recordType: 'cash_close', recordId: close.id, state: close.reopenedAt ? 'REABIERTO' : 'CERRADO' }

  const allowed = await gate(opened, 'cash.reopen', {}, motivo === undefined ? {} : { motivo }, target)
  if (gated(allowed)) return refusalOf(allowed)

  const why = (motivo ?? '').trim()
  if (why === '') return fail(strings.auth.motivoRequired, 'MOTIVO')
  const reopened = reopenClose(close.id, opened.context.account.displayName, why)
  if (!reopened) {
    await recordRefusal(opened, 'cash.reopen', 'STATE', target)
    return fail(text.alreadyReopened)
  }
  await record(opened, 'cash.reopen', allowed.rowId, { before: { state: 'CERRADO' }, after: { state: 'REABIERTO' } }, why, target)
  refresh()
  return done(text.reopenDone)
}

/** R-065. A month act of its own. It never runs a daily close. */
export async function closeMonth({ month }: MonthCloseInput): Promise<PaymentResult> {
  const opened = await subject()
  if (!opened) return fail(text.notAllowed)
  const target = { recordType: 'month', recordId: month, state: monthCloseOf(month) ? 'CERRADO' : 'ABIERTO' }

  const allowed = await gate(opened, 'month.close', {}, {}, target)
  if (gated(allowed)) return refusalOf(allowed)

  if (monthCloseOf(month)) {
    await recordRefusal(opened, 'month.close', 'STATE', target)
    return fail(text.monthAlreadyClosed)
  }
  addMonthClose({ month, byName: opened.context.account.displayName, at: new Date().toISOString() })
  await record(opened, 'month.close', allowed.rowId, { before: null, after: { month } }, undefined, target)
  refresh()
  return done(text.monthDone(month))
}
