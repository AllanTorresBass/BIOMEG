import { AbonoPanel } from '@/components/payments/AbonoPanel'
import { BlockedNotice } from '@/components/shared/BlockedNotice'
import { getAbonoScreen } from '@/lib/server/queries/payments'
import { requireReadyStaff } from '@/lib/server/session/require'
import { strings } from '@/lib/strings'

export default async function AbonoPage({ searchParams }: { searchParams: Promise<{ o?: string }> }) {
  const context = await requireReadyStaff()
  if (context.locked) return null
  const { o } = await searchParams
  const screen = await getAbonoScreen(context, o ?? '')
  if (screen.kind === 'BLOCKED') return <BlockedNotice />
  return (
    <section className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">{strings.pendingReview.payments.abonoTitle}</h1>
      <AbonoPanel order={screen.order} />
    </section>
  )
}
