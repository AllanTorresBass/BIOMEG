import Link from 'next/link'
import { Plus } from 'lucide-react'
import { ClientCard } from '@/components/clients/ClientCard'
import { ClientLifecycle } from '@/components/clients/ClientLifecycle'
import { ClientBrowser } from '@/components/clients/ClientBrowser'
import { BlockedNotice } from '@/components/shared/BlockedNotice'
import { decide } from '@/lib/auth/decide'
import {
  getClient,
  listMergeCandidates,
  listMergeRequests,
  listOpenMerges,
  searchClients,
  summarize,
} from '@/lib/db/memory/client-store'
import { orderFacts } from '@/lib/db/memory/order-index'
import { todayInLab } from '@/lib/server/domain/client-rules'
import { guardRoute } from '@/lib/server/guard'
import { toDecisionSession } from '@/lib/server/session/current'
import { requireReadyStaff } from '@/lib/server/session/require'
import { strings } from '@/lib/strings'
import { computeAge, formatAge, formatDate } from '@/lib/utils/format'
import type { ClientCardData } from '@/types/clients/card.types'
import type { ClientRecord } from '@/types/domain/client.types'

type SearchParams = Promise<Record<string, string | string[] | undefined>>

function one(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? '') : (value ?? '')
}

const NO_ORDERS_OR_RESULTS = {
  cedula_changed: false,
  dob_or_sex_changed: false,
  contact_changed: false,
  has_order: false,
  has_result: false,
  has_released_result: false,
} as const

function toCardData(record: ClientRecord): ClientCardData {
  const consentOn = (channel: 'WHATSAPP' | 'EMAIL') =>
    record.consents.some((entry) => entry.channel === channel && entry.withdrawnAt === null)
  return {
    id: record.id,
    version: record.version,
    fullName: record.fullName,
    cedulaType: record.cedulaType ?? '',
    cedulaNumber: record.cedulaDigits ?? '',
    birthDate: formatDate(record.birthDate),
    ageText: formatAge(computeAge(record.birthDate, todayInLab())),
    sex: record.sex ?? '',
    phone: record.phone ?? '',
    email: record.email ?? '',
    verified: record.verified,
    active: record.active,
    consentWhatsapp: consentOn('WHATSAPP'),
    consentEmail: consentOn('EMAIL'),
  }
}

const NEW_CLIENT: ClientCardData = {
  id: null,
  version: null,
  fullName: '',
  cedulaType: '',
  cedulaNumber: '',
  birthDate: '',
  ageText: strings.empty.dash,
  sex: '',
  phone: '',
  email: '',
  verified: false,
  active: true,
  consentWhatsapp: false,
  consentEmail: false,
}

export default async function ClientsPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams
  const selectedId = one(params.id)
  const wantsNew = one(params.nuevo) === '1'
  const justSaved = one(params.saved) === '1'

  const context = await requireReadyStaff()
  if (context.locked) return null
  if (!(await guardRoute(context, ['client.read'], '/clientes'))) return <BlockedNotice />

  const session = toDecisionSession(context)
  const canIncludeInactive = decide({ session, command: 'client.include_inactive' }).allowed
  const canCreate = decide({ session, command: 'client.create' }).allowed
  const canEdit = decide({ session, command: 'client.update', facts: NO_ORDERS_OR_RESULTS }).allowed
  // Worklists arrive in a later step, so no client is on one yet.
  const canRead = decide({ session, command: 'client.read', facts: { on_worklist: false } }).allowed

  const rows = canRead ? searchClients({ text: '', includeInactive: false }) : []
  const selected = selectedId && canRead ? getClient(selectedId) : null
  const visibleSelected = selected ?? null

  const card = visibleSelected ? toCardData(visibleSelected) : wantsNew && canCreate ? NEW_CLIENT : null

  // A missing confirm, step-up or motivo still shows the button; the action asks for it.
  const asksForGesture = new Set(['CONFIRM', 'STEP_UP', 'MOTIVO_REQUIRED'])
  const may = (command: string, facts: Record<string, boolean>) => {
    const decision = decide({ session, command, facts })
    return decision.allowed || asksForGesture.has(decision.reason)
  }
  const lifecycle = visibleSelected
    ? {
        clientId: visibleSelected.id,
        clientName: visibleSelected.fullName,
        active: visibleSelected.active,
        capabilities: {
          deactivate: may('client.deactivate', {}),
          remove: may('client.delete', { order_last_30_days: false }),
          correctCedula: may('client.cedula.correct', { has_order: orderFacts(visibleSelected.id).has_order }),
          requestMerge: may('client.merge.request', {}),
          merge: may('client.merge', { both_complete_and_different: false }),
          unmerge: may('client.unmerge', {}),
        },
        candidates: listMergeCandidates(visibleSelected.id),
        merges: listOpenMerges()
          .filter((entry) => entry.survivorId === visibleSelected.id)
          .map(({ id, sourceName, mergedAt, mergedBy }) => ({ id, sourceName, mergedAt, mergedBy })),
        requests: listMergeRequests(visibleSelected.id).map(({ note, requestedBy, requestedAt }) => ({
          note,
          requestedBy,
          requestedAt,
        })),
      }
    : null

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">{strings.clients.title}</h1>
        {canCreate ? (
          <Link
            href="/clientes?nuevo=1"
            className="inline-flex h-10 items-center gap-2 rounded-[var(--radius-control)] bg-primary px-4 font-semibold text-primary-foreground"
          >
            <Plus aria-hidden className="size-4" />
            {strings.pendingReview.clients.newClient}
          </Link>
        ) : null}
      </div>

      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <ClientBrowser
          initialRows={rows.map(summarize)}
          selectedId={visibleSelected?.id ?? null}
          canIncludeInactive={canIncludeInactive}
        />
        {card ? (
          <div className="flex flex-col gap-4">
            <ClientCard
              key={card.id ?? 'new'}
              data={card}
              canEdit={card.id ? canEdit : canCreate}
              justSaved={justSaved}
            />
            {lifecycle ? <ClientLifecycle key={`lifecycle-${lifecycle.clientId}`} {...lifecycle} /> : null}
          </div>
        ) : null}
      </div>
    </section>
  )
}
