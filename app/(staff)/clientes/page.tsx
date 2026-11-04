import Link from 'next/link'
import { Plus } from 'lucide-react'
import { ClientCard } from '@/components/clients/ClientCard'
import { ClientList } from '@/components/clients/ClientList'
import { ClientSearch } from '@/components/clients/ClientSearch'
import { BlockedNotice } from '@/components/shared/BlockedNotice'
import { decide } from '@/lib/auth/decide'
import { getClient, searchClients, summarize } from '@/lib/db/memory/client-store'
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
  const query = one(params.q)
  const wantsInactive = one(params.inactivos) === '1'
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

  const includeInactive = canIncludeInactive && wantsInactive
  const rows = canRead ? searchClients({ text: query, includeInactive }) : []
  const selected = selectedId && canRead ? getClient(selectedId) : null
  const visibleSelected = selected ?? null

  const returnParams = new URLSearchParams()
  if (query) returnParams.set('q', query)
  if (includeInactive) returnParams.set('inactivos', '1')
  const returnQuery = returnParams.size > 0 ? `&${returnParams.toString()}` : ''

  const card = visibleSelected ? toCardData(visibleSelected) : wantsNew && canCreate ? NEW_CLIENT : null

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

      <ClientSearch query={query} includeInactive={includeInactive} canIncludeInactive={canIncludeInactive} />

      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <ClientList
          rows={rows.map(summarize)}
          selectedId={visibleSelected?.id ?? null}
          query={query}
          includeInactive={includeInactive}
        />
        {card ? (
          <ClientCard
            key={card.id ?? 'new'}
            data={card}
            canEdit={card.id ? canEdit : canCreate}
            justSaved={justSaved}
            returnQuery={returnQuery}
          />
        ) : null}
      </div>
    </section>
  )
}
