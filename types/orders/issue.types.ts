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
  /** Hash of the QR token. The token itself is only ever printed. */
  tokenHash: string
  /** Hash of Código de consulta, salted with the issue id. Never derived from the token. */
  consultHash: string
  status: IssueStatus
  createdAt: string
  replacedAt: string | null
  lines: IssuedLine[]
}

export type DeliveryChannel = 'CORREO' | 'WHATSAPP' | 'IMPRESO'

/** A portal link carries no result. An attachment carries the report and needs recorded consent. */
export type DeliveryMode = 'PORTAL_LINK' | 'ATTACHMENT'

/** PENDING is stored before the provider is called. The send is complete only once it turns SENT. */
export type DeliveryStatus = 'PENDING' | 'SENT' | 'FAILED'

export interface DeliveryRecord {
  id: string
  orderId: string
  /** Null for a draft sent on an incomplete order. */
  issueId: string | null
  channel: DeliveryChannel
  recipient: string
  at: string
  mode: DeliveryMode
  status: DeliveryStatus
  failure: string | null
  operatorName: string
  orderNumber: string
  /** True when the order was only partly released at send time. */
  incomplete: boolean
  missing: string[]
  /** True when this send replaced an earlier report that was already delivered. */
  resend: boolean
}

/** A bioanalyst approval to send a partly released order. Stays until the order is complete or the approval is spent. */
export interface IncompleteApproval {
  orderId: string
  approvedBy: string
  approvedAt: string
  missing: string[]
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
