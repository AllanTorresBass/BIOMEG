'use client'

import { useId, useState } from 'react'
import { strings } from '@/lib/strings'

/** Shows the day's notes for the laboratory. The list stays empty until the observations store exists. */
export function ObservationsPanel({ today }: { today: string }) {
  const [visible, setVisible] = useState(true)
  const [date, setDate] = useState(today)
  const regionId = useId()

  return (
    <section aria-labelledby={`${regionId}-title`} className="rounded-[var(--radius-card)] border border-border bg-card">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-3">
        <h2 id={`${regionId}-title`} className="text-base font-semibold">
          {strings.observations.title}
        </h2>
        <button
          type="button"
          aria-expanded={visible}
          aria-controls={regionId}
          onClick={() => setVisible((value) => !value)}
          className="h-9 rounded-[var(--radius-control)] border border-border-strong px-3 font-semibold"
        >
          {visible ? strings.observations.hide : strings.observations.show}
        </button>
      </div>
      <div id={regionId} hidden={!visible} className="flex flex-col gap-3 p-4">
        <div className="flex flex-wrap items-end gap-3">
          <label className="flex flex-col gap-1">
            <span className="font-semibold">{strings.observations.date}</span>
            <input
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              className="h-10 rounded-[var(--radius-control)] border border-border-strong bg-background px-3"
            />
          </label>
          <button
            type="button"
            className="h-10 rounded-[var(--radius-control)] bg-primary px-4 font-semibold text-primary-foreground"
          >
            {strings.observations.search}
          </button>
        </div>
        <p className="text-muted-foreground">{strings.observations.empty}</p>
      </div>
    </section>
  )
}
