import type { DeliveryRecord, IncompleteApproval, ResendTask } from '@/types/orders/issue.types'

export interface DeliveryStoreState {
  deliveries: Map<string, DeliveryRecord>
  tasks: Map<string, ResendTask>
  approvals: Map<string, IncompleteApproval>
  counter: number
}

export interface DeliveryStoreSnapshot {
  deliveries: [string, DeliveryRecord][]
  tasks: [string, ResendTask][]
  approvals?: [string, IncompleteApproval][]
  counter: number
}
