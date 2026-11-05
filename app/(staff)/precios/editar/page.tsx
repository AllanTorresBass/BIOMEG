import { PriceEditor } from '@/components/office/Panels'
import { BlockedNotice } from '@/components/shared/BlockedNotice'
import { getPriceScreen } from '@/lib/server/queries/back-office'
import { requireReadyStaff } from '@/lib/server/session/require'
import { strings } from '@/lib/strings'

const text = strings.pendingReview.office

export default async function EditPricesPage({ searchParams }: { searchParams: Promise<{ moneda?: string }> }) {
  const context = await requireReadyStaff()
  if (context.locked) return null
  const search = await searchParams
  const currency = search.moneda === 'BS' ? 'BS' : 'USD'
  const screen = await getPriceScreen(context, { currency, status: 'TODOS', column: '' }, true)
  if (screen.kind !== 'READY') return <BlockedNotice />
  return (
    <section className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">{text.editTitle}</h1>
      <p className="font-semibold">{currency === 'USD' ? text.currencyUsd : text.currencyBs}</p>
      <PriceEditor rows={screen.rows} currency={currency} />
    </section>
  )
}
