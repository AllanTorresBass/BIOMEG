import Link from 'next/link'
import { strings } from '@/lib/strings'
import { cn } from '@/lib/utils/cn'
import { formatCedula, formatDate } from '@/lib/utils/format'
import type { ClientListProps } from '@/types/clients/card.types'

export function ClientList({ rows, selectedId, query, includeInactive }: ClientListProps) {
  if (rows.length === 0) {
    return <p className="text-muted-foreground">{strings.pendingReview.clients.none}</p>
  }

  const hrefFor = (id: string) => {
    const params = new URLSearchParams({ id })
    if (query) params.set('q', query)
    if (includeInactive) params.set('inactivos', '1')
    return `/clientes?${params.toString()}`
  }

  return (
    <div className="overflow-x-auto rounded-[var(--radius-card)] border border-border bg-card">
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="border-b border-border bg-sunken">
            <th scope="col" className="px-3 py-2 font-semibold">{strings.pendingReview.clients.name}</th>
            <th scope="col" className="px-3 py-2 font-semibold">{strings.pendingReview.clients.cedula}</th>
            <th scope="col" className="px-3 py-2 font-semibold">{strings.clients.birthDate}</th>
            <th scope="col" className="px-3 py-2 font-semibold"><span className="sr-only">Estado</span></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className={cn('border-b border-border last:border-b-0', row.id === selectedId && 'bg-sunken')}>
              <th scope="row" className="px-3 py-2 font-normal">
                <Link
                  href={hrefFor(row.id)}
                  aria-current={row.id === selectedId ? 'true' : undefined}
                  className="font-semibold text-primary underline-offset-2 hover:underline"
                >
                  {row.fullName}
                </Link>
              </th>
              <td className="px-3 py-2 tabular-nums">
                {row.cedulaType && row.cedulaDigits ? formatCedula(row.cedulaType, row.cedulaDigits) : strings.empty.dash}
              </td>
              <td className="px-3 py-2 tabular-nums">{formatDate(row.birthDate)}</td>
              <td className="px-3 py-2">
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
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
