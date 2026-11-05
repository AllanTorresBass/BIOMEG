import type { ReportDocument, ReportMode } from '@/types/orders/report.types'

export interface StoredReport {
  id: string
  orderId: string
  mode: ReportMode
  lineId: string | null
  issueId: string | null
  draft: boolean
  createdAt: string
  byName: string
  /** What was printed. Later edits to the client or the order never rewrite it. */
  document: ReportDocument
  pdf: Buffer
}

export interface ReportStoreState {
  reports: StoredReport[]
  counter: number
}

export interface SaveReportInput {
  orderId: string
  mode: ReportMode
  lineId: string | null
  issueId: string | null
  draft: boolean
  byName: string
  document: ReportDocument
  pdf: Buffer
}
