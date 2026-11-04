import type { ResultMark } from '@/types/orders/result.types'

export type IssueStatus = 'VIGENTE' | 'REEMPLAZADO'

/** One result line as it was printed on an issue. Kept so a replaced report can still be read. */
export interface IssuedLine {
  lineId: string
  section: string
  name: string
  value: string
  mark: ResultMark | null
  version: number
}

/** One issue of a report. A correction replaces the current issue with a new one and a new token. */
export interface IssueRecord {
  id: string
  orderId: string
  token: string
  status: IssueStatus
  createdAt: string
  replacedAt: string | null
  lines: IssuedLine[]
}

export type DeliveryChannel = 'CORREO' | 'WHATSAPP' | 'IMPRESO'

export interface DeliveryRecord {
  id: string
  orderId: string
  issueId: string
  channel: DeliveryChannel
  recipient: string
  at: string
}

/** Created when a correction is released on an order that was already delivered. */
export interface ResendTask {
  id: string
  orderId: string
  fromIssueId: string
  toIssueId: string
  deliveries: DeliveryRecord[]
  createdAt: string
}

/** What a reader of the report, the portal or a QR check sees for an order right now. */
export type ReportSurface =
  | { kind: 'EN_REVISION' }
  | { kind: 'VIGENTE'; issue: IssueRecord }
  | { kind: 'REEMPLAZADO'; issue: IssueRecord; current: IssueRecord | null }
  | { kind: 'DESCONOCIDO' }
