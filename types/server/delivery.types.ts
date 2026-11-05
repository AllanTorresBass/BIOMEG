export interface DeliverInput {
  orderId: string
  channel: string
  confirmed?: boolean
  resend: boolean
}
