import { RatePanel } from '@/components/office/Panels'
import { BlockedNotice } from '@/components/shared/BlockedNotice'
import { guardRoute } from '@/lib/server/guard'
import { getShellSettings } from '@/lib/server/settings'
import { requireReadyStaff } from '@/lib/server/session/require'
import { strings } from '@/lib/strings'

const text = strings.pendingReview.office

export default async function RatePage() {
  const context = await requireReadyStaff()
  if (context.locked) return null
  if (!(await guardRoute(context, ['rate.set'], '/mantenimiento/tasa'))) return <BlockedNotice />
  return (
    <section className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">{text.rateTitle}</h1>
      <RatePanel rate={getShellSettings().rateBs ?? ''} />
    </section>
  )
}
