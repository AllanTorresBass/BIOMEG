import { redirect } from 'next/navigation'
import { ClientStep } from '@/components/orders/ClientStep'
import { ExamsStep } from '@/components/orders/ExamsStep'
import { PaymentStep } from '@/components/orders/PaymentStep'
import { PersonalStep } from '@/components/orders/PersonalStep'
import { SavedOrderPanel } from '@/components/orders/SavedOrderPanel'
import { BlockedNotice } from '@/components/shared/BlockedNotice'
import { decide } from '@/lib/auth/decide'
import { getClient, searchClients } from '@/lib/db/memory/client-store'
import { getDraft, startDraft } from '@/lib/db/memory/draft-store'
import { getOrder } from '@/lib/db/memory/order-store'
import { emptyPayments } from '@/lib/config/payment-methods'
import { demoSeed } from '@/lib/db/memory/seed'
import { todayInLab } from '@/lib/server/domain/client-rules'
import { toCatalog, toLineView, toTotalsView } from '@/lib/server/domain/order-draft-view'
import { guardRoute } from '@/lib/server/guard'
import { toDecisionSession } from '@/lib/server/session/current'
import { requireReadyStaff } from '@/lib/server/session/require'
import { strings } from '@/lib/strings'
import { LAB_TIME_ZONE, computeAge, formatAge, formatCedula, formatDate } from '@/lib/utils/format'
import type { ClientRecord } from '@/types/domain/client.types'
import type { PatientView } from '@/types/orders/screen.types'
import type { SearchParams } from '@/types/app/page.types'

const text = strings.pendingReview.orders

function one(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? '') : (value ?? '')
}

function toPatient(record: ClientRecord): PatientView {
  return {
    id: record.id,
    name: record.fullName,
    cedulaText:
      record.cedulaType && record.cedulaDigits ? formatCedula(record.cedulaType, record.cedulaDigits) : strings.empty.dash,
    ageText: record.birthDate ? formatAge(computeAge(record.birthDate, todayInLab())) : strings.empty.dash,
    verified: record.verified,
  }
}

export default async function NewOrderPage({ searchParams }: { searchParams: SearchParams }) {
  const context = await requireReadyStaff()
  if (context.locked) return null
  if (!(await guardRoute(context, ['order.open'], '/ordenes/nueva'))) return <BlockedNotice />

  const params = await searchParams
  const draftId = one(params.d)
  if (draftId === '') {
    const draft = startDraft(context.account.id, one(params.via) === 'empresa' ? 'EMPRESA' : 'PARTICULAR')
    redirect(`/ordenes/nueva?d=${draft.id}`)
  }
  const draft = getDraft(draftId, context.account.id)
  if (!draft) redirect('/ordenes/nueva')

  const stored = draft.clientId ? getClient(draft.clientId) : null
  const client = stored && stored.active ? stored : null
  const step = client ? draft.step : 1
  const saved = draft.savedOrderId ? getOrder(draft.savedOrderId) : null

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
          query={one(params.q)}
          patient={client ? toPatient(client) : null}
          results={
            one(params.q).trim() === ''
              ? []
              : searchClients({ text: one(params.q), includeInactive: false }).slice(0, 20).map(toPatient)
          }
          visit={{ motivo: draft.motivo, sampleDate: draft.sampleDate ? formatDate(draft.sampleDate) : '' }}
          todayText={formatDate(todayInLab())}
          canCreateClient={
            decide({ session: toDecisionSession(context), command: 'client.create', facts: {}, gestures: {} }).allowed
          }
        />
      ) : step === 3 ? (
        <PersonalStep
          draftId={draft.id}
          patient={toPatient(client)}
          physicianId={draft.physicianId}
          physicians={demoSeed.physicians}
        />
      ) : step === 4 ? (
        <PaymentStep
          draftId={draft.id}
          patient={toPatient(client)}
          isEmpresa={draft.path === 'EMPRESA'}
          convenios={demoSeed.companies.filter((company) => company.active)}
          convenioId={draft.convenioId}
          titular={draft.titular}
          razonSocial={draft.billing.razonSocial}
          payments={draft.payments.length > 0 ? draft.payments : emptyPayments()}
          discountPct={draft.discountPct}
          discountMotivo={draft.discountMotivo}
          discountLimit={demoSeed.settings.discountLimit}
          linePrices={draft.lines.map((line) => line.priceUsd)}
          rate={demoSeed.settings.rateBs}
          rateDate={demoSeed.settings.rateDate}
          ivaRate={demoSeed.settings.ivaRate}
          igtfRate={demoSeed.settings.igtfRate}
        />
      ) : (
        <ExamsStep
          draftId={draft.id}
          patient={toPatient(client)}
          costType={draft.costType}
          billing={draft.billing}
          catalog={toCatalog(demoSeed.priceRows)}
          lines={draft.lines.map(toLineView)}
          totals={toTotalsView(draft.lines, demoSeed.settings.rateBs)}
          rateMissing={demoSeed.settings.rateBs === ''}
        />
      )}
    </section>
  )
}
