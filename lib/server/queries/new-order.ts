import 'server-only'

import { decide } from '@/lib/auth/decide'
import { emptyPayments } from '@/lib/config/payment-methods'
import { getClient, searchClients } from '@/lib/db/memory/client-store'
import { getDraft, startDraft } from '@/lib/db/memory/draft-store'
import { getOrder } from '@/lib/db/memory/order-store'
import { demoSeed } from '@/lib/db/memory/seed'
import { activeCompanies, activePhysicians } from '@/lib/db/memory/registry-store'
import { todayInLab } from '@/lib/server/domain/client-rules'
import { guardRoute } from '@/lib/server/guard'
import { toDecisionSession } from '@/lib/server/session/current'
import { strings } from '@/lib/strings'
import { computeAge, formatAge, formatCedula } from '@/lib/utils/format'
import type { ClientRecord } from '@/types/domain/client.types'
import type { OrderPath } from '@/types/orders/draft.types'
import type { PatientView } from '@/types/orders/screen.types'
import type { StaffContext } from '@/types/session/session.types'

const MAX_MATCHES = 20

export function toPatient(record: ClientRecord): PatientView {
  return {
    id: record.id,
    name: record.fullName,
    cedulaText:
      record.cedulaType && record.cedulaDigits ? formatCedula(record.cedulaType, record.cedulaDigits) : strings.empty.dash,
    ageText: record.birthDate ? formatAge(computeAge(record.birthDate, todayInLab())) : strings.empty.dash,
    verified: record.verified,
  }
}

/** Only for someone holding this draft. The term arrives in a POST body. */
export function searchDraftPatients(context: StaffContext, draftId: string, text: string): PatientView[] {
  if (context.locked || !getDraft(draftId, context.account.id) || text.trim() === '') return []
  return searchClients({ text, includeInactive: false }).slice(0, MAX_MATCHES).map(toPatient)
}

export async function canOpenOrders(context: StaffContext, route = '/ordenes/nueva'): Promise<boolean> {
  return guardRoute(context, ['order.open'], route)
}

export function beginDraft(context: StaffContext, path: OrderPath, clientId?: string): string {
  const draft = startDraft(context.account.id, path)
  if (clientId) {
    const client = getClient(clientId)
    if (client && client.active && !client.deletedAt) {
      draft.clientId = client.id
    }
  }
  return draft.id
}

/** Facturar consulta. An active client opens on Exámenes. Anyone else stays on the search. */
export function beginFacturar(context: StaffContext, clientId?: string): { draftId: string; missingClient: boolean } {
  const draft = startDraft(context.account.id, 'PARTICULAR', 'FACTURAR')
  if (!clientId) return { draftId: draft.id, missingClient: false }
  const client = getClient(clientId)
  if (!client || !client.active || client.deletedAt) return { draftId: draft.id, missingClient: true }
  draft.clientId = client.id
  draft.step = 2
  return { draftId: draft.id, missingClient: false }
}

export function getNewOrderScreen(context: StaffContext, draftId: string) {
  const draft = getDraft(draftId, context.account.id)
  if (!draft) return null
  const stored = draft.clientId ? getClient(draft.clientId) : null
  const client = stored && stored.active ? stored : null
  return {
    draft,
    client,
    step: client ? draft.step : 1,
    saved: draft.savedOrderId ? getOrder(draft.savedOrderId) : null,
    today: todayInLab(),
    canCreateClient: decide({ session: toDecisionSession(context), command: 'client.create', facts: {}, gestures: {} }).allowed,
    physicians: activePhysicians(),
    convenios: activeCompanies(),
    settings: demoSeed.settings,
    priceRows: demoSeed.priceRows,
    emptyPayments: emptyPayments(),
  }
}
