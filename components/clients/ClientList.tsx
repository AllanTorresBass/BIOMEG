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

export function ClientList({ rows, selectedId }: ClientListProps) {
  const router = useRouter()
  const selectedRef = useRef<HTMLTableRowElement | null>(null)

  useEffect(() => {
    selectedRef.current?.scrollIntoView({ block: 'nearest' })
  }, [selectedId])

  const move = useCallback(
    (delta: number) => {
      if (rows.length === 0) return
      const index = Math.max(
        0,
        rows.findIndex((row) => row.id === selectedId),
      )
      const next = rows[Math.min(rows.length - 1, Math.max(0, index + delta))]
      if (next) router.push(`/clientes?id=${encodeURIComponent(next.id)}`)
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
    return <p className="text-muted-foreground">{text.none}</p>
  }

  return (
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
                className={cn(
                  'transition-colors',
                  selected ? 'bg-sunken' : undefined,
                )}
              >
                <TableCell className="font-semibold">
                  <Link
                    href={`/clientes?id=${encodeURIComponent(row.id)}`}
                    aria-current={selected ? 'true' : undefined}
                    className="text-primary underline-offset-2 hover:underline"
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
  )
}
