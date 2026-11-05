import { PAYMENT_METHODS } from '@/lib/config/payment-methods'
import { parseAmountCents } from '@/lib/domain/order-totals'
import { centsToDecimal } from '@/lib/domain/pricing'
import type { CashTotals, PaymentEntry, WorkstationTotals } from '@/types/orders/payment.types'

export function currencyOf(method: PaymentEntry['method']): 'USD' | 'BS' {
  return PAYMENT_METHODS.find((candidate) => candidate.id === method)?.currency ?? 'BS'
}

/** A reversal counts against the period it was made in. The original stays where it was. */
function signedCents(entry: PaymentEntry): number {
  const cents = parseAmountCents(entry.amount) ?? 0
  return entry.reversesId ? -cents : cents
}

export function cashTotalsOf(entries: readonly PaymentEntry[]): CashTotals {
  let usd = 0
  let bs = 0
  for (const entry of entries) {
    if (currencyOf(entry.method) === 'USD') usd += signedCents(entry)
    else bs += signedCents(entry)
  }
  return { totalUsd: centsToDecimal(usd), totalBs: centsToDecimal(bs) }
}

/** E-13: one person on two PCs closes once, with the rows labeled by workstation. */
export function totalsByWorkstation(entries: readonly PaymentEntry[]): WorkstationTotals[] {
  const names = [...new Set(entries.map((entry) => entry.workstation))].sort()
  return names.map((workstation) => ({
    workstation,
    ...cashTotalsOf(entries.filter((entry) => entry.workstation === workstation)),
  }))
}

/** The rows that still count toward an order's Abono: not reversals, and not reversed. */
export function activePayments(entries: readonly PaymentEntry[]): PaymentEntry[] {
  return entries.filter((entry) => entry.reversesId === null && entry.reversedById === null)
}
