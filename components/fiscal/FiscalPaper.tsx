import { strings } from '@/lib/strings'
import type { FiscalPaperProps } from '@/types/orders/fiscal-screens.props'

const text = strings.pendingReview.fiscal

/** Plain on purpose: no fiscal layout was captured. The watermark prints with the paper. */
export function FiscalPaper({ document, copy }: FiscalPaperProps) {
  return (
    <article className="relative mx-auto flex w-full max-w-3xl flex-col gap-4 overflow-hidden rounded-[var(--radius-card)] border border-border bg-card p-6 print:border-0">
      {copy ? (
        <p
          role="note"
          className="pointer-events-none absolute inset-0 flex -rotate-12 items-center justify-center text-8xl font-bold tracking-widest text-foreground/15"
        >
          {text.copy}
        </p>
      ) : null}
      <header className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <p className="font-bold">{strings.brand.name}</p>
          <p className="text-xs tracking-widest">{strings.brand.descriptor}</p>
        </div>
        <h2 className="text-lg font-semibold">
          {document.title} N° <span className="tabular-nums">{document.number}</span>
        </h2>
      </header>
      <dl className="grid gap-x-6 gap-y-1 sm:grid-cols-2">
        {document.rows.map((row) => (
          <div key={row.label} className="flex justify-between gap-4">
            <dt className="text-muted-foreground">{row.label}</dt>
            <dd className="font-semibold tabular-nums">{row.value}</dd>
          </div>
        ))}
      </dl>
      <ul className="flex flex-col divide-y divide-border border-y border-border">
        {document.lines.map((line, index) => (
          <li key={`${line.name}-${index}`} className="flex justify-between gap-4 py-1">
            <span>{line.name}</span>
            {line.amount === null ? null : <span className="tabular-nums">{line.amount}</span>}
          </li>
        ))}
      </ul>
      {document.totals.length > 0 ? (
        <dl className="ml-auto flex w-full max-w-xs flex-col gap-1">
          {document.totals.map((row) => (
            <div key={row.label} className="flex justify-between gap-4">
              <dt className="text-muted-foreground">{row.label}</dt>
              <dd className="font-semibold tabular-nums">{row.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}
    </article>
  )
}
