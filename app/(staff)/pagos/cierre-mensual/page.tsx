import { MonthClosePanel } from '@/components/payments/MonthClosePanel'
import { BlockedNotice } from '@/components/shared/BlockedNotice'
import { getMonthScreen } from '@/lib/server/queries/payments'
import { requireReadyStaff } from '@/lib/server/session/require'
import { strings } from '@/lib/strings'

export default async function MonthClosePage() {
  const context = await requireReadyStaff()
  if (context.locked) return null
  const screen = await getMonthScreen(context)
  if (screen.kind === 'BLOCKED') return <BlockedNotice />
  return (
    <section className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">{strings.pendingReview.payments.monthTitle}</h1>
      <MonthClosePanel currentMonth={screen.currentMonth} closes={screen.closes} />
    </section>
  )
}
