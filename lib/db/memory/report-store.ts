import 'server-only'

import type { ReportMode } from '@/types/orders/report.types'
import type { ReportStoreState, SaveReportInput, StoredReport } from '@/types/stores/report-store.types'

const globalStore = globalThis as typeof globalThis & { __biomegReports?: ReportStoreState }
const state: ReportStoreState = (globalStore.__biomegReports ??= { reports: [], counter: 0 })

function sameKey(report: StoredReport, orderId: string, mode: ReportMode, lineId: string | null): boolean {
  return report.orderId === orderId && report.mode === mode && report.lineId === lineId
}

/** The report a view should show: the issued one when it exists, otherwise the latest draft. */
export function findReport(
  orderId: string,
  mode: ReportMode,
  lineId: string | null,
  issueId: string | null,
): StoredReport | null {
  return (
    state.reports.find(
      (report) => sameKey(report, orderId, mode, lineId) && report.issueId === issueId && report.draft === (issueId === null),
    ) ?? null
  )
}

export function getReport(id: string): StoredReport | null {
  return state.reports.find((report) => report.id === id) ?? null
}

export function reportsOf(orderId: string): StoredReport[] {
  return state.reports.filter((report) => report.orderId === orderId)
}

/** An issued report is kept as it was first made. A draft replaces the earlier draft of the same view. */
export function saveReport(input: SaveReportInput): StoredReport {
  if (input.draft) {
    state.reports = state.reports.filter(
      (report) => !(report.draft && sameKey(report, input.orderId, input.mode, input.lineId)),
    )
  }
  state.counter += 1
  const stored: StoredReport = {
    id: `rp-${state.counter}`,
    orderId: input.orderId,
    mode: input.mode,
    lineId: input.lineId,
    issueId: input.issueId,
    draft: input.draft,
    createdAt: new Date().toISOString(),
    byName: input.byName,
    document: structuredClone(input.document),
    pdf: input.pdf,
  }
  state.reports.push(stored)
  return stored
}
