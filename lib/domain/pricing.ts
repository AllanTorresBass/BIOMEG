import { LAB_TIME_ZONE } from '@/lib/utils/format'
import type { DemoPriceRow } from '@/types/domain/demo.types'
import type { DraftLine, PriceColumn, PricingBasis } from '@/types/orders/draft.types'

/** "8.00" to 800. Money is kept in whole cents so sums never drift. */
export function parseCents(value: string): number {
  const [whole = '0', fraction = ''] = value.trim().split('.')
  return Number(whole) * 100 + Number(fraction.padEnd(2, '0').slice(0, 2))
}

export function centsToDecimal(cents: number): string {
  const sign = cents < 0 ? '-' : ''
  const abs = Math.abs(cents)
  return `${sign}${Math.floor(abs / 100)}.${String(abs % 100).padStart(2, '0')}`
}

/** The Saturday price is a switch for the whole laboratory. It only applies on a Saturday in Caracas. */
export function pricingBasis(saturdayEnabled: boolean, now: Date = new Date()): PricingBasis {
  const weekday = new Intl.DateTimeFormat('en-US', { timeZone: LAB_TIME_ZONE, weekday: 'short' }).format(now)
  return saturdayEnabled && weekday === 'Sat' ? 'SABADO' : 'ORDINARIO'
}

/**
 * The price read from the catalog when the line is priced. A missing column or a blank price is
 * null and shows SIN PRECIO. A stored "0.00" stays "0.00".
 */
export function priceFor(row: DemoPriceRow, column: PriceColumn | null): string | null {
  if (column === null) return null
  return row.prices[column].usd
}

export function bsFromUsdCents(usdCents: number, rate: string): string {
  return centsToDecimal(Math.round((usdCents * parseCents(rate)) / 100))
}

export interface LineTotals {
  usdCents: number
  usd: string
  bs: string | null
  pricedCount: number
  sinPrecioCount: number
}

/** A line without a price adds nothing and is counted apart so the screen can say so. */
export function totalsOf(lines: readonly Pick<DraftLine, 'priceUsd'>[], rate: string | null): LineTotals {
  let usdCents = 0
  let pricedCount = 0
  for (const line of lines) {
    if (line.priceUsd === null) continue
    usdCents += parseCents(line.priceUsd)
    pricedCount += 1
  }
  return {
    usdCents,
    usd: centsToDecimal(usdCents),
    bs: rate === null || rate === '' ? null : bsFromUsdCents(usdCents, rate),
    pricedCount,
    sinPrecioCount: lines.length - pricedCount,
  }
}
