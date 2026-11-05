import type { DraftPayment } from '@/types/orders/draft.types'

/** One money movement. A reversal is a new row, and the row it reverses stays. */
export interface PaymentEntry extends DraftPayment {
  id: string
  orderId: string
  orderNumber: string
  invoiceNumber: string
  /** The real time, even when a closed drawer sends it to the next period (E-48). */
  at: string
  byId: string
  byName: string
  /** Labels the row when one person works on two PCs (E-13). */
  workstation: string
  closeId: string | null
  reversesId: string | null
  reversedById: string | null
  motivo: string | null
}

export interface CashTotals {
  totalUsd: string
  totalBs: string
}

export interface WorkstationTotals extends CashTotals {
  workstation: string
}

export interface CashInvoice {
  orderId: string
  orderNumber: string
  invoiceNumber: string
  clientName: string
  totalUsd: string
  resta: string
}

export interface CashSummary extends CashTotals {
  /** The rate in force. Other close fields are Unknown. */
  rate: string
  restaOpen: string
  openInvoices: CashInvoice[]
  paidInvoices: CashInvoice[]
  byWorkstation: WorkstationTotals[]
  entryCount: number
}

export interface CashClose {
  id: string
  userId: string
  userName: string
  closedById: string
  closedByName: string
  at: string
  motivo: string | null
  summary: CashSummary
  entryIds: string[]
  reopenedAt: string | null
  reopenedByName: string | null
  reopenMotivo: string | null
}

export interface MonthClose {
  month: string
  byName: string
  at: string
}

export interface PaymentResult {
  ok: boolean
  message: string
  need: 'CONFIRM_OVERRIDE' | 'STEP_UP' | 'MOTIVO' | null
}

export interface PaymentRow {
  id: string
  atText: string
  invoiceNumber: string
  methodLabel: string
  bank: string
  reference: string
  amountText: string
  currency: 'USD' | 'BS'
  byName: string
  workstation: string
  /** Reversed by a later row, or itself the reversal of one. */
  status: 'VIGENTE' | 'REVERSADO' | 'REVERSO'
  canReverse: boolean
}

export interface SelfReversalRow {
  id: string
  atText: string
  invoiceNumber: string
  byName: string
  amountText: string
  currency: 'USD' | 'BS'
  motivo: string
}

export interface AbonoOrderView {
  orderId: string
  number: string
  invoiceNumber: string
  clientName: string
  totalUsd: string
  abono: string
  resta: string
  rate: string
  voided: boolean
}

export interface CloseRow {
  id: string
  atText: string
  userName: string
  closedByName: string
  totalUsd: string
  totalBs: string
  restaOpen: string
  reopened: boolean
  canReopen: boolean
}

export interface DrawerOption {
  id: string
  name: string
}
