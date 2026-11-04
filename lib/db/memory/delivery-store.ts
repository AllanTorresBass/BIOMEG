import 'server-only'

import type { DeliveryRecord, ResendTask } from '@/types/orders/issue.types'

interface DeliveryStoreState {
  deliveries: Map<string, DeliveryRecord>
  tasks: Map<string, ResendTask>
  counter: number
}

function buildState(): DeliveryStoreState {
  const deliveries = new Map<string, DeliveryRecord>()
  const at = new Date().toISOString()
  deliveries.set('d-1', { id: 'd-1', orderId: 'o-1', issueId: 'i-1', channel: 'CORREO', recipient: 'paciente@example.com', at })
  return { deliveries, tasks: new Map(), counter: 1 }
}

const globalStore = globalThis as typeof globalThis & { __biomegDeliveries?: DeliveryStoreState }
const state: DeliveryStoreState = (globalStore.__biomegDeliveries ??= buildState())

export function recordDelivery(entry: Omit<DeliveryRecord, 'id' | 'at'>): DeliveryRecord {
  state.counter += 1
  const delivery: DeliveryRecord = { ...entry, id: `d-${state.counter}`, at: new Date().toISOString() }
  state.deliveries.set(delivery.id, delivery)
  return delivery
}

export function deliveriesOf(orderId: string): DeliveryRecord[] {
  return [...state.deliveries.values()].filter((delivery) => delivery.orderId === orderId)
}

export function resendTasksOf(orderId: string): ResendTask[] {
  return [...state.tasks.values()].filter((task) => task.orderId === orderId)
}

/** An order that was delivered earlier gets one resend task with those deliveries. Nothing is sent by itself. */
export function createResendTask(orderId: string, fromIssueId: string, toIssueId: string): ResendTask | null {
  const earlier = deliveriesOf(orderId)
  if (earlier.length === 0) return null
  state.counter += 1
  const task: ResendTask = {
    id: `rt-${state.counter}`,
    orderId,
    fromIssueId,
    toIssueId,
    deliveries: earlier,
    createdAt: new Date().toISOString(),
  }
  state.tasks.set(task.id, task)
  return task
}

export interface DeliveryStoreSnapshot {
  deliveries: [string, DeliveryRecord][]
  tasks: [string, ResendTask][]
  counter: number
}

export function snapshotDeliveries(): DeliveryStoreSnapshot {
  return { deliveries: [...state.deliveries.entries()], tasks: [...state.tasks.entries()], counter: state.counter }
}

export function restoreDeliveries(snapshot: DeliveryStoreSnapshot): void {
  state.deliveries = new Map(snapshot.deliveries)
  state.tasks = new Map(snapshot.tasks)
  state.counter = snapshot.counter
}
