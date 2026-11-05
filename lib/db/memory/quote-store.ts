import 'server-only'

import type { Quote } from '@/types/orders/order.types'

interface QuoteStoreState {
  quotes: Map<string, Quote>
  counter: number
}

const globalStore = globalThis as typeof globalThis & { __biomegQuotes?: QuoteStoreState }
const state: QuoteStoreState = (globalStore.__biomegQuotes ??= { quotes: new Map(), counter: 0 })

export function getQuote(id: string): Quote | null {
  return state.quotes.get(id) ?? null
}

/** Quotes count on their own sequence. They never take an order or invoice number. */
export function createQuote(input: Omit<Quote, 'id' | 'number'>): Quote {
  state.counter += 1
  const quote: Quote = { ...input, id: `q-${state.counter}`, number: `P-${String(state.counter).padStart(6, '0')}` }
  state.quotes.set(quote.id, quote)
  return quote
}
