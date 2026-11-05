import type { OrderStub } from '@/types/domain/order-stub.types'
import type { DeliveryView } from '@/types/orders/delivery.types'
import type { ReportAvailability, ReportMode } from '@/types/orders/report.types'

/** A guarded read answers one of these. A refusal carries no values at all. */
export type Guarded<Ready> = { kind: 'BLOCKED' } | { kind: 'MISSING' } | ({ kind: 'READY' } & Ready)

export interface ReportScreen {
  stub: OrderStub
  mode: ReportMode
  lineId: string | null
  report: ReportAvailability
  choices: { lineId: string; name: string }[]
  deliveryView: DeliveryView | null
}

export interface ReportFile {
  pdf: Buffer
  name: string
}

export type ReportFileAnswer = { kind: 'FILE'; file: ReportFile } | { kind: 'REFUSED'; status: 401 | 403 | 404 }
