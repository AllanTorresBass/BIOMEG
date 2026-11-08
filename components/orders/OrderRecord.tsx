'use client'

import Link from 'next/link'
import { OrderActions } from '@/components/orders/OrderActions'
import { RecordTabs } from '@/components/shared/RecordTabs'
import { StaffBreadcrumb } from '@/components/shared/StaffBreadcrumb'
import { StatusChip } from '@/components/shared/StatusChip'
import { strings } from '@/lib/strings'
import { formatMoney } from '@/lib/utils/format'
import type { OrderRecordProps } from '@/types/orders/order-record.props'

const text = strings.pendingReview.orders
const hub = strings.pendingReview.orderHub

export function OrderRecord({
  order,
  voidBanner,
  fromWorklist,
  canEnterResults,
  canOpenReport,
}: OrderRecordProps) {
  const current = text.orderTitle(order.number)
  const parentHref = fromWorklist ? '/hoja-de-trabajo' : '/ordenes'
  const parentLabel = fromWorklist ? strings.worklist.title : hub.listTitle
  const rows: [string, string][] = [
    [text.savedPatient, order.clientName],
    [text.totalUsdLabel, formatMoney(order.totals.totalUsd)],
    [text.totalBsLabel, order.totals.totalBs === null ? strings.empty.dash : formatMoney(order.totals.totalBs)],
    [text.savedPaid, formatMoney(order.totals.abono)],
    [text.resta, formatMoney(order.totals.resta)],
  ]
  const tabs = [
    { id: 'orden', label: hub.orderTab },
    { id: 'acciones', label: hub.actionsTab },
  ]

  return (
    <section className="flex max-w-3xl flex-col gap-4">
      <StaffBreadcrumb
        label={hub.routeLabel}
        crumbs={[
          { label: parentLabel, href: parentHref },
          { label: current },
        ]}
      />

      <div className="flex flex-col gap-3 border-b-2 border-[var(--color-burgundy)] pb-3">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-xl font-semibold">{current}</h1>
          <StatusChip status={order.state} />
        </div>
      </div>

      {order.voided && voidBanner ? (
        <div role="note" className="rounded-[var(--radius-card)] border border-flag-blocked bg-card p-4">
          <p className="font-semibold">{voidBanner}</p>
          {order.voided.creditNote ? (
            <p className="text-muted-foreground">
              {text.creditNoteLabel}: <span className="font-semibold tabular-nums">{order.voided.creditNote}</span>
            </p>
          ) : null}
        </div>
      ) : null}

      <RecordTabs tabs={tabs} label={hub.tabsLabel} idPrefix="order" defaultTab="orden">
        {(active) => (
          <>
            <div
              role="tabpanel"
              id="order-panel-orden"
              aria-labelledby="order-tab-orden"
              hidden={active !== 'orden'}
              className="flex flex-col gap-4"
            >
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
                showVoid={false}
              />
            </div>

            <div
              role="tabpanel"
              id="order-panel-acciones"
              aria-labelledby="order-tab-acciones"
              hidden={active !== 'acciones'}
              className="flex flex-col gap-4"
            >
              <ul className="flex flex-col gap-2">
                {order.state === 'ANULADA' ? null : (
                  <li>
                    <Link
                      href={`/pagos/abono?o=${encodeURIComponent(order.id)}`}
                      className="inline-flex h-10 items-center font-semibold text-primary underline-offset-2 hover:underline"
                    >
                      {strings.pendingReview.payments.addAbono}
                    </Link>
                  </li>
                )}
                {canEnterResults ? (
                  <li>
                    <Link
                      href={`/ordenes/${encodeURIComponent(order.id)}/resultados`}
                      className="inline-flex h-10 items-center font-semibold text-primary underline-offset-2 hover:underline"
                    >
                      {strings.pendingReview.worklist.loadResults}
                    </Link>
                  </li>
                ) : null}
                {canOpenReport ? (
                  <li>
                    <Link
                      href={`/ordenes/${encodeURIComponent(order.id)}/reporte`}
                      className="inline-flex h-10 items-center font-semibold text-primary underline-offset-2 hover:underline"
                    >
                      {hub.openReport}
                    </Link>
                  </li>
                ) : null}
                <li>
                  <Link href="/ordenes/nueva" className="inline-flex h-10 items-center font-semibold text-primary underline-offset-2 hover:underline">
                    {text.newOrder}
                  </Link>
                </li>
              </ul>
              <OrderActions
                orderId={order.id}
                voided={order.state === 'ANULADA'}
                hasPayment={order.payments.some((payment) => payment.amount !== '')}
                lines={order.lines.map((line) => ({ id: line.id, name: line.examName, priceUsd: line.priceUsd }))}
                showLines={false}
              />
            </div>
          </>
        )}
      </RecordTabs>
    </section>
  )
}
