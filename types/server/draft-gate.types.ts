import type { OrderDraft } from '@/types/orders/draft.types'
import type { StaffContext } from '@/types/session/session.types'

export interface Opened {
  context: StaffContext
  draft: OrderDraft
}

export interface Presented {
  confirmed?: boolean
  motivo?: string
  /** Who owns the record, for rows that depend on ownership. */
  ownerUserId?: string
}

export interface Target {
  recordType: string
  recordId: string
  state: string
}

/** What the gate helpers need. Order actions have no draft, so they always pass a target. */
export interface Subject {
  context: StaffContext
  draft?: OrderDraft
}
