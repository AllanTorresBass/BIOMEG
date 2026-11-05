import { BaseService } from '@/lib/services/base/BaseService'
import type { AssignControlInput, FindInvoiceInput, IssueNoteInput, ReprintInput } from '@/types/orders/fiscal.schemas'
import type { InvoiceLookup, ReprintResult } from '@/types/orders/fiscal.types'
import type { PaymentResult } from '@/types/orders/payment.types'

/** Named commands only. A fiscal document has no update or delete. */
export class FiscalService extends BaseService {
  constructor() {
    super('/api/v1/fiscal')
  }

  assignControl(input: AssignControlInput): Promise<PaymentResult> {
    return this.post('/control', input)
  }

  findInvoice(input: FindInvoiceInput): Promise<{ invoice: InvoiceLookup | null }> {
    return this.post('/find-invoice', input)
  }

  issueNote(input: IssueNoteInput): Promise<PaymentResult> {
    return this.post('/note', input)
  }

  reprint(input: ReprintInput): Promise<ReprintResult> {
    return this.post('/reprint', input)
  }
}
