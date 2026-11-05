import { redirect } from 'next/navigation'
import { ClientStep } from '@/components/orders/ClientStep'
import { ExamsStep } from '@/components/orders/ExamsStep'
import { PaymentStep } from '@/components/orders/PaymentStep'
import { PersonalStep } from '@/components/orders/PersonalStep'
import { SavedOrderPanel } from '@/components/orders/SavedOrderPanel'
import { BlockedNotice } from '@/components/shared/BlockedNotice'
import { toCatalog, toLineView, toTotalsView } from '@/lib/server/domain/order-draft-view'
import { beginDraft, canOpenOrders, getNewOrderScreen, toPatient } from '@/lib/server/queries/new-order'
import { requireReadyStaff } from '@/lib/server/session/require'
import { strings } from '@/lib/strings'
import { LAB_TIME_ZONE, formatDate } from '@/lib/utils/format'
import type { SearchParams } from '@/types/app/page.types'

const text = strings.pendingReview.orders

function one(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? '') : (value ?? '')
}

export default async function NewOrderPage({ searchParams }: { searchParams: SearchParams }) {
  const context = await requireReadyStaff()
  if (context.locked) return null
  if (!(await canOpenOrders(context))) return <BlockedNotice />

  const params = await searchParams
  const draftId = one(params.d)
  if (draftId === '') redirect(`/ordenes/nueva?d=${beginDraft(context, one(params.via) === 'empresa' ? 'EMPRESA' : 'PARTICULAR')}`)
  const screen = getNewOrderScreen(context, draftId)
  if (!screen) redirect('/ordenes/nueva')
  const { draft, client, step, saved, settings } = screen

  const heading = draft.path === 'EMPRESA' ? text.pathEmpresa : text.pathParticular

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="text-xl font-semibold">{heading}</h1>
        <ol className="flex gap-4 text-sm" aria-label={text.stepsLabel}>
          {text.steps.map((label, index) => (
            <li key={label} aria-current={step === index + 1 ? 'step' : undefined} className={step === index + 1 ? 'font-semibold' : 'text-muted-foreground'}>
              {label}
            </li>
          ))}
        </ol>
      </div>

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
          canCreateClient={screen.canCreateClient}
        />
      ) : step === 3 ? (
        <PersonalStep
          draftId={draft.id}
          patient={toPatient(client)}
          physicianId={draft.physicianId}
          physicians={screen.physicians}
        />
      ) : step === 4 ? (
        <PaymentStep
          draftId={draft.id}
          patient={toPatient(client)}
          isEmpresa={draft.path === 'EMPRESA'}
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
        />
      )}
    </section>
  )
}
