import { BlockedNotice } from '@/components/shared/BlockedNotice'
import { guardRoute } from '@/lib/server/guard'
import { requireReadyStaff } from '@/lib/server/session/require'
import { strings } from '@/lib/strings'

export default async function PurchasesPage() {
  const context = await requireReadyStaff()
  if (context.locked) return null
  if (!(await guardRoute(context, ['purchase.orders'], '/compras'))) return <BlockedNotice />
  return (
    <section className="flex flex-col gap-2">
      <h1 className="text-xl font-semibold">{strings.pendingReview.office.purchasesTitle}</h1>
      <p>{strings.fixed.unopenedReport}</p>
    </section>
  )
}
