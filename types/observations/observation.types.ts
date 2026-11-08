export interface Observation {
  id: string
  /** Lab calendar day YYYY-MM-DD. */
  date: string
  text: string
  authorId: string
  authorName: string
  createdAt: string
  retractedAt: string | null
  retractedById: string | null
  retractedByName: string | null
}

export interface ObservationRowView {
  id: string
  date: string
  text: string
  authorId: string
  authorName: string
  createdAt: string
  preview: string
  canRetract: boolean
}

export interface ObservationsScreen {
  kind: 'READY' | 'BLOCKED'
  date: string
  canUse: boolean
  currentUserId: string
  rows: ObservationRowView[]
}

export interface ObservationResult {
  ok: boolean
  message: string
  need: null
  observation?: ObservationRowView
}
