import { ErrorBoundary } from '@/components/shared/ErrorBoundary'
import { notFound } from 'next/navigation'
import { ResultExtras } from '@/components/orders/ResultExtras'
import { ResultGrid } from '@/components/orders/ResultGrid'
import { BlockedNotice } from '@/components/shared/BlockedNotice'
import { StatusChip } from '@/components/shared/StatusChip'
import { getResultsScreen } from '@/lib/server/queries/results'
import { requireReadyStaff } from '@/lib/server/session/require'
import { strings } from '@/lib/strings'
import { formatDate } from '@/lib/utils/format'

const text = strings.pendingReview.results

export default async function ResultsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ seccion?: string }>
}) {
  const context = await requireReadyStaff()
  if (context.locked) return null
  const { id } = await params
  const { seccion } = await searchParams
  const screen = await getResultsScreen(context, id, seccion)
  if (screen.kind === 'BLOCKED') return <BlockedNotice />
  if (screen.kind === 'MISSING') notFound()
  const { view, sectionTitles, lines } = screen

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-xl font-semibold">{text.title}</h1>
        <StatusChip status={view.chip} />
      </div>

      {view.missingSections.length > 0 ? (
        <p role="note" className="font-semibold text-flag-incomplete">
          {text.missingSections(view.missingSections.join(', '))}
        </p>
      ) : null}

      <dl className="grid gap-x-6 gap-y-1 rounded-[var(--radius-card)] border border-border bg-card p-4 sm:grid-cols-2">
        {[
          [text.patient, view.patientName],
          [text.sex, view.patientSex ?? text.sexBlank],
          [text.sample, view.sampleDate ? formatDate(view.sampleDate) : strings.empty.dash],
          [text.report, view.reportDate ? formatDate(view.reportDate) : strings.empty.dash],
          [text.release.processedBy, view.processedBy ?? strings.empty.dash],
        ].map(([label, value]) => (
          <div key={label} className="flex justify-between gap-4">
            <dt className="text-muted-foreground">{label}</dt>
            <dd className="font-semibold tabular-nums">{value}</dd>
          </div>
        ))}
      </dl>

      <form method="get" className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1">
          <span>{text.sectionFilter}</span>
          <select
            name="seccion"
            defaultValue={seccion ?? ''}
            className="min-h-11 rounded-[var(--radius-control)] border border-border bg-background px-2"
          >
            <option value="">{text.allSections}</option>
            {sectionTitles.map((title) => (
              <option key={title} value={title}>
                {title}
              </option>
            ))}
          </select>
        </label>
        <button type="submit" className="min-h-11 rounded-[var(--radius-control)] border border-border px-4 font-semibold">
          {text.apply}
        </button>
      </form>

      <ErrorBoundary>
      <ResultGrid key={`${view.orderId}-${seccion ?? ''}`} view={view} />
      </ErrorBoundary>
      <ResultExtras
        orderId={view.orderId}
        lines={lines}
        discrepancies={view.discrepancies}
        isBioanalyst={view.isBioanalyst}
        canEnter={view.canEnter}
      />
    </section>
  )
}
