import type { MovedOrder } from '@/types/domain/order-stub.types'
import type { ClientRecord, ConsentChannel } from '@/types/domain/client.types'

export interface ClientState {
  clients: Map<string, ClientRecord>
}

export interface ClientQuery {
  text: string
  includeInactive: boolean
}

export interface SaveContext {
  userName: string
  userId: string
  now: string
  consents: ConsentChannel[]
  confirmedSimilarIds: string[]
}

export type UpdateResult =
  | { ok: true; before: ClientRecord; after: ClientRecord }
  | { ok: false; reason: 'NOT_FOUND' }
  | { ok: false; reason: 'CONFLICT'; current: ClientRecord }

export interface Actor {
  userId: string
  userName: string
  now: string
}

export interface LifecycleState {
  merges: MergeRecord[]
  requests: MergeRequest[]
}

export interface MergeRecord {
  id: string
  survivorId: string
  sourceId: string
  survivorName: string
  sourceName: string
  sourceWasActive: boolean
  movedOrders: MovedOrder[]
  mergedAt: string
  mergedBy: string
  undoneAt: string | null
}

export interface MergeRequest {
  clientId: string
  note: string
  requestedBy: string
  requestedAt: string
}

export type ActiveResult =
  | { ok: true; changed: boolean; before: ClientRecord; after: ClientRecord }
  | { ok: false; reason: 'NOT_FOUND' }

export type CorrectResult =
  | { ok: true; before: ClientRecord; after: ClientRecord; ordersUpdated: string[] }
  | { ok: false; reason: 'NOT_FOUND' | 'CEDULA_TAKEN' }

export type MergeResult =
  | { ok: true; merge: MergeRecord; survivorBefore: ClientRecord }
  | { ok: false; reason: 'NOT_FOUND' | 'SELF' }

export type UnmergeResult =
  | { ok: true; merge: MergeRecord; restoredOrders: number }
  | { ok: false; reason: 'NOT_FOUND' | 'ALREADY_UNDONE' | 'CEDULA_TAKEN' }
