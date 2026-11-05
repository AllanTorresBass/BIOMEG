import 'server-only'

import { revalidatePath } from 'next/cache'
import { decide } from '@/lib/auth/decide'
import { addNote, findNote, nextDebitNoteNumber } from '@/lib/db/memory/fiscal-store'
import { findOrderByNumber, findOrderByControl, getOrder, nextCreditNoteNumber, setControlNumber } from '@/lib/db/memory/order-store'
import { parseAmountCents } from '@/lib/domain/order-totals'
import { centsToDecimal } from '@/lib/domain/pricing'
import { auditEvent } from '@/lib/server/audit'
import { gate, gated, record, recordRefusal } from '@/lib/server/draft-gate'
import { invoiceDocument, noteDocument, orderDocument } from '@/lib/server/domain/fiscal-document'
import { getStaffContext, toDecisionSession } from '@/lib/server/session/current'
import { strings } from '@/lib/strings'
import type { AssignControlInput, IssueNoteInput, ReprintInput } from '@/types/orders/fiscal.schemas'
import type { FiscalDocumentView, ReprintKind, ReprintResult } from '@/types/orders/fiscal.types'
import type { SavedOrder } from '@/types/orders/order.types'
import type { PaymentResult } from '@/types/orders/payment.types'
import type { Subject } from '@/types/server/draft-gate.types'

const text = strings.pendingReview.fiscal

const REPRINT_COMMANDS: Record<ReprintKind, string> = {
  factura: 'reprint.invoice',
  'orden-entrega': 'reprint.delivery_order',
  'orden-empresa': 'reprint.company_order',
  'nota-credito': 'reprint.notes',
  'nota-debito': 'reprint.notes',
}

function fail(message: string, need: PaymentResult['need'] = null): PaymentResult {
  return { ok: false, message, need }
}

function refusalOf(answer: { message: string; need: string | null }): PaymentResult {
  const need = answer.need === 'CONFIRM_OVERRIDE' || answer.need === 'STEP_UP' || answer.need === 'MOTIVO' ? answer.need : null
  return fail(answer.message, need)
}

async function subject(): Promise<Subject | null> {
  const context = await getStaffContext()
  return !context || context.locked ? null : { context }
}

/** R-071. The method depends on a fiscal capture: this manual field stands in until a fiscal source exists. */
export async function assignControlNumber({ orderId, number }: AssignControlInput): Promise<PaymentResult> {
  const opened = await subject()
  if (!opened) return fail(text.notAllowed)
  const order = getOrder(orderId)
  if (!order) return fail(text.orderMissing)
  const target = { recordType: 'order', recordId: order.id, state: order.state }

  const allowed = await gate(opened, 'control.assign', {}, {}, target)
  if (gated(allowed)) return refusalOf(allowed)

  const typed = number.trim()
  if (order.controlNumber !== strings.orders.controlPending) {
    await recordRefusal(opened, 'control.assign', 'STATE', target)
    return fail(text.controlAlreadySet)
  }
  // A number is never reused, on any document.
  if (findOrderByControl(typed)) {
    await recordRefusal(opened, 'control.assign', 'STATE', target)
    return fail(text.controlDuplicate)
  }
  setControlNumber(order.id, typed)
  await record(opened, 'control.assign', allowed.rowId, { before: order.controlNumber, after: typed, field: 'controlNumber' }, undefined, target)
  revalidatePath('/documentos/control')
  return { ok: true, message: text.controlDone(typed), need: null }
}

/** R-066. A new document with its own number. The factura is not changed. */
export async function issueNote({ orderId, kind, lines }: IssueNoteInput): Promise<PaymentResult> {
  const opened = await subject()
  if (!opened) return fail(text.notAllowed)
  const order = getOrder(orderId)
  if (!order) return fail(text.orderMissing)
  const target = { recordType: 'order', recordId: order.id, state: order.state }

  const allowed = await gate(opened, kind === 'CREDITO' ? 'note.credit' : 'note.debit', {}, {}, target)
  if (gated(allowed)) return refusalOf(allowed)

  let cents = 0
  const clean = []
  for (const line of lines) {
    const lineCents = parseAmountCents(line.amount)
    if (lineCents === null || lineCents <= 0) return fail(text.badAmount)
    cents += lineCents
    clean.push({ description: line.description.trim(), amount: centsToDecimal(lineCents) })
  }

  const note = addNote({
    kind,
    number: kind === 'CREDITO' ? nextCreditNoteNumber() : nextDebitNoteNumber(),
    orderId: order.id,
    invoiceNumber: order.invoiceNumber,
    clientName: order.clientName,
    lines: clean,
    total: centsToDecimal(cents),
    rateBs: order.rateBs,
    at: new Date().toISOString(),
    byName: opened.context.account.displayName,
  })
  await record(opened, 'note.issue', allowed.rowId, { before: null, after: { number: note.number, kind, total: note.total } }, undefined, target)
  return { ok: true, message: text.noteDone(note.number), need: null }
}

function hasSinPrecio(order: SavedOrder): boolean {
  return order.lines.some((line) => line.priceUsd === null)
}

function documentFor(kind: ReprintKind, number: string): { document: FiscalDocumentView; recordId: string; refusal: string | null } | null {
  if (kind === 'nota-credito' || kind === 'nota-debito') {
    const note = findNote(kind === 'nota-credito' ? 'CREDITO' : 'DEBITO', number)
    return note ? { document: noteDocument(note), recordId: note.id, refusal: null } : null
  }
  const order = findOrderByNumber(number)
  if (!order) return null
  if (kind !== 'factura') return { document: orderDocument(order, text.kinds[kind]), recordId: order.id, refusal: null }
  const refusal =
    order.controlNumber === strings.orders.controlPending ? text.controlMissing : hasSinPrecio(order) ? text.sinPrecioBlocks : null
  return { document: invoiceDocument(order), recordId: order.id, refusal }
}

/** R-068 to R-070. Opens the stored document and allocates no number. The paper reads COPIA. */
export async function reprintDocument({ kind, number }: ReprintInput): Promise<ReprintResult> {
  const context = await getStaffContext()
  if (!context || context.locked) return { ok: false, message: text.notAllowed, need: null }
  const command = REPRINT_COMMANDS[kind]
  const decision = decide({ session: toDecisionSession(context), command })
  const base = { session: context.session, account: context.account, rowId: decision.rowId }
  if (!decision.allowed) {
    await auditEvent({ ...base, command: 'document.reprint', outcome: 'REFUSED', reason: decision.reason, recordType: 'document', recordId: kind })
    return { ok: false, message: text.notAllowed, need: null }
  }

  const found = documentFor(kind, number.trim())
  if (!found) return { ok: false, message: text.notFound, need: null }
  if (found.refusal) {
    await auditEvent({ ...base, command: 'document.reprint', outcome: 'REFUSED', reason: 'STATE', recordType: 'document', recordId: found.recordId, state: kind })
    return { ok: false, message: found.refusal, need: null }
  }
  await auditEvent({ ...base, command: 'document.reprint', outcome: 'ALLOWED', recordType: 'document', recordId: found.recordId, state: kind })
  return { ok: true, message: text.reprintDone, need: null, document: found.document }
}
