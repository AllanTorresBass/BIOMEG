import { PaymentRegistry } from '@/components/payments/PaymentRegistry'
import { BlockedNotice } from '@/components/shared/BlockedNotice'
import { getRegistryScreen } from '@/lib/server/queries/payments'
import { requireReadyStaff } from '@/lib/server/session/require'
import { strings } from '@/lib/strings'

export default async function PaymentRegistryPage() {
  const context = await requireReadyStaff()
  if (context.locked) return null
  const screen = await getRegistryScreen(context)
  if (screen.kind === 'BLOCKED') return <BlockedNotice />
  return (
    <section className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">{strings.pendingReview.payments.registryTitle}</h1>
      <PaymentRegistry rows={screen.rows} selfReversals={screen.selfReversals} seesAll={screen.seesAll} />
    </section>
  )
}
