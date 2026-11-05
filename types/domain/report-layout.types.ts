import type { ReportRow } from '@/types/orders/report.types'

export interface PageSection {
  title: string
  subsection: string | null
  rows: ReportRow[]
  /** True when the section started on an earlier page. The heading is repeated. */
  continued: boolean
}

export type ReportPage = PageSection[]
