'use client'

import { useRouter } from 'next/navigation'
import { GestureDialogs } from '@/components/payments/GestureDialogs'
import { DataTable } from '@/components/shared/DataTable'
import { useGestureCommand } from '@/hooks/use-gesture-command'
import { usePaymentCommands } from '@/hooks/use-payments'
import { strings } from '@/lib/strings'
import { formatMoney, formatRate } from '@/lib/utils/format'
import type { CashClosePanelProps } from '@/types/orders/payment-screens.props'
import type { CashInvoice, CloseRow } from '@/types/orders/payment.types'
import type { DataTableColumn } from '@/types/shared/data-table.props'

const text = strings.pendingReview.payments
const BUTTON = 'h-10 self-start rounded-[var(--radius-control)] bg-primary px-4 font-semibold text-primary-foreground disabled:opacity-60'

const invoiceColumns: DataTableColumn<CashInvoice>[] = [
  { key: 'invoice', header: text.invoice, rowHeader: true, className: 'tabular-nums', cell: (row) => row.invoiceNumber },
  { key: 'patient', header: text.patient, cell: (row) => row.clientName },
  { key: 'total', header: text.total, className: 'tabular-nums', cell: (row) => formatMoney(row.totalUsd) },
  { key: 'resta', header: text.resta, className: 'tabular-nums', cell: (row) => formatMoney(row.resta) },
]

export function CashClosePanel({ userId, isOwn, drawers, summary, closes }: CashClosePanelProps) {
  const { closeCash, reopenCash } = usePaymentCommands()
  const gesture = useGestureCommand()
  const router = useRouter()
  const ownerName = drawers.find((drawer) => drawer.id === userId)?.name ?? ''

  const closeColumns: DataTableColumn<CloseRow>[] = [
    { key: 'when', header: text.when, rowHeader: true, className: 'tabular-nums', cell: (row) => row.atText },
    { key: 'user', header: text.user, cell: (row) => row.userName },
    { key: 'by', header: text.closedBy, cell: (row) => row.closedByName },
    { key: 'usd', header: text.totalUsd, className: 'tabular-nums', cell: (row) => formatMoney(row.totalUsd) },
    { key: 'bs', header: text.totalBs, className: 'tabular-nums', cell: (row) => formatMoney(row.totalBs) },
    { key: 'resta', header: text.restaOpen, className: 'tabular-nums', cell: (row) => formatMoney(row.restaOpen) },
    {
      key: 'actions',
      header: <span className="sr-only">{text.reopen}</span>,
      cell: (row) =>
        row.reopened ? (
          text.reopened
        ) : row.canReopen ? (
          <button
            type="button"
            onClick={() =>
              gesture.ask({
                title: text.reopenTitle,
                body: text.reopenBody,
                confirmLabel: text.reopen,
                motivoRequired: true,
                command: (presented) => reopenCash({ closeId: row.id, ...(presented.motivo ? { motivo: presented.motivo } : {}) }),
              })
            }
            className="h-9 rounded-[var(--radius-control)] border border-border-strong bg-card px-3 font-semibold"
          >
            {text.reopen}
          </button>
        ) : (
          ''
        ),
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      {drawers.length > 1 ? (
        <label className="flex max-w-sm flex-col gap-1">
          <span className="font-semibold">{text.drawerOf}</span>
          <select
            value={userId}
            onChange={(event) => router.push(`/pagos/cierre?usuario=${encodeURIComponent(event.target.value)}`)}
            className="h-10 rounded-[var(--radius-control)] border border-border-strong bg-background px-3"
          >
            {drawers.map((drawer) => (
              <option key={drawer.id} value={drawer.id}>
                {drawer.name}
              </option>
            ))}
          </select>
        </label>
      ) : null}

      <dl className="grid gap-x-6 gap-y-1 rounded-[var(--radius-card)] border border-border bg-card p-4 sm:grid-cols-2">
        {[
          [text.totalUsd, formatMoney(summary.totalUsd)],
          [text.totalBs, formatMoney(summary.totalBs)],
          [text.rate, summary.rate ? formatRate(summary.rate) : strings.empty.dash],
          [text.restaOpen, formatMoney(summary.restaOpen)],
        ].map(([label, value]) => (
          <div key={label} className="flex justify-between gap-4">
            <dt className="text-muted-foreground">{label}</dt>
            <dd className="font-semibold tabular-nums">{value}</dd>
          </div>
        ))}
      </dl>

      {summary.byWorkstation.length > 0 ? (
        <section className="flex flex-col gap-1">
          <h2 className="font-semibold">{text.byWorkstation}</h2>
          <ul className="tabular-nums">
            {summary.byWorkstation.map((row) => (
              <li key={row.workstation}>
                {row.workstation}: {formatMoney(row.totalUsd)} USD · {formatMoney(row.totalBs)} Bs
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="flex flex-col gap-2">
        <h2 className="font-semibold">{text.openInvoices}</h2>
        <DataTable caption={text.openInvoices} columns={invoiceColumns} rows={summary.openInvoices} rowKey={(row) => row.orderId} emptyText={text.noInvoices} />
      </section>
      <section className="flex flex-col gap-2">
        <h2 className="font-semibold">{text.paidInvoices}</h2>
        <DataTable caption={text.paidInvoices} columns={invoiceColumns} rows={summary.paidInvoices} rowKey={(row) => row.orderId} emptyText={text.noInvoices} />
      </section>

      <button
        type="button"
        disabled={summary.entryCount === 0}
        onClick={() => {
          // Closing one's own drawer has no gesture in R-062. Another's needs a motivo and a re-entry (R-063).
          if (isOwn) return void gesture.attempt(() => closeCash({ userId }), {})
          gesture.ask({
            title: text.closeTitle,
            body: `${text.closeOtherBody(ownerName)} ${text.closeBody}`,
            confirmLabel: text.closeButton,
            motivoRequired: true,
            command: (presented) => closeCash({ userId, ...(presented.motivo ? { motivo: presented.motivo } : {}) }),
          })
        }}
        className={BUTTON}
      >
        {text.closeButton}
      </button>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold">{text.closesTitle}</h2>
        <DataTable caption={text.closesTitle} columns={closeColumns} rows={closes} rowKey={(row) => row.id} emptyText={text.noInvoices} />
      </section>
      <GestureDialogs gesture={gesture} />
    </div>
  )
}
