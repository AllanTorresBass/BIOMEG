import type { OrderStub } from '@/types/domain/order-stub.types'
import type { ReportMode } from '@/types/orders/report.types'

export type ReportKind = 'ISSUED' | 'DRAFT'

export interface ReportRequest {
  stub: OrderStub
  mode: ReportMode
  lineId: string | null
  origin: string | null
}
