import { ControlPanel } from '@/components/fiscal/ControlPanel'
import { BlockedNotice } from '@/components/shared/BlockedNotice'
import { getControlScreen } from '@/lib/server/queries/fiscal'
import { requireReadyStaff } from '@/lib/server/session/require'
import { strings } from '@/lib/strings'

export default async function ControlPage() {
  const context = await requireReadyStaff()
  if (context.locked) return null
  const screen = await getControlScreen(context)
  if (screen.kind === 'BLOCKED') return <BlockedNotice />
  return (
    <section className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">{strings.pendingReview.fiscal.controlTitle}</h1>
      <ControlPanel rows={screen.rows} />
    </section>
  )
}
