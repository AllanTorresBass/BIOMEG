import type { ClientSummary } from '@/types/domain/client.types'

/** Which lifecycle buttons the permission table lets this person see for this client. */
export interface LifecycleCapabilities {
  deactivate: boolean
  reactivate: boolean
  remove: boolean
  correctCedula: boolean
  requestMerge: boolean
  merge: boolean
  unmerge: boolean
}

export interface OpenMergeRow {
  id: string
  sourceName: string
  mergedAt: string
  mergedBy: string
}

export interface MergeRequestRow {
  note: string
  requestedBy: string
  requestedAt: string
}

export interface ClientLifecycleProps {
  clientId: string
  clientName: string
  active: boolean
  currentCedula: string
  capabilities: LifecycleCapabilities
  candidates: ClientSummary[]
  merges: OpenMergeRow[]
  requests: MergeRequestRow[]
}
