import { WorklistTable } from '@/components/worklist/WorklistTable'
import { BlockedNotice } from '@/components/shared/BlockedNotice'
import { todayInLab } from '@/lib/server/domain/client-rules'
import { guardRoute } from '@/lib/server/guard'
import { requireReadyStaff } from '@/lib/server/session/require'
import { isWorklistDate, loadWorklist } from '@/lib/server/worklist-load'
import { strings } from '@/lib/strings'

type SearchParams = Promise<Record<string, string | string[] | undefined>>

function one(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? '') : (value ?? '')
}

export default async function WorklistPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams
  const requested = one(params.fecha)
  const reviewOnly = one(params.revision) === '1'

  const context = await requireReadyStaff()
  if (context.locked) return null
  if (!(await guardRoute(context, ['worklist.read'], '/hoja-de-trabajo'))) return <BlockedNotice />

  const text = strings.pendingReview.worklist
  const dateValid = requested === '' || isWorklistDate(requested)
  const date = requested !== '' && dateValid ? requested : todayInLab()
  const view = loadWorklist(context, date, reviewOnly)
  const showReviewFilter = view.canOpen

  return (
    <section className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">{strings.worklist.title}</h1>

      <form method="get" className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1 font-semibold">
          {text.date}
          <input
            type="date"
            name="fecha"
            defaultValue={date}
            aria-invalid={!dateValid}
            className="h-10 rounded-[var(--radius-control)] border border-border bg-card px-3 font-normal tabular-nums"
          />
        </label>
        {showReviewFilter ? (
          <label className="flex h-10 items-center gap-2 font-semibold">
            <input type="checkbox" name="revision" value="1" defaultChecked={reviewOnly} className="size-4" />
            {text.reviewOnly}
          </label>
        ) : null}
        <button
          type="submit"
          className="inline-flex h-10 items-center rounded-[var(--radius-control)] bg-primary px-4 font-semibold text-primary-foreground"
        >
          {text.search}
        </button>
      </form>
      {dateValid ? null : (
        <p role="alert" className="font-semibold text-flag-blocked">
          {text.dateInvalid}
        </p>
      )}

      <WorklistTable key={`${date}-${reviewOnly}`} initial={view} reviewOnly={reviewOnly && showReviewFilter} />
    </section>
  )
}
