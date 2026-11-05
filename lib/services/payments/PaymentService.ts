import { BaseService } from '@/lib/services/base/BaseService'
import type { AbonoOrderView, PaymentResult } from '@/types/orders/payment.types'
import type { AbonoInput, CashCloseInput, CashReopenInput, FindOrderInput, MonthCloseInput, ReversePaymentInput } from '@/types/orders/payments.schemas'

/** Named commands only. A payment has no update or delete: a mistake is reversed by a new row. */
export class PaymentService extends BaseService {
  constructor() {
    super('/api/v1/payments')
  }

  findOrder(input: FindOrderInput): Promise<{ order: AbonoOrderView | null }> {
    return this.post('/find-order', input)
  }

  addAbono(input: AbonoInput): Promise<PaymentResult> {
    return this.post('/abono', input)
  }

  reverse(input: ReversePaymentInput): Promise<PaymentResult> {
    return this.post('/reverse', input)
  }

  closeCash(input: CashCloseInput): Promise<PaymentResult> {
    return this.post('/close', input)
  }

  reopenCash(input: CashReopenInput): Promise<PaymentResult> {
    return this.post('/reopen', input)
  }

  closeMonth(input: MonthCloseInput): Promise<PaymentResult> {
    return this.post('/month-close', input)
  }
}
