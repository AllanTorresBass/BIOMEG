import { SwitchPanel } from '@/components/office/Panels'
import { BlockedNotice } from '@/components/shared/BlockedNotice'
import { guardRoute } from '@/lib/server/guard'
import { getShellSettings } from '@/lib/server/settings'
import { requireReadyStaff } from '@/lib/server/session/require'
import { strings } from '@/lib/strings'

export default async function SaturdayPage() {
  const context = await requireReadyStaff()
  if (context.locked) return null
  if (!(await guardRoute(context, ['setting.saturday.change'], '/mantenimiento/sabado'))) return <BlockedNotice />
  return (
    <section className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">{strings.pendingReview.office.saturdayTitle}</h1>
      <SwitchPanel enabled={getShellSettings().saturdayPriceEnabled} which="saturday" />
    </section>
  )
}
