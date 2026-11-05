'use client'

import Link from 'next/link'
import { useWorklist } from '@/hooks/use-worklist'
import { DataTable } from '@/components/shared/DataTable'
import { StatusChip } from '@/components/shared/StatusChip'
import { strings } from '@/lib/strings'
import { formatDate } from '@/lib/utils/format'
import type { DataTableColumn } from '@/types/shared/data-table.props'
import type { WorklistRow, WorklistView } from '@/types/orders/worklist.types'

const text = strings.pendingReview.worklist
function columnsFor(canOpen: boolean): DataTableColumn<WorklistRow>[] {
  return [
    {
      key: 'number',
      header: text.columns.number,
      rowHeader: true,
      className: 'tabular-nums',
      cell: (row) =>
        canOpen ? (
          <Link
            href={`/ordenes/${row.id}/resultados`}
            aria-label={`${text.loadResults} ${row.number}`}
            className="font-semibold text-primary underline-offset-2 hover:underline"
          >
            {row.number}
          </Link>
        ) : (
          <span className="font-semibold">{row.number}</span>
        ),
    },
    { key: 'patient', header: text.columns.patient, cell: (row) => row.patient },
    { key: 'convenio', header: text.columns.convenio, cell: (row) => row.convenio },
    { key: 'sample', header: text.columns.sampleDate, className: 'tabular-nums', cell: (row) => formatDate(row.sampleDate) },
    {
      key: 'state',
      header: text.columns.state,
      cell: (row) => (
        <span className="flex flex-wrap items-center gap-2">
          <StatusChip status={row.state} />
          {row.needsReview ? <StatusChip status="EN_REVISION" /> : null}
        </span>
      ),
    },
    {
      key: 'printed',
      header: text.columns.printed,
      cell: (row) => <StatusChip status={row.printed ? 'IMPRESO' : 'SIN_IMPRIMIR'} />,
    },
  ]
}

export function WorklistTable({ initial, reviewOnly }: { initial: WorklistView; reviewOnly: boolean }) {
  const { data, error, isFetching, refetch } = useWorklist(initial, reviewOnly)
  const view = data ?? initial

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => void refetch()}
          disabled={isFetching}
          className="inline-flex h-10 items-center rounded-[var(--radius-control)] border border-border px-4 font-semibold disabled:opacity-60"
        >
          {text.refresh}
        </button>
        {error ? (
          <p role="alert" className="font-semibold text-flag-blocked">
            {strings.worklist.updateFailed}
          </p>
        ) : null}
      </div>

      <DataTable
        caption={text.tableLabel}
        columns={columnsFor(view.canOpen)}
        rows={view.rows}
        rowKey={(row) => row.id}
        emptyText={strings.worklist.empty}
      />
    </div>
  )
}
