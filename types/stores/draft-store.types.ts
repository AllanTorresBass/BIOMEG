import type { OrderDraft } from '@/types/orders/draft.types'

export interface DraftState {
  drafts: Map<string, OrderDraft>
  counter: number
}
