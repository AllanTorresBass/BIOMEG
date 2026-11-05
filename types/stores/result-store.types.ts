import type { Discrepancy, ResultMark, ResultSource, SectionCorrection, SectionRelease, StoredResult } from '@/types/orders/result.types'

export interface ResultStoreState {
  cells: Map<string, StoredResult>
  notes: Map<string, string>
  discrepancies: Discrepancy[]
  releases: Map<string, SectionRelease>
  reportDates: Map<string, string>
  corrections: Map<string, SectionCorrection>
  /** Earlier versions of a cell, kept when a correction is released. */
  priorVersions: Map<string, StoredResult[]>
}

export interface WriteInput {
  orderId: string
  lineId: string
  value: string
  mark: ResultMark | null
  source: ResultSource
  byId: string
  byName: string
  expectedVersion: number
}

export type WriteOutcome = { kind: 'saved'; result: StoredResult } | { kind: 'conflict'; current: StoredResult }

export type ReleaseOutcome =
  | { kind: 'released'; sections: string[]; reportDate: string; complete: boolean }
  | { kind: 'already'; section: string; by: SectionRelease }
  | { kind: 'empty'; section: string }

export type OpenCorrectionOutcome =
  | { kind: 'opened'; correction: SectionCorrection }
  | { kind: 'already'; by: SectionCorrection }
  | { kind: 'not_released' }

export interface ResultStoreSnapshot {
  cells: [string, StoredResult][]
  releases: [string, SectionRelease][]
  reportDates: [string, string][]
  corrections: [string, SectionCorrection][]
  priorVersions: [string, StoredResult[]][]
}
