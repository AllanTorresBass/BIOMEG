import 'server-only'

import { demoSeed } from '@/lib/db/memory/seed'
import type { CedulaType } from '@/lib/utils/format'
import type { MovedOrder, OrderFacts, OrderIdentity, OrderStub } from '@/types/domain/order-stub.types'

const DAY_MS = 86_400_000
const RECENT_DAYS = 30

interface OrderIndexState {
  orders: Map<string, OrderStub>
}

function daysAgo(days: number): string {
  return new Date(Date.now() - days * DAY_MS).toISOString()
}

function buildState(): OrderIndexState {
  const orders = new Map<string, OrderStub>()
  const identity = (clientId: string) => {
    const client = demoSeed.clients.find((candidate) => candidate.id === clientId)
    return {
      clientName: client?.fullName ?? '',
      cedulaType: (client?.cedulaType ?? null) as CedulaType | null,
      cedulaDigits: client?.cedulaDigits ?? null,
    }
  }
  const add = (stub: Omit<OrderStub, 'clientName' | 'cedulaType' | 'cedulaDigits' | 'needsReview'>) =>
    orders.set(stub.id, { ...stub, ...identity(stub.clientId), needsReview: false })

  // A recent released and issued order, an old open order, and an old voided order.
  add({ id: 'o-1', clientId: 'c-1', createdAt: daysAgo(5), voided: false, hasResult: true, released: true, issued: true })
  add({ id: 'o-2', clientId: 'c-2', createdAt: daysAgo(90), voided: false, hasResult: false, released: false, issued: false })
  add({ id: 'o-3', clientId: 'c-6', createdAt: daysAgo(60), voided: true, hasResult: false, released: false, issued: false })
  return { orders }
}

const globalStore = globalThis as typeof globalThis & { __biomegOrderIndex?: OrderIndexState }
const state: OrderIndexState = (globalStore.__biomegOrderIndex ??= buildState())

export function allOrders(): OrderStub[] {
  return [...state.orders.values()]
}

/** A saved order enters the index so the same-day check and the client rules see it. */
export function registerOrder(stub: OrderStub): void {
  state.orders.set(stub.id, stub)
}

export function getStub(id: string): OrderStub | null {
  return state.orders.get(id) ?? null
}

/** Voiding and result work change the facts the other rules read. */
export function updateStub(id: string, patch: Partial<OrderStub>): OrderStub | null {
  const current = state.orders.get(id)
  if (!current) return null
  const next = { ...current, ...patch }
  state.orders.set(id, next)
  return next
}

export function ordersOf(clientId: string): OrderStub[] {
  return [...state.orders.values()].filter((order) => order.clientId === clientId)
}

/** Voided orders count: a client who ever had an order keeps the cédula it was issued under. */
export function orderFacts(clientId: string, now: number = Date.now()): OrderFacts {
  const orders = ordersOf(clientId)
  return {
    has_order: orders.length > 0,
    has_result: orders.some((order) => order.hasResult),
    has_released_result: orders.some((order) => order.released),
    order_last_30_days: orders.some((order) => now - new Date(order.createdAt).getTime() <= RECENT_DAYS * DAY_MS),
  }
}

/** A rename or cédula correction reaches orders not yet issued. Issued ones keep what they printed. */
export function syncIdentity(clientId: string, identity: Omit<OrderIdentity, 'clientId'>): string[] {
  const touched: string[] = []
  for (const order of ordersOf(clientId)) {
    if (order.issued) continue
    order.clientName = identity.clientName
    order.cedulaType = identity.cedulaType
    order.cedulaDigits = identity.cedulaDigits
    touched.push(order.id)
  }
  return touched
}

/** Birth date or sex changed after a result. The age on screen recalculates; a released report keeps its printed age. */
export function flagForReview(clientId: string): string[] {
  const flagged: string[] = []
  for (const order of ordersOf(clientId)) {
    if (!order.hasResult) continue
    order.needsReview = true
    flagged.push(order.id)
  }
  return flagged
}

/** Moves every order of a client to another and returns the map that lets the move be undone. */
export function moveOrders(fromClientId: string, to: OrderIdentity): MovedOrder[] {
  const moved: MovedOrder[] = []
  for (const order of ordersOf(fromClientId)) {
    moved.push({
      orderId: order.id,
      before: {
        clientId: order.clientId,
        clientName: order.clientName,
        cedulaType: order.cedulaType,
        cedulaDigits: order.cedulaDigits,
      },
    })
    order.clientId = to.clientId
    order.clientName = to.clientName
    order.cedulaType = to.cedulaType
    order.cedulaDigits = to.cedulaDigits
  }
  return moved
}

export function restoreOrders(moved: readonly MovedOrder[]): number {
  let restored = 0
  for (const entry of moved) {
    const order = state.orders.get(entry.orderId)
    if (!order) continue
    order.clientId = entry.before.clientId
    order.clientName = entry.before.clientName
    order.cedulaType = entry.before.cedulaType
    order.cedulaDigits = entry.before.cedulaDigits
    restored += 1
  }
  return restored
}

export function insertOrderStub(
  stub: Pick<OrderStub, 'id' | 'clientId' | 'clientName' | 'cedulaType' | 'cedulaDigits'> & Partial<OrderStub>,
): OrderStub {
  const order: OrderStub = {
    createdAt: new Date().toISOString(),
    voided: false,
    hasResult: false,
    released: false,
    issued: false,
    needsReview: false,
    ...stub,
  }
  state.orders.set(order.id, order)
  return order
}
