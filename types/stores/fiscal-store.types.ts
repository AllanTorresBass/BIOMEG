import type { FiscalNote } from '@/types/orders/fiscal.types'

export interface FiscalState {
  notes: FiscalNote[]
  debitCounter: number
  counter: number
}
