import { IncreasePanel } from '@/components/office/Panels'
import { BlockedNotice } from '@/components/shared/BlockedNotice'
import { guardRoute } from '@/lib/server/guard'
import { getPriceScreen } from '@/lib/server/queries/back-office'
import { requireReadyStaff } from '@/lib/server/session/require'
import { strings } from '@/lib/strings'

const text = strings.pendingReview.office

export default async function IncreasePage({ searchParams }: { searchParams: Promise<{ moneda?: string }> }) {
  const context = await requireReadyStaff()
  if (context.locked) return null
  if (!(await guardRoute(context, ['prices.general_increase'], '/precios/aumento'))) return <BlockedNotice />
  const search = await searchParams
  const currency = search.moneda === 'BS' ? 'BS' : 'USD'
  const screen = await getPriceScreen(context, { currency, status: 'TODOS', column: '' }, false)
  if (screen.kind !== 'READY') return <BlockedNotice />
  return (
    <section className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">{text.increaseTitle}</h1>
      <p className="font-semibold">{currency === 'USD' ? text.currencyUsd : text.currencyBs}</p>
      <IncreasePanel rows={screen.rows} currency={currency} />
    </section>
  )
}
