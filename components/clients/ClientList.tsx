'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef } from 'react'
import { StatusChip } from '@/components/shared/StatusChip'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { strings } from '@/lib/strings'
import { cn } from '@/lib/utils'
import { formatCedula, formatDate } from '@/lib/utils/format'
import type { ClientListProps } from '@/types/clients/card.types'

const text = strings.pendingReview.clients

export function ClientList({
  rows,
  selectedId,
  searching = false,
  canIncludeInactive = false,
  includeInactive = false,
}: ClientListProps) {
  const router = useRouter()
  const selectedRef = useRef<HTMLTableRowElement | null>(null)

  useEffect(() => {
    selectedRef.current?.scrollIntoView({ block: 'nearest' })
  }, [selectedId])

  const move = useCallback(
    (delta: number) => {
      if (rows.length === 0) return
      const found = rows.findIndex((row) => row.id === selectedId)
      const index = found < 0 ? (delta > 0 ? -1 : rows.length) : found
      const next = rows[Math.min(rows.length - 1, Math.max(0, index + delta))]
      if (next) router.push(`/clientes/${encodeURIComponent(next.id)}`)
    },
    [rows, selectedId, router],
  )

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT')) return
      if (event.key === 'ArrowDown') {
        event.preventDefault()
        move(1)
      } else if (event.key === 'ArrowUp') {
        event.preventDefault()
        move(-1)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [move])

  if (rows.length === 0) {
    return (
      <div className="flex flex-col gap-1 rounded-[var(--radius-card)] border border-dashed border-border bg-card p-6">
        <p className="font-semibold text-muted-foreground">
          {searching ? strings.clients.emptySearch : strings.clients.emptyCatalog}
        </p>
        {canIncludeInactive && !includeInactive ? (
          <p className="text-sm text-muted-foreground">{strings.clients.emptyInactiveHint}</p>
        ) : null}
        {includeInactive ? <p className="text-sm text-muted-foreground">{strings.clients.softDeletedHidden}</p> : null}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm text-muted-foreground">{strings.clients.openFichaHint}</p>
      <div className="overflow-x-auto rounded-[var(--radius-card)] border border-border bg-card">
        <Table>
          <caption className="sr-only">{strings.clients.title}</caption>
          <TableHeader>
            <TableRow className="bg-sunken hover:bg-sunken">
              <TableHead className="font-semibold">{text.name}</TableHead>
              <TableHead className="font-semibold">{text.cedula}</TableHead>
              <TableHead className="font-semibold">{strings.clients.birthDate}</TableHead>
              <TableHead className="font-semibold">{strings.clients.age}</TableHead>
              <TableHead className="font-semibold">
                <span className="sr-only">{text.flags}</span>
                {text.flags}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => {
              const selected = row.id === selectedId
              return (
                <TableRow
                  key={row.id}
                  ref={selected ? selectedRef : undefined}
                  data-state={selected ? 'selected' : undefined}
                  className={cn('transition-colors', selected ? 'bg-sunken' : undefined)}
                >
                  <TableCell className="font-semibold">
                    <Link
                      href={`/clientes/${encodeURIComponent(row.id)}`}
                      aria-current={selected ? 'true' : undefined}
                      className="rounded-[var(--radius-control)] text-primary underline-offset-2 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-[var(--color-navy)] focus-visible:ring-offset-2"
                    >
                      {row.fullName}
                    </Link>
                  </TableCell>
                  <TableCell className="tabular-nums">
                    {row.cedulaType && row.cedulaDigits ? formatCedula(row.cedulaType, row.cedulaDigits) : strings.empty.dash}
                  </TableCell>
                  <TableCell className="tabular-nums">{formatDate(row.birthDate)}</TableCell>
                  <TableCell className="tabular-nums">{row.ageText}</TableCell>
                  <TableCell>
                    <span className="flex flex-wrap gap-2">
                      {row.verified ? null : <StatusChip status="SIN_VERIFICAR" />}
                      {row.active ? null : <StatusChip status="INACTIVO" />}
                    </span>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
