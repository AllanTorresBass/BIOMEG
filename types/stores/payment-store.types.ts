import type { CashClose, MonthClose, PaymentEntry } from '@/types/orders/payment.types'

export interface PaymentState {
  entries: PaymentEntry[]
  closes: CashClose[]
  months: MonthClose[]
  counter: number
}
