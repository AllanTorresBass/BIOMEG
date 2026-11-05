import Link from 'next/link'
import { OrderActions } from '@/components/orders/OrderActions'
import { BlockedNotice } from '@/components/shared/BlockedNotice'
import { StatusChip } from '@/components/shared/StatusChip'
import { getOrder } from '@/lib/db/memory/order-store'
import { guardRoute } from '@/lib/server/guard'
import { requireReadyStaff } from '@/lib/server/session/require'
import { strings } from '@/lib/strings'
import { LAB_TIME_ZONE, formatMoney } from '@/lib/utils/format'

const text = strings.pendingReview.orders

function timeText(iso: string): string {
  return new Intl.DateTimeFormat('es-VE', { timeZone: LAB_TIME_ZONE, dateStyle: 'short', timeStyle: 'short' }).format(new Date(iso))
}

export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const context = await requireReadyStaff()
  if (context.locked) return null
  const { id } = await params
  if (!(await guardRoute(context, ['order.open'], `/ordenes/${id}`))) return <BlockedNotice />

  const order = getOrder(id)
  if (!order) return <p className="text-muted-foreground">{text.orderMissing}</p>

  const rows: [string, string][] = [
    [text.savedPatient, order.clientName],
    [text.totalUsdLabel, formatMoney(order.totals.totalUsd)],
    [text.totalBsLabel, order.totals.totalBs === null ? strings.empty.dash : formatMoney(order.totals.totalBs)],
    [text.savedPaid, formatMoney(order.totals.abono)],
    [text.resta, formatMoney(order.totals.resta)],
  ]

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-xl font-semibold">{text.orderTitle(order.number)}</h1>
        <StatusChip status={order.state} />
      </div>

      {order.voided ? (
        <div role="note" className="rounded-[var(--radius-card)] border border-flag-blocked bg-card p-4">
          <p className="font-semibold">{text.voidBanner(order.voided.byName, timeText(order.voided.at), order.voided.motivo)}</p>
          {order.voided.creditNote ? (
            <p className="text-muted-foreground">
              {text.creditNoteLabel}: <span className="font-semibold tabular-nums">{order.voided.creditNote}</span>
            </p>
          ) : null}
        </div>
      ) : null}

      <dl className="grid gap-x-6 gap-y-1 rounded-[var(--radius-card)] border border-border bg-card p-4 sm:grid-cols-2">
        {rows.map(([label, value]) => (
          <div key={label} className="flex justify-between gap-4">
            <dt className="text-muted-foreground">{label}</dt>
            <dd className="font-semibold tabular-nums">{value}</dd>
          </div>
        ))}
      </dl>

      <OrderActions
        orderId={order.id}
        voided={order.state === 'ANULADA'}
        hasPayment={order.payments.some((payment) => payment.amount !== '')}
        lines={order.lines.map((line) => ({ id: line.id, name: line.examName, priceUsd: line.priceUsd }))}
      />

      <Link href="/ordenes/nueva" className="w-fit font-semibold underline">
        {text.newOrder}
      </Link>
    </section>
  )
}
