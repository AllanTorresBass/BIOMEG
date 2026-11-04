import type { OrderTotals } from '@/lib/domain/order-totals'
import type { CostType, DraftBilling, DraftLine, DraftPayment, OrderPath } from '@/types/orders/draft.types'

/** Why and by whom an order was voided. The order stays stored. */
export interface VoidRecord {
  motivo: string
  byId: string
  byName: string
  at: string
  /** Set when a payment existed. The fiscal number of the original is never reused. */
  creditNote: string | null
}

/** A saved order. It keeps what was true when it was saved: the rate, the tax rates, the prices. */
export interface SavedOrder {
  id: string
  /** Zero-padded N° orden. */
  number: string
  invoiceNumber: string
  /** Pendiente until the fiscal machine assigns one. */
  controlNumber: string
  state: 'ABIERTA' | 'ANULADA'
  voided: VoidRecord | null
  clientId: string
  clientName: string
  path: OrderPath
  physicianId: string | null
  physicianName: string | null
  convenioId: string | null
  convenioName: string | null
  titular: string
  billing: DraftBilling
  costType: CostType | null
  motivo: string
  sampleDate: string | null
  lines: DraftLine[]
  payments: DraftPayment[]
  discountPct: string
  discountMotivo: string
  rateBs: string
  rateDate: string
  ivaRate: string | null
  igtfRate: string | null
  totals: OrderTotals
  savedById: string
  savedByName: string
  savedAt: string
  version: number
}

/** A quote is not an order: it has no invoice number and never enters the work list. */
export interface Quote {
  id: string
  number: string
  clientId: string
  clientName: string
  billing: DraftBilling
  lines: DraftLine[]
  discountPct: string
  rateBs: string
  rateDate: string
  ivaRate: string | null
  igtfRate: string | null
  totals: OrderTotals
  createdByName: string
  createdAt: string
}
