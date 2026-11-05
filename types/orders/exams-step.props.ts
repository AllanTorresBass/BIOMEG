import type { AddLineInput, DraftNeed } from '@/types/orders/draft.types'

export interface Question {
  need: DraftNeed
  examName: string
  input: AddLineInput
}
