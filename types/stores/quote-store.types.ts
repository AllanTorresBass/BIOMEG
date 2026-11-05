import type { Quote } from '@/types/orders/order.types'

export interface QuoteStoreState {
  quotes: Map<string, Quote>
  counter: number
}
