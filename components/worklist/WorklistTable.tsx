'use client'

import Link from 'next/link'
import useSWR from 'swr'
import { fetchWorklist } from '@/app/actions/worklist'
import { StatusChip } from '@/components/shared/StatusChip'
import { strings } from '@/lib/strings'
import { formatDate } from '@/lib/utils/format'
import type { WorklistView } from '@/types/orders/worklist.types'

const text = strings.pendingReview.worklist
const REFRESH_MS = 20_000

async function load([, date, reviewOnly]: readonly [string, string, boolean]): Promise<WorklistView> {
  const view = await fetchWorklist(date, reviewOnly)
  if (!view) throw new Error('worklist')
  return view
}

export function WorklistTable({ initial, reviewOnly }: { initial: WorklistView; reviewOnly: boolean }) {
  const { data, error, isValidating, mutate } = useSWR(['worklist', initial.date, reviewOnly] as const, load, {
    fallbackData: initial,
    refreshInterval: REFRESH_MS,
    revalidateOnMount: false,
    keepPreviousData: true,
  })
  const view = data ?? initial

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => void mutate()}
          disabled={isValidating}
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

      {view.rows.length === 0 ? (
        <p className="text-muted-foreground">{strings.worklist.empty}</p>
      ) : (
        <div className="overflow-x-auto rounded-[var(--radius-card)] border border-border bg-card">
          <table className="w-full border-collapse text-left">
            <caption className="sr-only">{text.tableLabel}</caption>
            <thead>
              <tr className="border-b border-border bg-sunken">
                <th scope="col" className="px-3 py-2 font-semibold">{text.columns.number}</th>
                <th scope="col" className="px-3 py-2 font-semibold">{text.columns.patient}</th>
                <th scope="col" className="px-3 py-2 font-semibold">{text.columns.convenio}</th>
                <th scope="col" className="px-3 py-2 font-semibold">{text.columns.sampleDate}</th>
                <th scope="col" className="px-3 py-2 font-semibold">{text.columns.state}</th>
                <th scope="col" className="px-3 py-2 font-semibold">{text.columns.printed}</th>
              </tr>
            </thead>
            <tbody>
              {view.rows.map((row) => (
                <tr key={row.id} className="border-b border-border last:border-b-0">
                  <th scope="row" className="px-3 py-2 font-normal tabular-nums">
                    {view.canOpen ? (
                      <Link
                        href={`/ordenes/${row.id}/resultados`}
                        aria-label={`${text.loadResults} ${row.number}`}
                        className="font-semibold text-primary underline-offset-2 hover:underline"
                      >
                        {row.number}
                      </Link>
                    ) : (
                      <span className="font-semibold">{row.number}</span>
                    )}
                  </th>
                  <td className="px-3 py-2">{row.patient}</td>
                  <td className="px-3 py-2">{row.convenio ?? strings.empty.dash}</td>
                  <td className="px-3 py-2 tabular-nums">{formatDate(row.sampleDate)}</td>
                  <td className="px-3 py-2">
                    <span className="flex flex-wrap items-center gap-2">
                      <StatusChip status={row.state} />
                      {row.needsReview ? <StatusChip status="EN_REVISION" /> : null}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <StatusChip status={row.printed ? 'IMPRESO' : 'SIN_IMPRIMIR'} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
