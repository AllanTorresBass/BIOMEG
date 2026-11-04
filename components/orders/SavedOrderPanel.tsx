import Link from 'next/link'
import { StatusChip } from '@/components/shared/StatusChip'
import { strings } from '@/lib/strings'
import { formatMoney } from '@/lib/utils/format'
import type { SavedOrderPanelProps } from '@/types/orders/screen.types'

const text = strings.pendingReview.orders

export function SavedOrderPanel(props: SavedOrderPanelProps) {
  const rows: [string, string][] = [
    [text.orderNumber, props.number],
    [text.savedPatient, props.clientName],
    [text.savedExams, String(props.examCount)],
    [text.totalUsdLabel, formatMoney(props.totalUsd)],
    [text.totalBsLabel, props.totalBs === null ? strings.empty.dash : formatMoney(props.totalBs)],
    [text.savedPaid, formatMoney(props.abono)],
    [text.resta, formatMoney(props.resta)],
  ]
  return (
    <div className="flex flex-col gap-4 rounded-[var(--radius-card)] border border-border bg-card p-4">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-lg font-semibold">{text.savedTitle}</h2>
        <StatusChip status="ABIERTA" />
      </div>
      <dl className="grid gap-x-6 gap-y-1 sm:grid-cols-2">
        {rows.map(([label, value]) => (
          <div key={label} className="flex justify-between gap-4">
            <dt className="text-muted-foreground">{label}</dt>
            <dd className="font-semibold tabular-nums">{value}</dd>
          </div>
        ))}
      </dl>
      <p className="text-sm text-muted-foreground">{text.savedBy(props.savedBy, props.savedAtText)}</p>
      <div className="flex flex-wrap gap-2">
        <Link
          href={`/ordenes/${props.orderId}`}
          className="inline-flex h-11 items-center rounded-[var(--radius-control)] border border-border-strong px-4 font-semibold"
        >
          {text.viewOrder}
        </Link>
        <Link
          href="/ordenes/nueva"
          className="inline-flex h-11 items-center rounded-[var(--radius-control)] bg-primary px-4 font-semibold text-primary-foreground"
        >
          {text.newOrder}
        </Link>
        <Link
          href="/"
          className="inline-flex h-11 items-center rounded-[var(--radius-control)] border border-border-strong px-4 font-semibold"
        >
          {text.exit}
        </Link>
      </div>
    </div>
  )
}
