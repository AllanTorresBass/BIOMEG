import { CashClosePanel } from '@/components/payments/CashClosePanel'
import { BlockedNotice } from '@/components/shared/BlockedNotice'
import { getCashScreen } from '@/lib/server/queries/payments'
import { requireReadyStaff } from '@/lib/server/session/require'
import { strings } from '@/lib/strings'

export default async function CashClosePage({ searchParams }: { searchParams: Promise<{ usuario?: string }> }) {
  const context = await requireReadyStaff()
  if (context.locked) return null
  const { usuario } = await searchParams
  const screen = await getCashScreen(context, usuario ?? '')
  if (screen.kind === 'BLOCKED') return <BlockedNotice />
  return (
    <section className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">{strings.pendingReview.payments.cashTitle}</h1>
      <CashClosePanel userId={screen.userId} isOwn={screen.isOwn} drawers={screen.drawers} summary={screen.summary} closes={screen.closes} />
    </section>
  )
}
