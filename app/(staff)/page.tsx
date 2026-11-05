import { ObservationsPanel } from '@/components/shell/ObservationsPanel'
import { requireReadyStaff } from '@/lib/server/session/require'
import { strings } from '@/lib/strings'

export default async function HomePage() {
  const context = await requireReadyStaff()
  if (context.locked) return null

  const today = new Date().toISOString().slice(0, 10)
  return (
    <>
      <h1 className="text-xl font-semibold">{strings.pendingReview.home.title}</h1>
      <ObservationsPanel today={today} />
    </>
  )
}
