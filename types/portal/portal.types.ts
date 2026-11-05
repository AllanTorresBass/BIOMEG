import type { ReportSection } from '@/types/orders/report.types'

export interface PortalSession {
  id: string
  clientIds: string[]
  name: string
  startedAt: number
  lastSeenAt: number
  ended: boolean
}

export type PortalVisitState = 'LIBERADO' | 'PARCIAL' | 'PENDIENTE' | 'EN_REVISION'

/**
 * What the portal may show about one visit. An order that is not released carries a date and a number
 * and nothing else: no exam names, no sections, no values.
 */
export interface PortalVisit {
  orderId: string
  number: string
  dateText: string
  state: PortalVisitState
  /** Only released sections, never a section still loaded, held or in correction. */
  sections: ReportSection[]
  canDownload: boolean
}

export type PortalCodeRequest =
  /** The same answer whether or not the data matched, so the form never confirms a cédula exists. */
  | { kind: 'ANSWERED'; demoCode: string | null }
  | { kind: 'PAUSED' }
  | { kind: 'INVALID' }

export type PortalCodeCheck =
  | { kind: 'OK' }
  | { kind: 'WRONG' }
  | { kind: 'EXPIRED' }
  | { kind: 'LOCKED' }
