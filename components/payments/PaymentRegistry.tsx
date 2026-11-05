'use client'

import { GestureDialogs } from '@/components/payments/GestureDialogs'
import { DataTable } from '@/components/shared/DataTable'
import { useGestureCommand } from '@/hooks/use-gesture-command'
import { usePaymentCommands } from '@/hooks/use-payments'
import { strings } from '@/lib/strings'
import type { PaymentRegistryProps } from '@/types/orders/payment-screens.props'
import type { PaymentRow, SelfReversalRow } from '@/types/orders/payment.types'
import type { DataTableColumn } from '@/types/shared/data-table.props'

const text = strings.pendingReview.payments

export function PaymentRegistry({ rows, selfReversals, seesAll }: PaymentRegistryProps) {
  const { reversePayment } = usePaymentCommands()
  const gesture = useGestureCommand()

  const columns: DataTableColumn<PaymentRow>[] = [
    { key: 'when', header: text.when, rowHeader: true, className: 'tabular-nums', cell: (row) => row.atText },
    { key: 'invoice', header: text.invoice, className: 'tabular-nums', cell: (row) => row.invoiceNumber },
    { key: 'method', header: text.method, cell: (row) => row.methodLabel },
    { key: 'bank', header: text.bank, cell: (row) => row.bank || null },
    { key: 'reference', header: text.reference, cell: (row) => row.reference || null },
    { key: 'amount', header: text.amount, className: 'tabular-nums', cell: (row) => `${row.amountText} ${row.currency}` },
    { key: 'user', header: text.user, cell: (row) => `${row.byName} · ${row.workstation}` },
    { key: 'status', header: text.status, cell: (row) => text.statuses[row.status] },
    {
      key: 'actions',
      header: <span className="sr-only">{text.reverse}</span>,
      cell: (row) =>
        row.canReverse ? (
          <button
            type="button"
            onClick={() =>
              gesture.ask({
                title: text.reverseTitle,
                body: text.reverseBody,
                confirmLabel: text.reverse,
                motivoRequired: true,
                command: (presented) => reversePayment({ paymentId: row.id, ...presented }),
              })
            }
            className="h-9 rounded-[var(--radius-control)] border border-border-strong bg-card px-3 font-semibold"
          >
            {text.reverse}
          </button>
        ) : (
          ''
        ),
    },
  ]

  const selfColumns: DataTableColumn<SelfReversalRow>[] = [
    { key: 'when', header: text.when, rowHeader: true, className: 'tabular-nums', cell: (row) => row.atText },
    { key: 'invoice', header: text.invoice, className: 'tabular-nums', cell: (row) => row.invoiceNumber },
    { key: 'user', header: text.user, cell: (row) => row.byName },
    { key: 'amount', header: text.amount, className: 'tabular-nums', cell: (row) => `${row.amountText} ${row.currency}` },
    { key: 'motivo', header: text.motivo, cell: (row) => row.motivo },
  ]

  return (
    <div className="flex flex-col gap-6">
      <DataTable caption={text.registryTitle} columns={columns} rows={rows} rowKey={(row) => row.id} emptyText={text.none} />
      {seesAll ? (
        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold">{text.selfTitle}</h2>
          <DataTable caption={text.selfTitle} columns={selfColumns} rows={selfReversals} rowKey={(row) => row.id} emptyText={text.selfNone} />
        </section>
      ) : null}
      <GestureDialogs gesture={gesture} />
    </div>
  )
}
