import { COST_TYPE_LABELS, PRICE_COLUMN_LABELS } from '@/lib/config/price-defaults'
import { totalsOf } from '@/lib/server/domain/pricing'
import { strings } from '@/lib/strings'
import { formatMoney, formatPrice, formatRate } from '@/lib/utils/format'
import type { DemoPriceRow } from '@/types/domain/demo.types'
import type { CatalogOption, DraftLine, DraftLineView, DraftTotalsView } from '@/types/orders/draft.types'

const text = strings.pendingReview.orders

export function toLineView(line: DraftLine): DraftLineView {
  const priced = line.priceUsd !== null
  return {
    id: line.id,
    examName: line.examName,
    costTypeLabel: line.costType ? COST_TYPE_LABELS[line.costType] : strings.empty.dash,
    columnLabel: line.column ? PRICE_COLUMN_LABELS[line.column] : text.noColumn,
    currency: priced ? 'USD' : strings.empty.dash,
    priceText: formatPrice(line.priceUsd),
    sinPrecio: !priced,
    basisLabel: priced ? (line.basis === 'SABADO' ? text.saturdayPrice : text.ordinaryPrice) : '',
    available: line.status === 'DISPONIBLE',
    repeated: line.repeatMotivo !== null,
  }
}

export function toTotalsView(lines: readonly DraftLine[], rate: string): DraftTotalsView {
  const totals = totalsOf(lines, rate === '' ? null : rate)
  return {
    countText: lines.length === 1 ? text.countOne : text.countMany(lines.length),
    usd: formatMoney(totals.usd),
    rate: rate === '' ? null : formatRate(rate),
    bs: totals.bs === null ? null : formatMoney(totals.bs),
    hasSinPrecio: totals.sinPrecioCount > 0,
  }
}

export function toCatalog(rows: readonly DemoPriceRow[]): CatalogOption[] {
  return rows.map((row) => ({ id: row.id, name: row.name, available: row.status === 'DISPONIBLE' }))
}
