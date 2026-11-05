import { PAYMENT_METHODS } from '@/lib/config/payment-methods'
import { bsFromUsdCents, centsToDecimal, parseCents } from '@/lib/domain/pricing'
import type { OrderTotals, TotalsInput } from '@/types/domain/order-totals.types'

/** Pure on purpose: the Pago screen runs it on every keystroke and the server runs it again on Guardar. */

/** Accepts "12,50", "1.234,56" and "12.50". Returns whole cents, or null when the text is not an amount. */
export function parseAmountCents(typed: string): number | null {
  const trimmed = typed.trim().replace(/\s/g, '')
  if (trimmed === '') return 0
  const normalized = trimmed.includes(',') ? trimmed.replace(/\./g, '').replace(',', '.') : trimmed
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) return null
  return parseCents(normalized)
}

/** A percent as basis points: "12.5" is 1250. Null when it is not a number from 0 to 100. */
export function parsePercentBp(typed: string): number | null {
  const trimmed = typed.trim().replace(',', '.')
  if (trimmed === '') return 0
  if (!/^\d+(\.\d{1,2})?$/.test(trimmed)) return null
  const bp = Math.round(Number(trimmed) * 100)
  return bp <= 10_000 ? bp : null
}

function configured(rate: string | null): rate is string {
  return rate !== null && rate.trim() !== ''
}

function ofBp(cents: number, bp: number): number {
  return Math.round((cents * bp) / 10_000)
}

/**
 * IVA and IGTF come from laboratory settings. While a rate is empty it computes 0,00, never a rate
 * remembered from elsewhere. No exempt flag exists in the catalog yet, so Total exento is 0,00 and the
 * whole net amount is the taxable base.
 */
export function computeOrderTotals(input: TotalsInput): OrderTotals {
  const subCents = input.lines.reduce((sum, line) => sum + (line.priceUsd === null ? 0 : parseCents(line.priceUsd)), 0)
  const discountBp = parsePercentBp(input.discountPct) ?? 0
  const discountCents = ofBp(subCents, discountBp)
  const baseCents = subCents - discountCents

  const ivaConfigured = configured(input.ivaRate)
  const igtfConfigured = configured(input.igtfRate)
  const ivaBp = ivaConfigured ? (parsePercentBp(input.ivaRate ?? '') ?? 0) : 0
  const igtfBp = igtfConfigured ? (parsePercentBp(input.igtfRate ?? '') ?? 0) : 0

  const rateCents = configured(input.rate) ? parseCents(input.rate) : 0
  let foreignCents = 0
  let bsCents = 0
  for (const payment of input.payments) {
    const cents = parseAmountCents(payment.amount) ?? 0
    const method = PAYMENT_METHODS.find((candidate) => candidate.id === payment.method)
    if (method?.currency === 'USD') foreignCents += cents
    else bsCents += cents
  }

  const ivaCents = ofBp(baseCents, ivaBp)
  const igtfCents = ofBp(foreignCents, igtfBp)
  const totalCents = baseCents + ivaCents + igtfCents
  const bsAsUsd = rateCents > 0 ? Math.round((bsCents * 100) / rateCents) : 0
  const abonoCents = foreignCents + bsAsUsd

  return {
    subTotal: centsToDecimal(subCents),
    exento: centsToDecimal(0),
    base: centsToDecimal(baseCents),
    iva: centsToDecimal(ivaCents),
    igtf: centsToDecimal(igtfCents),
    discount: centsToDecimal(discountCents),
    discountPct: input.discountPct.trim() === '' ? '0' : input.discountPct.trim(),
    totalUsd: centsToDecimal(totalCents),
    totalBs: configured(input.rate) ? bsFromUsdCents(totalCents, input.rate) : null,
    abono: centsToDecimal(abonoCents),
    resta: centsToDecimal(Math.max(0, totalCents - abonoCents)),
    ivaConfigured,
    igtfConfigured,
  }
}
