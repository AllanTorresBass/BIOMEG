import { IncreasePanel, PriceEditor, PrintListButton } from '@/components/office/Panels'
import { PricesHubShell } from '@/components/office/PricesHub'
import { BlockedNotice } from '@/components/shared/BlockedNotice'
import { PRICE_COLUMNS, PRICE_COLUMN_LABELS } from '@/lib/config/price-defaults'
import { mayReach } from '@/lib/server/guard'
import { getPriceScreen, priceAmount } from '@/lib/server/queries/back-office'
import { requireReadyStaff } from '@/lib/server/session/require'
import { strings } from '@/lib/strings'

const text = strings.pendingReview.office
const FIELD = 'h-10 rounded-[var(--radius-control)] border border-border-strong bg-background px-3'

export default async function PricesPage({
  searchParams,
}: {
  searchParams: Promise<{ moneda?: string; status?: string; columna?: string; tab?: string }>
}) {
  const context = await requireReadyStaff()
  if (context.locked) return null
  const search = await searchParams
  const canEdit = mayReach(context, ['prices.edit'])
  const canIncrease = mayReach(context, ['prices.general_increase'])
  const requested = search.tab === 'editar' || search.tab === 'aumento' ? search.tab : 'lista'
  const active =
    requested === 'editar' && !canEdit ? 'lista'
    : requested === 'aumento' && !canIncrease ? 'lista'
    : requested

  const currency = search.moneda === 'BS' ? 'BS' : 'USD'
  const listScreen = await getPriceScreen(
    context,
    { currency: search.moneda ?? 'USD', status: search.status ?? 'DISPONIBLE', column: search.columna ?? '' },
    false,
  )
  if (listScreen.kind === 'BLOCKED') return <BlockedNotice />

  const editScreen =
    canEdit && active === 'editar' ? await getPriceScreen(context, { currency, status: 'TODOS', column: '' }, true) : null
  const increaseScreen =
    canIncrease && active === 'aumento' ? await getPriceScreen(context, { currency, status: 'TODOS', column: '' }, false) : null

  const columns = listScreen.kind === 'READY' && listScreen.focus ? [listScreen.focus] : PRICE_COLUMNS

  return (
    <PricesHubShell active={active} canEdit={canEdit} canIncrease={canIncrease}>
      {active === 'lista' ? (
        <div className="flex flex-col gap-4">
          <form method="get" className="flex flex-wrap items-end gap-3">
            <input type="hidden" name="tab" value="lista" />
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
                  <option key={column} value={column}>
                    {PRICE_COLUMN_LABELS[column]}
                  </option>
                ))}
              </select>
            </label>
            <button type="submit" className="h-10 rounded-[var(--radius-control)] bg-primary px-4 font-semibold text-primary-foreground">
              {text.auditApply}
            </button>
          </form>
          <p className="text-muted-foreground">{text.categoryMissing}</p>
          {listScreen.kind === 'CURRENCY' ? <p>{text.currencyMissing}</p> : null}
          {listScreen.kind === 'READY' ? (
            <>
              <p className="font-semibold">{listScreen.currency === 'USD' ? text.currencyUsd : text.currencyBs}</p>
              {listScreen.rows.length === 0 ? (
                <p>{text.priceEmpty}</p>
              ) : (
                <div className="overflow-x-auto rounded-[var(--radius-card)] border border-border bg-card">
                  <table className="w-full border-collapse text-left">
                    <thead>
                      <tr className="border-b border-border bg-sunken">
                        <th className="px-3 py-2">{text.name}</th>
                        {columns.map((column) => (
                          <th key={column} className="px-3 py-2">
                            {PRICE_COLUMN_LABELS[column]}
                          </th>
                        ))}
                        <th className="px-3 py-2">{text.status}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {listScreen.rows.map((row) => (
                        <tr key={row.id} className="border-b border-border last:border-b-0">
                          <th scope="row" className="px-3 py-2 font-normal">
                            {row.name}
                          </th>
                          {columns.map((column) => (
                            <td key={column} className="px-3 py-2 tabular-nums">
                              {priceAmount(row, column, listScreen.currency)}
                            </td>
                          ))}
                          <td className="px-3 py-2">
                            {row.status === 'DISPONIBLE' ? text.statusAvailable : text.statusUnavailable}
                            {row.exception ? (
                              <span className="mt-1 block text-sm text-muted-foreground">{text.filterException}</span>
                            ) : null}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {listScreen.canPrint ? <PrintListButton /> : null}
            </>
          ) : null}
        </div>
      ) : null}

      {active === 'editar' && editScreen?.kind === 'READY' ? (
        <div className="flex flex-col gap-4">
          <p className="font-semibold">{currency === 'USD' ? text.currencyUsd : text.currencyBs}</p>
          <PriceEditor rows={editScreen.rows} currency={currency} />
        </div>
      ) : null}
      {active === 'editar' && editScreen && editScreen.kind !== 'READY' ? <BlockedNotice /> : null}

      {active === 'aumento' && increaseScreen?.kind === 'READY' ? (
        <div className="flex flex-col gap-4">
          <p className="font-semibold">{currency === 'USD' ? text.currencyUsd : text.currencyBs}</p>
          <IncreasePanel rows={increaseScreen.rows} currency={currency} />
        </div>
      ) : null}
      {active === 'aumento' && increaseScreen && increaseScreen.kind !== 'READY' ? <BlockedNotice /> : null}
    </PricesHubShell>
  )
}
