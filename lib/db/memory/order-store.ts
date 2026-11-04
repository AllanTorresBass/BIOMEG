import 'server-only'

import { registerOrder } from '@/lib/db/memory/order-index'
import type { SavedOrder } from '@/types/orders/order.types'

interface OrderStoreState {
  orders: Map<string, SavedOrder>
  byKey: Map<string, string>
  counter: number
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

export type NewOrder = Omit<SavedOrder, 'id' | 'number' | 'invoiceNumber' | 'controlNumber' | 'state' | 'version'>

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
