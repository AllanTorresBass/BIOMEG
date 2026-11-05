import { notFound } from 'next/navigation'
import { ShellEmblem } from '@/components/brand/ShellEmblem'
import { StatusChip } from '@/components/shared/StatusChip'
import { STATUS_KEYS } from '@/lib/config/status'
import { demoSeed } from '@/lib/db/memory/seed'
import { strings } from '@/lib/strings'
import { formatCedula, formatDate, formatOrderNumber, formatPrice, formatRate, formatResultNumber } from '@/lib/utils/format'

const SWATCHES = [
  ['bg-primary', 'navy'],
  ['bg-primary-deep', 'navy-deep'],
  ['bg-card border border-border', 'surface-card'],
  ['bg-sunken', 'surface-sunken'],
  ['bg-flag-high', 'flag-high'],
  ['bg-flag-low', 'flag-low'],
  ['bg-flag-incomplete', 'flag-incomplete'],
  ['bg-flag-blocked', 'flag-blocked'],
  ['bg-flag-released', 'flag-released'],
] as const

export default function TokensPage() {
  if (process.env.NODE_ENV === 'production') notFound()
  const t = strings.pendingReview.dev
  const { settings, resultLines, priceRows } = demoSeed

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-8 p-6">
      <header className="flex items-center gap-3 rounded-[var(--radius-card)] bg-primary p-3 text-primary-foreground">
        <ShellEmblem />
        <div className="flex flex-col leading-tight">
          <span className="font-semibold">{strings.brand.name}</span>
          <span className="text-xs">{strings.brand.descriptor}</span>
        </div>
      </header>

      <div>
        <h1 className="text-xl font-semibold">{t.tokensTitle}</h1>
        <p className="text-muted-foreground">{t.tokensNote}</p>
      </div>

      <section aria-labelledby="colors" className="flex flex-col gap-3">
        <h2 id="colors" className="text-lg font-semibold">{t.colors}</h2>
        <ul className="grid grid-cols-3 gap-3 sm:grid-cols-5">
          {SWATCHES.map(([className, name]) => (
            <li key={name} className="flex flex-col gap-1">
              <span className={`h-12 rounded-[var(--radius-control)] ${className}`} />
              <span className="text-xs text-muted-foreground">{name}</span>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="chips" className="flex flex-col gap-3">
        <h2 id="chips" className="text-lg font-semibold">{t.chips}</h2>
        <ul className="flex flex-wrap gap-2">
          {STATUS_KEYS.map((key) => (
            <li key={key}><StatusChip status={key} /></li>
          ))}
          <li><StatusChip status="EN_CORRECCION" surface="portal" /></li>
        </ul>
      </section>

      <section aria-labelledby="formats" className="flex flex-col gap-3">
        <h2 id="formats" className="text-lg font-semibold">{t.formats}</h2>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-1 tabular-nums sm:grid-cols-4">
          <dt className="text-muted-foreground">Fecha</dt><dd>{formatDate('2026-11-04')}</dd>
          <dt className="text-muted-foreground">Cédula</dt><dd>{formatCedula('V', '12345678')}</dd>
          <dt className="text-muted-foreground">Tasa</dt><dd>{formatRate(settings.rateBs)}</dd>
          <dt className="text-muted-foreground">Orden</dt><dd>{formatOrderNumber(7)}</dd>
        </dl>
      </section>

      <section aria-labelledby="results" className="flex flex-col gap-3">
        <h2 id="results" className="text-lg font-semibold">{t.demoResults}</h2>
        <div className="overflow-x-auto rounded-[var(--radius-card)] border border-border bg-card">
          <table className="w-full text-left">
            <caption className="sr-only">{t.demoResults}</caption>
            <thead className="bg-sunken text-muted-foreground">
              <tr>
                <th scope="col" className="p-2">Examen</th>
                <th scope="col" className="p-2 text-right">Resultado</th>
                <th scope="col" className="p-2">Unidad</th>
                <th scope="col" className="p-2">Referencia</th>
              </tr>
            </thead>
            <tbody>
              {resultLines.map((row) => (
                <tr key={row.id} className="border-t border-border">
                  <th scope="row" className="p-2 font-normal">{row.name}</th>
                  <td className="p-2 text-right tabular-nums">{formatResultNumber(row.value)}</td>
                  <td className="p-2">{row.unit ?? strings.empty.dash}</td>
                  <td className="p-2">{row.reference}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section aria-labelledby="prices" className="flex flex-col gap-3">
        <h2 id="prices" className="text-lg font-semibold">{t.demoPrices}</h2>
        <div className="overflow-x-auto rounded-[var(--radius-card)] border border-border bg-card">
          <table className="w-full text-left">
            <caption className="sr-only">{t.demoPrices}</caption>
            <thead className="bg-sunken text-muted-foreground">
              <tr>
                <th scope="col" className="p-2">Examen</th>
                <th scope="col" className="p-2 text-right">Particular USD</th>
                <th scope="col" className="p-2 text-right">Estatal USD</th>
                <th scope="col" className="p-2">Estado</th>
              </tr>
            </thead>
            <tbody>
              {priceRows.map((row) => (
                <tr key={row.id} className="border-t border-border">
                  <th scope="row" className="p-2 font-normal">{row.name}</th>
                  <td className="p-2 text-right tabular-nums">{formatPrice(row.prices.PARTICULAR.usd)}</td>
                  <td className="p-2 text-right tabular-nums">{formatPrice(row.prices.ESTATAL.usd)}</td>
                  <td className="p-2"><StatusChip status={row.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  )
}
