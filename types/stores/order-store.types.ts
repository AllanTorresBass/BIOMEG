import type { SavedOrder } from '@/types/orders/order.types'

export interface OrderStoreState {
  orders: Map<string, SavedOrder>
  byKey: Map<string, string>
  counter: number
  creditNotes?: number
}

export type NewOrder = Omit<SavedOrder, 'id' | 'number' | 'invoiceNumber' | 'controlNumber' | 'state' | 'voided' | 'version'>

export interface VoidInput {
  motivo: string
  byId: string
  byName: string
  withCreditNote: boolean
}

export type RemoveLineOutcome = { ok: true; order: SavedOrder; removedName: string } | { ok: false; reason: 'NOT_FOUND' | 'LAST_LINE' }
