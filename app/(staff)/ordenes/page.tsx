import Link from 'next/link'
import { BlockedNotice } from '@/components/shared/BlockedNotice'
import { StatusChip } from '@/components/shared/StatusChip'
import { todayInLab } from '@/lib/server/domain/client-rules'
import { getOrderList } from '@/lib/server/queries/order-list'
import { requireReadyStaff } from '@/lib/server/session/require'
import { strings } from '@/lib/strings'
import { formatDate } from '@/lib/utils/format'
import type { SearchParams } from '@/types/app/page.types'

const text = strings.pendingReview.orderHub

function one(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? '') : (value ?? '')
}

export default async function OrdersListPage({ searchParams }: { searchParams: SearchParams }) {
  const context = await requireReadyStaff()
  if (context.locked) return null
  const params = await searchParams
  const requested = one(params.fecha)
  const state = one(params.estado) || 'TODOS'
  const date = requested || todayInLab()
  const view = await getOrderList(context, { date, state })
  if (view.kind === 'BLOCKED') return <BlockedNotice />

  return (
    <section className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">{text.listTitle}</h1>
      <form method="get" className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1 font-semibold">
          {text.date}
          <input
            type="date"
            name="fecha"
            defaultValue={date}
            className="h-10 rounded-[var(--radius-control)] border border-border bg-card px-3 font-normal tabular-nums"
          />
        </label>
        <label className="flex flex-col gap-1 font-semibold">
          {text.state}
          <select
            name="estado"
            defaultValue={state}
            className="h-10 rounded-[var(--radius-control)] border border-border bg-card px-3 font-normal"
          >
            <option value="TODOS">{text.stateAll}</option>
            <option value="ABIERTA">ABIERTA</option>
            <option value="INCOMPLETO">INCOMPLETO</option>
            <option value="LIBERADO">LIBERADO</option>
            <option value="EN_CORRECCION">EN_CORRECCION</option>
            <option value="ANULADA">ANULADA</option>
          </select>
        </label>
        <button
          type="submit"
          className="inline-flex h-10 items-center rounded-[var(--radius-control)] bg-primary px-4 font-semibold text-primary-foreground"
        >
          {text.search}
        </button>
      </form>

      {view.rows.length === 0 ? (
        <p className="text-muted-foreground">{text.empty}</p>
      ) : (
        <div className="overflow-x-auto rounded-[var(--radius-card)] border border-border bg-card">
          <table className="w-full border-collapse text-left">
            <caption className="sr-only">{text.listTitle}</caption>
            <thead>
              <tr className="border-b border-border bg-sunken">
                <th className="px-3 py-2 font-semibold">{text.colNumber}</th>
                <th className="px-3 py-2 font-semibold">{text.colPatient}</th>
                <th className="px-3 py-2 font-semibold">{text.colSample}</th>
                <th className="px-3 py-2 font-semibold">{text.colState}</th>
              </tr>
            </thead>
            <tbody>
              {view.rows.map((row) => (
                <tr key={row.id} className="border-b border-border last:border-b-0">
                  <th scope="row" className="px-3 py-2 font-normal">
                    <Link
                      href={`/ordenes/${encodeURIComponent(row.id)}`}
                      className="font-semibold text-primary underline-offset-2 hover:underline"
                    >
                      {row.number}
                    </Link>
                  </th>
                  <td className="px-3 py-2">{row.patient}</td>
                  <td className="px-3 py-2 tabular-nums">{formatDate(row.sampleDate)}</td>
                  <td className="px-3 py-2">
                    <StatusChip status={row.state} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
