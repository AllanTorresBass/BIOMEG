import type { ReportMode, StoredReportInfo } from '@/types/orders/report.types'

export interface Props {
  orderId: string
  mode: ReportMode
  lineId: string | null
  stored: StoredReportInfo | null
  /** The issued PDF is final. A draft can be made again. */
  final: boolean
  storedLabel: string | null
}
