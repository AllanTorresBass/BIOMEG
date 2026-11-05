import 'server-only'

import type { DeliveryRecord, IncompleteApproval, ResendTask } from '@/types/orders/issue.types'

interface DeliveryStoreState {
  deliveries: Map<string, DeliveryRecord>
  tasks: Map<string, ResendTask>
  approvals: Map<string, IncompleteApproval>
  counter: number
}

function buildState(): DeliveryStoreState {
  const deliveries = new Map<string, DeliveryRecord>()
  const at = new Date().toISOString()
  deliveries.set('d-1', {
    id: 'd-1',
    orderId: 'o-1',
    issueId: 'i-1',
    channel: 'CORREO',
    recipient: 'paciente@example.com',
    at,
    mode: 'ATTACHMENT',
    status: 'SENT',
    failure: null,
    operatorName: 'Recepción',
    orderNumber: 'o-1',
    incomplete: false,
    missing: [],
    resend: false,
  })
  return { deliveries, tasks: new Map(), approvals: new Map(), counter: 1 }
}

const globalStore = globalThis as typeof globalThis & { __biomegDeliveries?: DeliveryStoreState }
const state: DeliveryStoreState = (globalStore.__biomegDeliveries ??= buildState())

export function recordDelivery(entry: Omit<DeliveryRecord, 'id' | 'at'>): DeliveryRecord {
  state.counter += 1
  const delivery: DeliveryRecord = { ...entry, id: `d-${state.counter}`, at: new Date().toISOString() }
  state.deliveries.set(delivery.id, delivery)
  return delivery
}

export function updateDelivery(id: string, patch: Partial<DeliveryRecord>): DeliveryRecord | null {
  const current = state.deliveries.get(id)
  if (!current) return null
  const next = { ...current, ...patch }
  state.deliveries.set(id, next)
  return next
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

/** The newest first, so the list on the order reads from the last send. */
export function deliveryListOf(orderId: string): DeliveryRecord[] {
  return deliveriesOf(orderId).sort((a, b) => b.at.localeCompare(a.at) || b.id.localeCompare(a.id, undefined, { numeric: true }))
}

export function approveIncomplete(approval: IncompleteApproval): void {
  state.approvals.set(approval.orderId, approval)
}

export function incompleteApprovalOf(orderId: string): IncompleteApproval | null {
  return state.approvals.get(orderId) ?? null
}

export function clearIncompleteApproval(orderId: string): void {
  state.approvals.delete(orderId)
}

/** A resend task is done once the order was sent again on the replacing issue. */
export function completeResendTask(orderId: string): void {
  for (const task of resendTasksOf(orderId)) state.tasks.delete(task.id)
}

export interface DeliveryStoreSnapshot {
  deliveries: [string, DeliveryRecord][]
  tasks: [string, ResendTask][]
  approvals?: [string, IncompleteApproval][]
  counter: number
}

export function snapshotDeliveries(): DeliveryStoreSnapshot {
  return {
    deliveries: [...state.deliveries.entries()],
    tasks: [...state.tasks.entries()],
    approvals: [...state.approvals.entries()],
    counter: state.counter,
  }
}

export function restoreDeliveries(snapshot: DeliveryStoreSnapshot): void {
  state.deliveries = new Map(snapshot.deliveries)
  state.tasks = new Map(snapshot.tasks)
  state.approvals = new Map(snapshot.approvals ?? [])
  state.counter = snapshot.counter
}
