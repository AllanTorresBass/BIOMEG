'use client'

import { useState } from 'react'
import { DataTable } from '@/components/shared/DataTable'
import { useFiscalCommands } from '@/hooks/use-fiscal'
import { strings } from '@/lib/strings'
import { formatMoney } from '@/lib/utils/format'
import type { ControlPanelProps } from '@/types/orders/fiscal-screens.props'
import type { PendingControlRow } from '@/types/orders/fiscal.types'
import type { DataTableColumn } from '@/types/shared/data-table.props'

const text = strings.pendingReview.fiscal

function AssignField({ orderId }: { orderId: string }) {
  const { assignControl } = useFiscalCommands()
  const [value, setValue] = useState('')
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        void assignControl({ orderId, number: value }).catch(() => undefined)
      }}
      className="flex flex-wrap gap-2"
    >
      <input
        aria-label={text.controlNumber}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        required
        autoComplete="off"
        className="h-9 w-40 rounded-[var(--radius-control)] border border-border-strong bg-background px-2 tabular-nums"
      />
      <button type="submit" className="h-9 rounded-[var(--radius-control)] border border-border-strong bg-card px-3 font-semibold">
        {text.assign}
      </button>
    </form>
  )
}

const columns: DataTableColumn<PendingControlRow>[] = [
  { key: 'invoice', header: text.kinds.factura, rowHeader: true, className: 'tabular-nums', cell: (row) => row.invoiceNumber },
  { key: 'patient', header: text.patient, cell: (row) => row.clientName },
  { key: 'total', header: text.totalUsd, className: 'tabular-nums', cell: (row) => formatMoney(row.totalUsd) },
  { key: 'assign', header: text.controlNumber, cell: (row) => <AssignField orderId={row.orderId} /> },
]

export function ControlPanel({ rows }: ControlPanelProps) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-muted-foreground">{text.controlNote}</p>
      <DataTable caption={text.controlTitle} columns={columns} rows={rows} rowKey={(row) => row.orderId} emptyText={text.nonePending} />
    </div>
  )
}
