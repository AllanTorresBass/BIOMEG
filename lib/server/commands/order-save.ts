import 'server-only'

import { createOrder, getOrder, orderForKey } from '@/lib/db/memory/order-store'
import { addEntry } from '@/lib/db/memory/payment-store'
import { demoSeed } from '@/lib/db/memory/seed'
import { activeCompanies, activePhysicians } from '@/lib/db/memory/registry-store'
import { PAYMENT_METHOD_IDS } from '@/lib/config/payment-methods'
import { auditEvent } from '@/lib/server/audit'
import { activeClient, done, fail, gate, gated, isResult, open, record, recordRefusal, refresh } from '@/lib/server/draft-gate'
import type { Opened } from '@/types/server/draft-gate.types'
import { computeOrderTotals, parseAmountCents, parsePercentBp } from '@/lib/domain/order-totals'
import { validateCedulaPair } from '@/lib/server/domain/client-rules'
import { centsToDecimal } from '@/lib/domain/pricing'
import { strings } from '@/lib/strings'
import { LAB_TIME_ZONE, formatRate } from '@/lib/utils/format'
import type { DraftPayment, DraftResult, PaymentInput, PersonalInput, SaveInput, SaveResult } from '@/types/orders/draft.types'

const text = strings.pendingReview.orders

function activeConvenio(id: string | null) {
  return id ? (activeCompanies().find((company) => company.id === id) ?? null) : null
}

function clockTime(iso: string): string {
  return new Intl.DateTimeFormat('es-VE', { timeZone: LAB_TIME_ZONE, hour: '2-digit', minute: '2-digit', hour12: false }).format(
    new Date(iso),
  )
}

/** Keeps the seven rows in their fixed order and turns every typed amount into a clean decimal, or "" for none. */
function cleanPayments(rows: readonly DraftPayment[]): DraftPayment[] | null {
  const cleaned: DraftPayment[] = []
  for (const method of PAYMENT_METHOD_IDS) {
    const row = rows.find((candidate) => candidate.method === method)
    if (!row) return null
    const cents = parseAmountCents(row.amount)
    if (cents === null) return null
    cleaned.push({
      method,
      amount: cents > 0 ? centsToDecimal(cents) : '',
      bank: cents > 0 ? row.bank.trim().slice(0, 60) : '',
      reference: cents > 0 ? row.reference.trim().slice(0, 60) : '',
    })
  }
  return cleaned
}

export async function savePersonal(input: PersonalInput): Promise<DraftResult> {
  const opened = await open(input.draftId)
  if (isResult(opened)) return opened
  const allowed = await gate(opened, 'order.open', {})
  if (gated(allowed)) return allowed

  if (input.physicianId !== null && !activePhysicians().some((physician) => physician.id === input.physicianId)) {
    return fail(text.physicianMissing)
  }
  const before = { physicianId: opened.draft.physicianId }
  opened.draft.physicianId = input.physicianId
  await record(opened, 'order.open', allowed.rowId, { before, after: { physicianId: input.physicianId } })
  refresh()
  return done(text.personalSaved)
}

export async function savePayment(input: PaymentInput): Promise<DraftResult> {
  const opened = await open(input.draftId)
  if (isResult(opened)) return opened
  const allowed = await gate(opened, 'order.open', {})
  if (gated(allowed)) return allowed
  const { draft } = opened

  const payments = cleanPayments(input.payments)
  if (!payments) return fail(text.amountInvalid)

  const bp = parsePercentBp(input.discountPct)
  if (bp === null) return fail(text.discountInvalid)
  if (bp > 0) {
    const limitBp = Math.round(demoSeed.settings.discountLimit * 100)
    const discount = await gate(opened, 'order.discount', { within_limit: bp <= limitBp }, { motivo: input.discountMotivo })
    if (gated(discount)) return discount
  }

  if (input.convenioId !== null && !activeConvenio(input.convenioId)) return fail(text.convenioInvalid)

  const before = {
    convenioId: draft.convenioId,
    titular: draft.titular,
    razonSocial: draft.billing.razonSocial,
    payments: draft.payments,
    discountPct: draft.discountPct,
  }
  draft.convenioId = input.convenioId
  draft.titular = input.titular.trim().slice(0, 120)
  draft.billing = { ...draft.billing, razonSocial: input.razonSocial.trim().slice(0, 120) }
  draft.payments = payments
  draft.discountPct = input.discountPct.trim() === '' ? '0' : input.discountPct.trim()
  draft.discountMotivo = bp > 0 ? input.discountMotivo.trim().slice(0, 200) : ''
  await record(
    opened,
    'order.open',
    allowed.rowId,
    {
      before,
      after: {
        convenioId: draft.convenioId,
        titular: draft.titular,
        razonSocial: draft.billing.razonSocial,
        payments: draft.payments,
        discountPct: draft.discountPct,
      },
    },
    bp > 0 ? draft.discountMotivo : undefined,
  )
  refresh()
  return done(text.paymentSaved)
}

function saveFail(message: string, need: SaveResult['need'] = null): SaveResult {
  return { ok: false, message, need, orderId: null, reload: false }
}

function saved(orderId: string, message = ''): SaveResult {
  return { ok: true, message, need: null, orderId, reload: false }
}

