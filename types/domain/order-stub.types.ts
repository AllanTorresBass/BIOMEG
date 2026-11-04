import type { CedulaType } from '@/lib/utils/format'

/**
 * The few order facts the client rules need. Step 2.3 replaces this with real orders
 * and keeps the same questions: does an order exist, did it get a result, was it released.
 */
export interface OrderStub {
  id: string
  clientId: string
  /** The name and cédula this order carries. An issued order keeps what it printed. */
  clientName: string
  cedulaType: CedulaType | null
  cedulaDigits: string | null
  createdAt: string
  voided: boolean
  hasResult: boolean
  released: boolean
  /** A document was issued. Its printed identity never changes. */
  issued: boolean
  /** Set when the birth date or sex changed after a result, so the bioanalyst looks again. */
  needsReview: boolean
  /** Catalog ids of the exams on the order. Used for the same-day, same-exam warning. */
  examIds?: string[]
}

export interface OrderIdentity {
  clientId: string
  clientName: string
  cedulaType: CedulaType | null
  cedulaDigits: string | null
}

export interface MovedOrder {
  orderId: string
  before: OrderIdentity
}

export interface OrderFacts {
  has_order: boolean
  has_result: boolean
  has_released_result: boolean
  order_last_30_days: boolean
}
