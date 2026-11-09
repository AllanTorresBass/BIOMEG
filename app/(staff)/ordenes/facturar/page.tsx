import { redirect } from 'next/navigation'
import { ClientStep } from '@/components/orders/ClientStep'
import { ExamsStep } from '@/components/orders/ExamsStep'
import { PaymentStep } from '@/components/orders/PaymentStep'
import { PersonalStep } from '@/components/orders/PersonalStep'
import { SavedOrderPanel } from '@/components/orders/SavedOrderPanel'
import { StatusChip } from '@/components/shared/StatusChip'
import { toCatalog, toLineView, toTotalsView } from '@/lib/server/domain/order-draft-view'
import { beginFacturar, canOpenOrders, getNewOrderScreen, toPatient } from '@/lib/server/queries/new-order'
import { requireReadyStaff } from '@/lib/server/session/require'
import { strings } from '@/lib/strings'
import { LAB_TIME_ZONE, formatDate } from '@/lib/utils/format'
import type { SearchParams } from '@/types/app/page.types'

const text = strings.pendingReview.orders

function one(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? '') : (value ?? '')
}

export default async function FacturarPage({ searchParams }: { searchParams: SearchParams }) {
  const context = await requireReadyStaff()
  if (context.locked) return null
  if (!(await canOpenOrders(context, '/ordenes/facturar'))) {
    return (
      <section className="flex flex-col items-start gap-2">
        <h1 className="text-xl font-semibold">{text.facturarTitle}</h1>
        <StatusChip status="BLOQUEADO" />
      </section>
    )
  }

  const params = await searchParams
  const draftId = one(params.d)
  if (draftId === '') {
    const started = beginFacturar(context, one(params.clientId) || undefined)
    const missing = started.missingClient ? '&ausente=1' : ''
    redirect(`/ordenes/facturar?d=${started.draftId}${missing}`)
  }
  const screen = getNewOrderScreen(context, draftId)
  if (!screen || screen.draft.entry !== 'FACTURAR') redirect('/ordenes/facturar')
  const { draft, client, step, saved, settings } = screen
  const current = step >= 2 ? step - 2 : -1

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="text-xl font-semibold">{text.facturarTitle}</h1>
        <ol className="flex gap-4 text-sm" aria-label={text.stepsLabel}>
          {text.facturarSteps.map((label, index) => (
            <li
              key={label}
              aria-current={current === index ? 'step' : undefined}
              className={current === index ? 'font-semibold' : 'text-muted-foreground'}
            >
              {label}
            </li>
          ))}
        </ol>
      </div>

      {one(params.ausente) === '1' && !client ? <p>{strings.orders.clientNotFound}</p> : null}

      {saved ? (
        <SavedOrderPanel
          orderId={saved.id}
          number={saved.number}
          invoiceNumber={saved.invoiceNumber}
          controlNumber={saved.controlNumber}
          clientName={saved.clientName}
          examCount={saved.lines.length}
          totalUsd={saved.totals.totalUsd}
          totalBs={saved.totals.totalBs}
          abono={saved.totals.abono}
          resta={saved.totals.resta}
          savedBy={saved.savedByName}
          savedAtText={new Date(saved.savedAt).toLocaleTimeString('es-VE', {
            timeZone: LAB_TIME_ZONE,
            hour: '2-digit',
            minute: '2-digit',
          })}
        />
      ) : step === 1 || !client ? (
        <ClientStep
          draftId={draft.id}
          patient={client ? toPatient(client) : null}
          visit={{ motivo: draft.motivo, sampleDate: draft.sampleDate ? formatDate(draft.sampleDate) : '' }}
          todayText={formatDate(screen.today)}
          canCreateClient={false}
          searchOnly
        />
      ) : step === 3 ? (
        <PersonalStep draftId={draft.id} patient={toPatient(client)} physicianId={draft.physicianId} physicians={screen.physicians} />
      ) : step === 4 ? (
        <PaymentStep
          draftId={draft.id}
          patient={toPatient(client)}
          isEmpresa={false}
          convenios={screen.convenios}
          convenioId={draft.convenioId}
          titular={draft.titular}
          razonSocial={draft.billing.razonSocial}
          payments={draft.payments.length > 0 ? draft.payments : screen.emptyPayments}
          discountPct={draft.discountPct}
          discountMotivo={draft.discountMotivo}
          discountLimit={settings.discountLimit}
          linePrices={draft.lines.map((line) => line.priceUsd)}
          rate={settings.rateBs}
          rateDate={settings.rateDate}
          ivaRate={settings.ivaRate}
          igtfRate={settings.igtfRate}
        />
      ) : (
        <ExamsStep
          draftId={draft.id}
          patient={toPatient(client)}
          costType={draft.costType}
          billing={draft.billing}
          catalog={toCatalog(screen.priceRows)}
          lines={draft.lines.map(toLineView)}
          totals={toTotalsView(draft.lines, settings.rateBs)}
          rateMissing={settings.rateBs === ''}
          visit={{ motivo: draft.motivo, sampleDate: draft.sampleDate ? formatDate(draft.sampleDate) : '' }}
          todayText={formatDate(screen.today)}
        />
      )}
    </section>
  )
}
