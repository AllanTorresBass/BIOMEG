import { BaseService } from '@/lib/services/base/BaseService'
import type { DeliveryActionResult } from '@/types/orders/delivery.types'
import type { DeliveryInput, OrderIdInput, ReportPdfInput } from '@/types/orders/orders.schemas'
import type { ReportActionResult } from '@/types/orders/report.types'

export class DeliveryService extends BaseService {
  constructor() {
    super('/api/v1')
  }

  generatePdf(input: ReportPdfInput): Promise<ReportActionResult> {
    return this.post('/reports/pdf', input)
  }

  approveIncomplete(input: OrderIdInput): Promise<DeliveryActionResult> {
    return this.post('/delivery/approve', input)
  }

  send(input: DeliveryInput): Promise<DeliveryActionResult> {
    return this.post('/delivery/send', input)
  }

  resend(input: DeliveryInput): Promise<DeliveryActionResult> {
    return this.post('/delivery/resend', input)
  }
}
