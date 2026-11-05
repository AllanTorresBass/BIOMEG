'use client'

import { useState, useTransition } from 'react'
import { useResultCommands } from '@/hooks/use-results'
import { strings } from '@/lib/strings'
import type { Discrepancy } from '@/types/orders/result.types'
import type { LineOption } from '@/types/orders/result-extras.props'

const text = strings.pendingReview.results

export function ResultExtras({
  orderId,
  lines,
  discrepancies,
  isBioanalyst,
  canEnter,
}: {
  orderId: string
  lines: readonly LineOption[]
  discrepancies: readonly Discrepancy[]
  isBioanalyst: boolean
  canEnter: boolean
}) {
  const { simulateAnalyzer, addBacteriologyNote } = useResultCommands()
  const [lineId, setLineId] = useState(lines[0]?.id ?? '')
  const [value, setValue] = useState('')
  const [status, setStatus] = useState('')
  const [, startTransition] = useTransition()

  return (
    <div className="flex flex-col gap-6">
      {discrepancies.length > 0 ? (
        <section aria-labelledby="discrepancies-title" className="flex flex-col gap-2 rounded-[var(--radius-card)] border border-border bg-card p-4">
          <h2 id="discrepancies-title" className="text-lg font-semibold">
            {text.discrepancyTitle}
          </h2>
          <ul className="flex flex-col gap-1">
            {discrepancies.map((item) => (
              <li key={`${item.lineId}-${item.at}`} className="flex justify-between gap-4">
                <span>{item.name}</span>
                <span className="font-semibold tabular-nums">{item.value}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {canEnter ? (
        <section aria-labelledby="analyzer-title" className="flex flex-col gap-3 rounded-[var(--radius-card)] border border-border bg-card p-4">
          <h2 id="analyzer-title" className="text-lg font-semibold">
            {text.simulate}
          </h2>
          <div className="flex flex-wrap items-end gap-3">
            <label className="flex flex-col gap-1">
              <span>{text.colName}</span>
              <select
                value={lineId}
                onChange={(event) => setLineId(event.target.value)}
                className="min-h-11 rounded-[var(--radius-control)] border border-border bg-background px-2"
              >
                {lines.map((line) => (
                  <option key={line.id} value={line.id}>
                    {line.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1">
              <span>{text.simulateValue}</span>
              <input
                type="text"
                inputMode="decimal"
                value={value}
                onChange={(event) => setValue(event.target.value)}
                className="min-h-11 w-32 rounded-[var(--radius-control)] border border-border bg-background px-3 tabular-nums"
              />
            </label>
            <button
              type="button"
              className="min-h-11 rounded-[var(--radius-control)] border border-border px-4 font-semibold"
              onClick={() =>
                startTransition(async () => {
                  const result = await simulateAnalyzer({ orderId, lineId, value })
                  setStatus(result.message)
                })
              }
            >
              {text.simulate}
            </button>
          </div>
          {isBioanalyst ? (
            <div>
              <button
                type="button"
                className="min-h-11 rounded-[var(--radius-control)] border border-border px-4 font-semibold"
                onClick={() =>
                  startTransition(async () => {
                    const result = await addBacteriologyNote({ orderId })
                    setStatus(result.message)
                  })
                }
              >
                {text.bacteriologyAdd}
              </button>
            </div>
          ) : null}
          <p role="status" className="text-muted-foreground">
            {status}
          </p>
        </section>
      ) : null}
    </div>
  )
}
