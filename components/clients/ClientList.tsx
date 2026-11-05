import Link from 'next/link'
import { DataTable } from '@/components/shared/DataTable'
import { strings } from '@/lib/strings'
import { formatCedula, formatDate } from '@/lib/utils/format'
import type { ClientListProps } from '@/types/clients/card.types'
import type { DataTableColumn } from '@/types/shared/data-table.props'
import type { ClientSummary } from '@/types/domain/client.types'

const text = strings.pendingReview.clients

export function ClientList({ rows, selectedId }: ClientListProps) {
  const columns: DataTableColumn<ClientSummary>[] = [
    {
      key: 'name',
      header: text.name,
      rowHeader: true,
      cell: (row) => (
        <Link
          href={`/clientes?id=${encodeURIComponent(row.id)}`}
          aria-current={row.id === selectedId ? 'true' : undefined}
          className="font-semibold text-primary underline-offset-2 hover:underline"
        >
          {row.fullName}
        </Link>
      ),
    },
    {
      key: 'cedula',
      header: text.cedula,
      className: 'tabular-nums',
      cell: (row) => (row.cedulaType && row.cedulaDigits ? formatCedula(row.cedulaType, row.cedulaDigits) : null),
    },
    { key: 'birth', header: strings.clients.birthDate, className: 'tabular-nums', cell: (row) => formatDate(row.birthDate) },
    {
      key: 'flags',
      header: <span className="sr-only">{text.flags}</span>,
      cell: (row) => (
        <span className="flex flex-wrap gap-2">
          {row.verified ? null : (
            <span className="rounded-[var(--radius-control)] bg-flag-incomplete-bg px-2 py-1 text-xs font-semibold text-flag-incomplete">
              {strings.clients.unverified}
            </span>
          )}
          {row.active ? null : (
            <span className="rounded-[var(--radius-control)] bg-sunken px-2 py-1 text-xs font-semibold text-muted-foreground">
              {strings.clients.inactive}
            </span>
          )}
        </span>
      ),
    },
  ]

  return (
    <DataTable
      caption={strings.clients.title}
      columns={columns}
      rows={rows}
      rowKey={(row) => row.id}
      emptyText={text.none}
      rowClassName={(row) => (row.id === selectedId ? 'bg-sunken' : undefined)}
    />
  )
}