/** What an order of this kind needs before it can exist. Null when nothing is missing. */
function missingFor(opened: Opened): string | null {
  const { draft } = opened
  const client = activeClient(draft.clientId)
  if (!client) return strings.orders.clientNotFound
  if (draft.lines.length === 0) return text.needLines
  const pair = validateCedulaPair(draft.billing.cedulaType ?? '', draft.billing.cedulaNumber ?? '')
  if (!pair.ok) {
    const errors = strings.pendingReview.clients.errors
    return pair.refusal.code in errors ? errors[pair.refusal.code as keyof typeof errors] : text.notAllowed
  }
  if (!client.verified && !pair.type) return text.needBillingCedula
  if (draft.costType === 'SEGURO_EMPRESA' && draft.billing.razonSocial.trim() === '') return text.needRazonSocial
  if (draft.path === 'EMPRESA') {
    const convenio = activeConvenio(draft.convenioId)
    if (!convenio) return text.needConvenio
    if (draft.billing.razonSocial.trim() === '') return text.needRazonSocial
    if (convenio.requiresTitular && draft.titular.trim() === '') return text.needTitular
  }
  return null
}

/**
 * Guardar. The key makes a double-click safe: the same key twice returns the one order. A different
 * key on a draft that already became an order is the second saver, who is told who saved it and when.
 */
export async function saveOrder(input: SaveInput): Promise<SaveResult> {
  const opened = await open(input.draftId)
  if (isResult(opened)) return saveFail(opened.message)
  const { draft, context } = opened

  const sameAttempt = orderForKey(input.key)
  if (sameAttempt) return saved(sameAttempt.id)

  if (draft.savedOrderId) {
    const winner = getOrder(draft.savedOrderId)
    await recordRefusal(opened, 'order.save.refused', 'STATE', {
      recordType: 'order',
      recordId: draft.savedOrderId,
      state: 'ABIERTA',
    })
    return {
      ok: false,
      message: winner ? text.savedBy(winner.savedByName, clockTime(winner.savedAt)) : text.alreadySaved,
      need: null,
      orderId: draft.savedOrderId,
      reload: true,
    }
  }

  try {
    const allowed = await gate(opened, 'order.save', {})
    if (gated(allowed)) return saveFail(text.saveFailed)

    const missing = missingFor(opened)
    if (missing) return saveFail(missing)

    const bp = parsePercentBp(draft.discountPct) ?? 0
    let discountRowId: string | null = null
    if (bp > 0) {
      const limitBp = Math.round(demoSeed.settings.discountLimit * 100)
      const discount = await gate(opened, 'order.discount', { within_limit: bp <= limitBp }, { motivo: draft.discountMotivo })
      if (gated(discount)) return saveFail(discount.message || text.saveFailed, discount.need === 'MOTIVO' ? 'DISCOUNT_MOTIVO' : null)
      discountRowId = discount.rowId
    }

    const { settings } = demoSeed
    if (input.rateSeen !== settings.rateBs && input.confirmRate !== true) {
      await auditEvent({
        command: 'order.save',
        event: 'order.rate.warn',
        outcome: 'REFUSED',
        reason: 'STATE',
        session: context.session,
        account: context.account,
        recordType: 'order_draft',
        recordId: draft.id,
      })
      return saveFail(text.rateChangedBody(formatRate(input.rateSeen), formatRate(settings.rateBs)), 'RATE_CHANGED')
    }

    const client = activeClient(draft.clientId)
    if (!client) return saveFail(strings.orders.clientNotFound)
    const payments = draft.payments.filter((payment) => payment.amount !== '')
    const physician = activePhysicians().find((candidate) => candidate.id === draft.physicianId) ?? null
    const convenio = activeConvenio(draft.convenioId)
    const totals = computeOrderTotals({
      lines: draft.lines,
      rate: settings.rateBs === '' ? null : settings.rateBs,
      ivaRate: settings.ivaRate,
      igtfRate: settings.igtfRate,
      discountPct: draft.discountPct,
      payments,
    })

    const order = createOrder(
      input.key,
      {
        clientId: client.id,
        clientName: client.fullName,
        path: draft.path,
        physicianId: physician?.id ?? null,
        physicianName: physician?.name ?? null,
        convenioId: convenio?.id ?? null,
        convenioName: convenio?.name ?? null,
        titular: draft.titular,
        billing: draft.billing,
        costType: draft.costType,
        motivo: draft.motivo,
        sampleDate: draft.sampleDate,
        lines: draft.lines,
        payments,
        discountPct: draft.discountPct,
        discountMotivo: draft.discountMotivo,
        rateBs: settings.rateBs,
        rateDate: settings.rateDate,
        ivaRate: settings.ivaRate,
        igtfRate: settings.igtfRate,
        totals,
        savedById: context.account.id,
        savedByName: context.account.displayName,
        savedAt: new Date().toISOString(),
      },
      draft.lines.map((line) => line.examId),
    )
    draft.savedOrderId = order.id

    const target = { recordType: 'order', recordId: order.id, state: order.state }
    await record(opened, 'order.save', allowed.rowId, { before: null, after: { number: order.number, totals } }, undefined, target)
    if (bp > 0) {
      await record(
        opened,
        'order.discount',
        discountRowId,
        { before: '0', after: draft.discountPct },
        draft.discountMotivo || undefined,
        target,
      )
    }
    if (payments.length > 0) {
      const paymentAllowed = await gate(opened, 'payment.record', {}, {}, target)
      if (!gated(paymentAllowed)) {
        for (const payment of payments) {
          addEntry({
            ...payment,
            orderId: order.id,
            orderNumber: order.number,
            invoiceNumber: order.invoiceNumber,
            at: order.savedAt,
            byId: context.account.id,
            byName: context.account.displayName,
            workstation: context.session.workstation,
            reversesId: null,
            motivo: null,
          })
          await record(opened, 'payment.record', paymentAllowed.rowId, { before: null, after: payment }, undefined, target)
        }
      }
    }
    refresh()
    return saved(order.id)
  } catch {
    return saveFail(text.saveFailed)
  }
}
