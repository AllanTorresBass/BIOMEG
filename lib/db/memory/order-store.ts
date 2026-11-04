import 'server-only'

import { registerOrder, updateStub } from '@/lib/db/memory/order-index'
import { computeOrderTotals } from '@/lib/domain/order-totals'
import type { SavedOrder } from '@/types/orders/order.types'

interface OrderStoreState {
  orders: Map<string, SavedOrder>
  byKey: Map<string, string>
  counter: number
  creditNotes?: number
}

const globalStore = globalThis as typeof globalThis & { __biomegOrders?: OrderStoreState }
// The seeded stubs o-1 to o-3 already use the first ids.
const state: OrderStoreState = (globalStore.__biomegOrders ??= { orders: new Map(), byKey: new Map(), counter: 3 })

export function getOrder(id: string): SavedOrder | null {
  return state.orders.get(id) ?? null
}

/** The order a Guardar key already created, if any. This is what makes a double-click safe. */
export function orderForKey(key: string): SavedOrder | null {
  const id = state.byKey.get(key)
  return id ? getOrder(id) : null
}

export type NewOrder = Omit<SavedOrder, 'id' | 'number' | 'invoiceNumber' | 'controlNumber' | 'state' | 'voided' | 'version'>

/** Assigns the numbers and stores the order in one step. Nothing else writes orders. */
export function createOrder(key: string, input: NewOrder, examIds: string[]): SavedOrder {
  const existing = orderForKey(key)
  if (existing) return existing

  state.counter += 1
  const order: SavedOrder = {
    ...input,
    id: `o-${state.counter}`,
    number: String(state.counter).padStart(6, '0'),
    invoiceNumber: String(state.counter).padStart(8, '0'),
    controlNumber: 'Pendiente',
    state: 'ABIERTA',
    voided: null,
    version: 1,
  }
  state.orders.set(order.id, order)
  state.byKey.set(key, order.id)
  registerOrder({
    id: order.id,
    clientId: order.clientId,
    clientName: order.clientName,
    cedulaType: null,
    cedulaDigits: null,
    createdAt: order.savedAt,
    voided: false,
    hasResult: false,
    released: false,
    issued: false,
    needsReview: false,
    examIds,
  })
  return order
}

export interface VoidInput {
  motivo: string
  byId: string
  byName: string
  withCreditNote: boolean
}

/**
 * The order stays stored and keeps its numbers. A credit note takes its own number
 * when money was taken, so the original fiscal number is never reused or erased.
 */
export function voidSavedOrder(id: string, input: VoidInput): SavedOrder | null {
  const order = state.orders.get(id)
  if (!order || order.state === 'ANULADA') return null
  let creditNote: string | null = null
  if (input.withCreditNote) {
    state.creditNotes = (state.creditNotes ?? 0) + 1
    creditNote = `NC-${String(state.creditNotes).padStart(6, '0')}`
  }
  const next: SavedOrder = {
    ...order,
    state: 'ANULADA',
    voided: { motivo: input.motivo, byId: input.byId, byName: input.byName, at: new Date().toISOString(), creditNote },
    version: order.version + 1,
  }
  state.orders.set(id, next)
  updateStub(id, { voided: true })
  return next
}

export type RemoveLineOutcome = { ok: true; order: SavedOrder; removedName: string } | { ok: false; reason: 'NOT_FOUND' | 'LAST_LINE' }

/** The totals are recomputed from the rates the order was saved with. The payments stay as taken. */
export function removeSavedLine(id: string, lineId: string): RemoveLineOutcome {
  const order = state.orders.get(id)
  const line = order?.lines.find((candidate) => candidate.id === lineId)
  if (!order || !line || order.state === 'ANULADA') return { ok: false, reason: 'NOT_FOUND' }
  if (order.lines.length === 1) return { ok: false, reason: 'LAST_LINE' }
  const lines = order.lines.filter((candidate) => candidate.id !== lineId)
  const totals = computeOrderTotals({
    lines,
    rate: order.rateBs === '' ? null : order.rateBs,
    ivaRate: order.ivaRate,
    igtfRate: order.igtfRate,
    discountPct: order.discountPct,
    payments: order.payments,
  })
  const next: SavedOrder = { ...order, lines, totals, version: order.version + 1 }
  state.orders.set(id, next)
  updateStub(id, { examIds: lines.map((candidate) => candidate.examId) })
  return { ok: true, order: next, removedName: line.examName }
}
