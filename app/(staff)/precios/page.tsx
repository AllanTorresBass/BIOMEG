import { PrintListButton } from '@/components/office/Panels'
import { BlockedNotice } from '@/components/shared/BlockedNotice'
import { PRICE_COLUMNS, PRICE_COLUMN_LABELS } from '@/lib/config/price-defaults'
import { getPriceScreen, priceAmount } from '@/lib/server/queries/back-office'
import { requireReadyStaff } from '@/lib/server/session/require'
import { strings } from '@/lib/strings'

const text = strings.pendingReview.office
const FIELD = 'h-10 rounded-[var(--radius-control)] border border-border-strong bg-background px-3'

export default async function PriceListPage({ searchParams }: { searchParams: Promise<{ moneda?: string; status?: string; columna?: string }> }) {
  const context = await requireReadyStaff()
  if (context.locked) return null
  const search = await searchParams
  const screen = await getPriceScreen(
    context,
    { currency: search.moneda ?? 'USD', status: search.status ?? 'DISPONIBLE', column: search.columna ?? '' },
    false,
  )
  if (screen.kind === 'BLOCKED') return <BlockedNotice />
  const columns = screen.kind === 'READY' && screen.focus ? [screen.focus] : PRICE_COLUMNS
  return (
    <section className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">{text.listTitle}</h1>
      <form method="get" className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1">
          <span className="font-semibold">Moneda</span>
          <select name="moneda" defaultValue={search.moneda ?? 'USD'} className={FIELD}>
            <option value="USD">USD</option>
            <option value="BS">Bs</option>
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="font-semibold">{text.status}</span>
          <select name="status" defaultValue={search.status ?? 'DISPONIBLE'} className={FIELD}>
            <option value="DISPONIBLE">{text.statusAvailable}</option>
            <option value="NO_DISP">{text.statusUnavailable}</option>
            <option value="TODOS">{text.statusAll}</option>
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="font-semibold">{strings.pendingReview.orders.priceColumn}</span>
          <select name="columna" defaultValue={search.columna ?? ''} className={FIELD}>
            <option value="">{text.columnAll}</option>
            {PRICE_COLUMNS.map((column) => (
              <option key={column} value={column}>{PRICE_COLUMN_LABELS[column]}</option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="font-semibold">Categoría</span>
          <select className={FIELD} defaultValue="todas" disabled>
            <option value="todas">{text.categoryAll}</option>
          </select>
        </label>
        <button type="submit" className="h-10 rounded-[var(--radius-control)] bg-primary px-4 font-semibold text-primary-foreground">{text.auditApply}</button>
      </form>
      <p className="text-muted-foreground">{text.categoryMissing}</p>
      {screen.kind === 'CURRENCY' ? <p>{text.currencyMissing}</p> : null}
      {screen.kind === 'READY' ? (
        <>
          <p className="font-semibold">{screen.currency === 'USD' ? text.currencyUsd : text.currencyBs}</p>
          {screen.rows.length === 0 ? <p>{text.priceEmpty}</p> : (
            <div className="overflow-x-auto rounded-[var(--radius-card)] border border-border bg-card">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-border bg-sunken">
                    <th className="px-3 py-2">{text.name}</th>
                    {columns.map((column) => (
                      <th key={column} className="px-3 py-2">{PRICE_COLUMN_LABELS[column]}</th>
                    ))}
                    <th className="px-3 py-2">{text.status}</th>
                  </tr>
                </thead>
                <tbody>
                  {screen.rows.map((row) => (
                    <tr key={row.id} className="border-b border-border last:border-b-0">
                      <th scope="row" className="px-3 py-2 font-normal">{row.name}</th>
                      {columns.map((column) => (
                        <td key={column} className="px-3 py-2 tabular-nums">{priceAmount(row, column, screen.currency)}</td>
                      ))}
                      <td className="px-3 py-2">
                        {row.status === 'DISPONIBLE' ? text.statusAvailable : text.statusUnavailable}
                        {row.exception ? <span className="mt-1 block text-sm text-muted-foreground">{text.filterException}</span> : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {screen.canPrint ? <PrintListButton /> : null}
        </>
      ) : null}
    </section>
  )
}
