import type { DeliveryMode, DeliveryRecord } from '@/types/orders/issue.types'

export type SendChannel = 'WHATSAPP' | 'CORREO'

/** A send needs a person to confirm, or a bioanalyst to approve an incomplete order. */
export type DeliveryNeed = 'CONFIRM' | 'STEP_UP' | null

export interface DeliveryActionResult {
  ok: boolean
  message: string
  need: DeliveryNeed
}

export interface DeliveryChannelView {
  channel: SendChannel
  /** Where the message would go. Null when the client has no phone or email on file. */
  destination: string | null
  mode: DeliveryMode
  /** Why the send cannot happen yet. Null means the button is live. */
  blocked: 'NO_CONTACT' | 'NO_CONSENT' | 'NOT_APPROVED' | 'NOT_PERMITTED' | null
  /** The send replaces a report the patient already received. */
  resend: boolean
}

export interface DeliveryRow extends Pick<DeliveryRecord, 'id' | 'channel' | 'recipient' | 'at' | 'mode' | 'status' | 'failure' | 'operatorName' | 'incomplete' | 'missing' | 'resend'> {}

export interface DeliveryView {
  /** LIBERADO sends freely. INCOMPLETO needs an approval first. */
  state: 'LIBERADO' | 'INCOMPLETO'
  missing: string[]
  approvedBy: string | null
  canApprove: boolean
  channels: DeliveryChannelView[]
  rows: DeliveryRow[]
  resendPending: boolean
}
