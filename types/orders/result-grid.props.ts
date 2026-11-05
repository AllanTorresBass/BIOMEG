import type { GridRow, ResultMark } from '@/types/orders/result.types'

export interface CellState {
  value: string
  mark: ResultMark | null
  version: number
  byName: string | null
  at: string | null
  incoming: GridRow['incoming']
}

export type Pending =
  | { kind: 'save'; lineId: string; value: string; manualMark?: ResultMark | '' }
  | { kind: 'incoming'; lineId: string; choice: 'use' | 'keep' }

export type CorrectionOperation =
  | { kind: 'open'; section: string; motivo: string }
  | { kind: 'cancel'; section: string }
  | { kind: 'release'; section: string }

export interface Conflict {
  lineId: string
  message: string
  yourValue: string
  version: number
}
