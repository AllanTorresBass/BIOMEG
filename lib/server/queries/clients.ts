import 'server-only'

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
import { strings } from '@/lib/strings'
import { computeAge, formatAge, formatDate } from '@/lib/utils/format'
import type { ClientCardData } from '@/types/clients/card.types'
import type { ClientRecord } from '@/types/domain/client.types'
import type { StaffContext } from '@/types/session/session.types'

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

// A missing confirm, step-up or motivo still shows the button; the command asks for it.
const ASKS_FOR_GESTURE = new Set(['CONFIRM', 'STEP_UP', 'MOTIVO_REQUIRED'])

export async function getClientsScreen(context: StaffContext, selectedId: string, wantsNew: boolean) {
  if (!(await guardRoute(context, ['client.read'], '/clientes'))) return { kind: 'BLOCKED' } as const

  const session = toDecisionSession(context)
  const canIncludeInactive = decide({ session, command: 'client.include_inactive' }).allowed
  const canCreate = decide({ session, command: 'client.create' }).allowed
  const canEdit = decide({ session, command: 'client.update', facts: NO_ORDERS_OR_RESULTS }).allowed
  const canRead = decide({ session, command: 'client.read', facts: { on_worklist: false } }).allowed

  const rows = canRead ? searchClients({ text: '', includeInactive: false }).map(summarize) : []
  const selected = selectedId && canRead ? getClient(selectedId) : null
  const card = selected ? toCardData(selected) : wantsNew && canCreate ? NEW_CLIENT : null

  const may = (command: string, facts: Record<string, boolean>) => {
    const decision = decide({ session, command, facts })
    return decision.allowed || ASKS_FOR_GESTURE.has(decision.reason)
  }
  const lifecycle = selected
    ? {
        clientId: selected.id,
        clientName: selected.fullName,
        active: selected.active,
        capabilities: {
          deactivate: may('client.deactivate', {}),
          remove: may('client.delete', { order_last_30_days: false }),
          correctCedula: may('client.cedula.correct', { has_order: orderFacts(selected.id).has_order }),
          requestMerge: may('client.merge.request', {}),
          merge: may('client.merge', { both_complete_and_different: false }),
          unmerge: may('client.unmerge', {}),
        },
        candidates: listMergeCandidates(selected.id),
        merges: listOpenMerges()
          .filter((entry) => entry.survivorId === selected.id)
          .map(({ id, sourceName, mergedAt, mergedBy }) => ({ id, sourceName, mergedAt, mergedBy })),
        requests: listMergeRequests(selected.id).map(({ note, requestedBy, requestedAt }) => ({ note, requestedBy, requestedAt })),
      }
    : null

  return { kind: 'READY', rows, selectedId: selected?.id ?? null, card, lifecycle, canIncludeInactive, canCreate, canEdit } as const
}
