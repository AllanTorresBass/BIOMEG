import { PrintButton } from '@/components/orders/PrintButton'
import { BlockedNotice } from '@/components/shared/BlockedNotice'
import { getQuote } from '@/lib/db/memory/quote-store'
import { guardRoute } from '@/lib/server/guard'
import { requireReadyStaff } from '@/lib/server/session/require'
import { strings } from '@/lib/strings'
import { LAB_TIME_ZONE, formatMoney, formatRate } from '@/lib/utils/format'

const text = strings.pendingReview.orders

export default async function QuotePage({ params }: { params: Promise<{ id: string }> }) {
  const context = await requireReadyStaff()
  if (context.locked) return null
  const { id } = await params
  if (!(await guardRoute(context, ['quote.create'], `/ordenes/presupuesto/${id}`))) return <BlockedNotice />

  const quote = getQuote(id)
  if (!quote) return <p className="text-muted-foreground">{text.quoteMissing}</p>

  const issued = new Intl.DateTimeFormat('es-VE', { timeZone: LAB_TIME_ZONE, dateStyle: 'short', timeStyle: 'short' }).format(
    new Date(quote.createdAt),
  )
  const billing = [
    [text.billingName, quote.billing.razonSocial],
    [text.billingCedula, quote.billing.cedula],
    [text.billingAddress, quote.billing.direccion],
  ].filter(([, value]) => value && value.trim() !== '')

  const totals: [string, string][] = [
    [text.totalUsdLabel, formatMoney(quote.totals.totalUsd)],
    [text.totalBsLabel, quote.totals.totalBs === null ? strings.empty.dash : formatMoney(quote.totals.totalBs)],
  ]

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="text-xl font-semibold">{text.quoteTitle(quote.number)}</h1>
        <p className="text-sm text-muted-foreground">
          {text.quoteIssued}: {issued}
        </p>
      </div>
      <p className="text-sm text-muted-foreground">{text.quoteNote}</p>

      <div className="flex flex-col gap-1 rounded-[var(--radius-card)] border border-border bg-card p-4">
        <p className="font-semibold">{quote.clientName}</p>
        {billing.map(([label, value]) => (
          <p key={label} className="text-sm text-muted-foreground">
            {label}: {value}
          </p>
        ))}
      </div>

      <div className="overflow-x-auto rounded-[var(--radius-card)] border border-border bg-card">
        <table className="w-full text-left">
          <caption className="sr-only">{text.linesTitle}</caption>
          <thead>
            <tr className="border-b border-border text-sm text-muted-foreground">
              <th scope="col" className="px-3 py-2 font-semibold">
                {text.lineExam}
              </th>
              <th scope="col" className="px-3 py-2 text-right font-semibold">
                {text.linePrice}
              </th>
            </tr>
          </thead>
          <tbody>
            {quote.lines.map((line) => (
              <tr key={line.id} className="border-b border-border last:border-b-0">
                <td className="px-3 py-2">{line.examName}</td>
                <td className="px-3 py-2 text-right tabular-nums">
                  {line.priceUsd === null ? strings.empty.dash : formatMoney(line.priceUsd)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <dl className="flex flex-col gap-1 self-end sm:min-w-72">
        {totals.map(([label, value]) => (
          <div key={label} className="flex justify-between gap-4">
            <dt className="text-muted-foreground">{label}</dt>
            <dd className="font-semibold tabular-nums">{value}</dd>
          </div>
        ))}
        {quote.rateBs === '' ? null : (
          <div className="flex justify-between gap-4 text-sm text-muted-foreground">
            <dt>{text.quoteRate}</dt>
            <dd className="tabular-nums">{formatRate(quote.rateBs)}</dd>
          </div>
        )}
      </dl>

      <PrintButton />
    </section>
  )
}
