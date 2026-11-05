'use server'

import { revalidatePath } from 'next/cache'
import {
  approveIncomplete,
  clearIncompleteApproval,
  completeResendTask,
  incompleteApprovalOf,
  recordDelivery,
  updateDelivery,
} from '@/lib/db/memory/delivery-store'
import { getClient } from '@/lib/db/memory/client-store'
import { printedLinesOf, replaceIssue, vigenteIssueOf } from '@/lib/db/memory/issue-store'
import { getStub } from '@/lib/db/memory/order-index'
import { resultOrderState } from '@/lib/domain/result-rules'
import { auditEvent } from '@/lib/server/audit'
import { currentProvider } from '@/lib/server/delivery/provider'
import {
  blockedReason,
  deliveryModeAllowed,
  deliveryStateOf,
  destinationOf,
  messageFor,
  missingSectionsOf,
  modeOf,
  resendChannelsOf,
} from '@/lib/server/domain/delivery'
import { gate, gated, record } from '@/lib/server/draft-gate'
import { requestOrigin } from '@/lib/server/origin'
import { getStaffContext } from '@/lib/server/session/current'
import { strings } from '@/lib/strings'
import type { DeliveryActionResult, SendChannel } from '@/types/orders/delivery.types'

const text = strings.delivery

function refuse(message: string): DeliveryActionResult {
  return { ok: false, message, need: null }
}

function isChannel(value: string): value is SendChannel {
  return value === 'WHATSAPP' || value === 'CORREO'
}

/** A bioanalyst lets Recepción send an order that is only partly released. The password is asked again. */
export async function approveIncompleteSend(input: { orderId: string }): Promise<DeliveryActionResult> {
  const context = await getStaffContext()
  if (!context || context.locked) return refuse(text.notAllowed)
  const stub = getStub(input.orderId)
  if (!stub || stub.voided) return refuse(text.notAllowed)
  if (deliveryStateOf(stub) !== 'INCOMPLETO') return refuse(text.notReady)

  const target = { recordType: 'order', recordId: stub.id, state: resultOrderState(stub) }
  const allowed = await gate({ context }, 'delivery.approve_incomplete', { state: 'INCOMPLETO' }, {}, target)
  if (gated(allowed)) {
    if (allowed.need === 'STEP_UP') return { ok: false, message: '', need: 'STEP_UP' }
    return refuse(text.notAllowed)
  }

  const missing = missingSectionsOf(stub.id)
  approveIncomplete({
    orderId: stub.id,
    approvedBy: context.account.displayName,
    approvedAt: new Date().toISOString(),
    missing,
  })
  await record({ context }, 'delivery.incomplete.approve', allowed.rowId, { before: null, after: missing, field: 'missing' }, undefined, target)
  revalidatePath(`/ordenes/${stub.id}/reporte`)
  return { ok: true, message: text.approvedDone, need: null }
}

interface DeliverInput {
  orderId: string
  channel: string
  confirmed?: boolean
  resend: boolean
}

/** Stores the delivery before the provider is called, so a failure still leaves a row and the order unchanged. */
async function deliver(input: DeliverInput): Promise<DeliveryActionResult> {
  const context = await getStaffContext()
  if (!context || context.locked) return refuse(text.notAllowed)
  const stub = getStub(input.orderId)
  if (!stub || stub.voided || !isChannel(input.channel)) return refuse(text.notAllowed)
  const channel = input.channel

  const state = deliveryStateOf(stub)
  if (!state) return refuse(text.notReady)
  if (input.resend && !resendChannelsOf(stub.id).includes(channel)) return refuse(text.nothingToResend)

  const client = getClient(stub.clientId)
  const noContact = blockedReason(client, channel) === 'NO_CONTACT'
  if (noContact) return refuse(text.noContact[channel])

  const approval = state === 'INCOMPLETO' ? incompleteApprovalOf(stub.id) : null
  const target = { recordType: 'order', recordId: stub.id, state: resultOrderState(stub) }
  const command = input.resend ? 'delivery.resend' : 'delivery.send'
  const allowed = await gate(
    { context },
    command,
    {
      state,
      delivery_mode_allowed: deliveryModeAllowed(client, channel),
      incomplete_approved: approval !== null,
      has_resend_task: resendChannelsOf(stub.id).includes(channel),
    },
    { confirmed: input.confirmed },
    target,
  )
  if (gated(allowed)) {
    if (allowed.need === 'CONFIRM_OVERRIDE') return { ok: false, message: '', need: 'CONFIRM' }
    if (blockedReason(client, channel) === 'NO_CONSENT') return refuse(text.noConsent)
    if (state === 'INCOMPLETO' && !approval) return refuse(text.needsApproval)
    return refuse(text.notAllowed)
  }

  let issueId: string | null = null
  if (state === 'LIBERADO') {
    let issue = vigenteIssueOf(stub.id)
    if (!issue) {
      issue = replaceIssue(stub.id, printedLinesOf(stub.id)).issue
      await auditEvent({
        command: 'report.issue',
        outcome: 'ALLOWED',
        session: context.session,
        account: context.account,
        ...target,
        rowId: allowed.rowId,
        change: { before: null, after: issue.id, field: 'issue' },
      })
    }
    issueId = issue.id
  }

  const to = destinationOf(client, channel) as string
  const mode = modeOf(client)
  const incomplete = state === 'INCOMPLETO'
  const orderNumber = stub.number ?? stub.id
  const delivery = recordDelivery({
    orderId: stub.id,
    issueId,
    channel,
    recipient: to,
    mode,
    status: 'PENDING',
    failure: null,
    operatorName: context.account.displayName,
    orderNumber,
    incomplete,
    missing: incomplete ? (approval?.missing ?? missingSectionsOf(stub.id)) : [],
    resend: input.resend,
  })

  const auditCommand = channel === 'WHATSAPP' ? 'delivery.whatsapp' : 'delivery.email'
  const origin = await requestOrigin()
  let failure: string | null = null
  try {
    const result = await currentProvider().send(
      messageFor({ channel, to, mode, orderNumber, origin, resend: input.resend, incomplete }),
    )
    if (!result.ok) failure = result.reason
  } catch {
    failure = text.failed
  }

  if (failure) {
    updateDelivery(delivery.id, { status: 'FAILED', failure })
    await record(
      { context },
      auditCommand,
      allowed.rowId,
      { before: null, after: { id: delivery.id, status: 'FAILED', incomplete }, field: 'delivery' },
      undefined,
      target,
    )
    revalidatePath(`/ordenes/${stub.id}/reporte`)
    return refuse(text.failed)
  }

  updateDelivery(delivery.id, { status: 'SENT' })
  if (input.resend && resendChannelsOf(stub.id).length === 0) completeResendTask(stub.id)
  if (state === 'LIBERADO') clearIncompleteApproval(stub.id)
  await record(
    { context },
    auditCommand,
    allowed.rowId,
    { before: null, after: { id: delivery.id, status: 'SENT', mode, incomplete }, field: 'delivery' },
    undefined,
    target,
  )
  revalidatePath(`/ordenes/${stub.id}/reporte`)
  return { ok: true, message: text.sentDone(text.channel[channel]), need: null }
}

export async function sendDelivery(input: {
  orderId: string
  channel: string
  confirmed?: boolean
}): Promise<DeliveryActionResult> {
  return deliver({ ...input, resend: false })
}

/** Sends the current report again after a correction replaced the one the patient already had. */
export async function resendDelivery(input: {
  orderId: string
  channel: string
  confirmed?: boolean
}): Promise<DeliveryActionResult> {
  return deliver({ ...input, resend: true })
}
