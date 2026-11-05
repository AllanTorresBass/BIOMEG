'use client'

import { useState } from 'react'
import { GestureDialogs } from '@/components/payments/GestureDialogs'
import { DataTable } from '@/components/shared/DataTable'
import { useGestureCommand } from '@/hooks/use-gesture-command'
import { usePaymentCommands } from '@/hooks/use-payments'
import { strings } from '@/lib/strings'
import type { MonthClosePanelProps } from '@/types/orders/payment-screens.props'

const text = strings.pendingReview.payments

export function MonthClosePanel({ currentMonth, closes }: MonthClosePanelProps) {
  const { closeMonth } = usePaymentCommands()
  const gesture = useGestureCommand()
  const [month, setMonth] = useState(currentMonth)

  return (
    <div className="flex max-w-xl flex-col gap-4">
      <p>{text.monthNote}</p>
      <label className="flex flex-col gap-1">
        <span className="font-semibold">{text.monthLabel}</span>
        <input
          type="month"
          value={month}
          onChange={(event) => setMonth(event.target.value)}
          className="h-10 rounded-[var(--radius-control)] border border-border-strong bg-background px-3"
        />
      </label>
      <button
        type="button"
        disabled={month === ''}
        onClick={() => void gesture.attempt(() => closeMonth({ month }), {})}
        className="h-10 self-start rounded-[var(--radius-control)] bg-primary px-4 font-semibold text-primary-foreground disabled:opacity-60"
      >
        {text.monthButton}
      </button>
      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold">{text.monthsTitle}</h2>
        <DataTable
          caption={text.monthsTitle}
          columns={[
            { key: 'month', header: text.monthLabel, rowHeader: true, className: 'tabular-nums', cell: (row) => row.month },
            { key: 'by', header: text.closedBy, cell: (row) => row.byName },
            { key: 'when', header: text.when, className: 'tabular-nums', cell: (row) => row.atText },
          ]}
          rows={closes}
          rowKey={(row) => row.month}
          emptyText={text.monthsNone}
        />
      </section>
      <GestureDialogs gesture={gesture} />
    </div>
  )
}
