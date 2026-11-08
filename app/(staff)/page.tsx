import { ObservationsPanel } from '@/components/shell/ObservationsPanel'
import { BlockedNotice } from '@/components/shared/BlockedNotice'
import { todayInLab } from '@/lib/server/domain/client-rules'
import { getObservationsScreen, isObservationDate } from '@/lib/server/queries/observations'
import { requireReadyStaff } from '@/lib/server/session/require'
import { strings } from '@/lib/strings'
import type { SearchParams } from '@/types/app/page.types'

function one(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? '') : (value ?? '')
}

export default async function HomePage({ searchParams }: { searchParams: SearchParams }) {
  const context = await requireReadyStaff()
  if (context.locked) return null

  const params = await searchParams
  const requested = one(params.fecha)
  const date = requested !== '' && isObservationDate(requested) ? requested : todayInLab()
  const screen = getObservationsScreen(context, date)

  return (
    <>
      <h1 className="text-xl font-semibold">{strings.pendingReview.home.title}</h1>
      {screen.kind === 'BLOCKED' ? (
        <BlockedNotice />
      ) : (
        <ObservationsPanel date={screen.date} rows={screen.rows} canUse={screen.canUse} />
      )}
    </>
  )
}
