import 'server-only'

import { getClient } from '@/lib/db/memory/client-store'
import { deliveryListOf, incompleteApprovalOf, resendTasksOf } from '@/lib/db/memory/delivery-store'
import { sectionsWithResults } from '@/lib/db/memory/result-store'
import { demoSeed } from '@/lib/db/memory/seed'
import { reportKindOf } from '@/lib/server/domain/report'
import type { ProviderMessage } from '@/types/contracts/ports.contracts'
import { strings } from '@/lib/strings'
import type { ClientRecord } from '@/types/domain/client.types'
import type { OrderStub } from '@/types/domain/order-stub.types'
import type { DeliveryChannelView, DeliveryView, SendChannel } from '@/types/orders/delivery.types'
import type { DeliveryMode } from '@/types/orders/issue.types'
import type { DeliveryState } from '@/types/domain/delivery.types'

const text = strings.delivery

/** Only a released order or a partly loaded one can be sent. A report in review or an empty one cannot. */
export function deliveryStateOf(stub: Pick<OrderStub, 'hasResult' | 'released' | 'correctionOpen'>): DeliveryState | null {
  const kind = reportKindOf(stub)
  if (kind === 'ISSUED') return 'LIBERADO'
  if (kind === 'DRAFT') return 'INCOMPLETO'
  return null
}

export function missingSectionsOf(orderId: string): string[] {
  const filled = new Set(sectionsWithResults(orderId))
  const all = [...new Set(demoSeed.resultLines.map((line) => line.section))]
  return all.filter((title) => !filled.has(title))
}

export function destinationOf(client: ClientRecord | null, channel: SendChannel): string | null {
  const value = channel === 'WHATSAPP' ? client?.phone : client?.email
  return value && value.trim() ? value.trim() : null
}

export function hasConsent(client: ClientRecord | null, channel: SendChannel): boolean {
  const wanted = channel === 'WHATSAPP' ? 'WHATSAPP' : 'EMAIL'
  return Boolean(client?.consents.some((entry) => entry.channel === wanted && entry.withdrawnAt === null))
}

/** A link when the portal sign-in code works and the client can use it. Otherwise the report goes as an attachment. */
export function modeOf(client: ClientRecord | null): DeliveryMode {
  return demoSeed.settings.portalCodeWorks && client?.verified ? 'PORTAL_LINK' : 'ATTACHMENT'
}

/** The fact the permission table reads. An attachment carries a result, so it needs recorded consent and a destination. */
export function deliveryModeAllowed(client: ClientRecord | null, channel: SendChannel): boolean {
  if (!destinationOf(client, channel)) return false
  return modeOf(client) === 'PORTAL_LINK' || hasConsent(client, channel)
}

export function blockedReason(client: ClientRecord | null, channel: SendChannel): 'NO_CONTACT' | 'NO_CONSENT' | null {
  if (!destinationOf(client, channel)) return 'NO_CONTACT'
  if (modeOf(client) === 'ATTACHMENT' && !hasConsent(client, channel)) return 'NO_CONSENT'
  return null
}

export function resendChannelsOf(orderId: string): SendChannel[] {
  const task = resendTasksOf(orderId)[0]
  if (!task) return []
  const done = new Set(
    deliveryListOf(orderId)
      .filter((row) => row.resend && row.status === 'SENT' && row.issueId === task.toIssueId)
      .map((row) => row.channel),
  )
  const channels = new Set<SendChannel>()
  for (const delivery of task.deliveries) {
    if ((delivery.channel === 'WHATSAPP' || delivery.channel === 'CORREO') && delivery.status !== 'FAILED' && !done.has(delivery.channel)) {
      channels.add(delivery.channel)
    }
  }
  return [...channels]
}

export function messageFor(input: {
  channel: SendChannel
  to: string
  mode: DeliveryMode
  orderNumber: string
  origin: string | null
  resend: boolean
  incomplete: boolean
}): ProviderMessage {
  const { channel, to, mode, orderNumber, origin, resend, incomplete } = input
  const link = mode === 'PORTAL_LINK' ? `${origin ?? ''}/ingresar` : null
  const body =
    mode === 'PORTAL_LINK'
      ? text.message.link(strings.brand.name, orderNumber)
      : text.message.attachment(strings.brand.name, orderNumber, resend, incomplete)
  return {
    channel,
    to,
    subject: channel === 'CORREO' ? text.message.subject(strings.brand.name, orderNumber) : null,
    body,
    link,
    attachmentName: mode === 'ATTACHMENT' ? `orden-${orderNumber}.pdf` : null,
    headerImage: channel === 'CORREO' ? '/brand/logo.png' : null,
  }
}

/** What the delivery panel shows. `permitted` says whether the signed-in role may send at all. */
export function buildDeliveryView(stub: OrderStub, permitted: { send: boolean; approve: boolean }): DeliveryView | null {
  const state = deliveryStateOf(stub)
  if (!state) return null
  const client = getClient(stub.clientId)
  const approval = state === 'INCOMPLETO' ? incompleteApprovalOf(stub.id) : null
  const pending = new Set(resendChannelsOf(stub.id))
  const channels: DeliveryChannelView[] = (['WHATSAPP', 'CORREO'] as const).map((channel) => {
    const blocked = blockedReason(client, channel)
    const notApproved = state === 'INCOMPLETO' && !approval
    return {
      channel,
      destination: destinationOf(client, channel),
      mode: modeOf(client),
      blocked: !permitted.send ? 'NOT_PERMITTED' : blocked ?? (notApproved ? 'NOT_APPROVED' : null),
      resend: pending.has(channel),
    }
  })
  return {
    state,
    missing: state === 'INCOMPLETO' ? missingSectionsOf(stub.id) : [],
    approvedBy: approval?.approvedBy ?? null,
    canApprove: state === 'INCOMPLETO' && permitted.approve && !approval,
    channels,
    rows: deliveryListOf(stub.id),
    resendPending: pending.size > 0,
  }
}
