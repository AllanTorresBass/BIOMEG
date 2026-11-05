import type { ResultMark } from '@/types/orders/result.types'

export type ReportMode = 'PACIENTE' | 'PRUEBA'

export interface ReportRow {
  lineId: string
  name: string
  value: string
  unit: string
  reference: string
  mark: ResultMark | null
}

export interface ReportSection {
  title: string
  subsection: string | null
  rows: ReportRow[]
}

/** The labels and values of the patient and order block. Email, birth date, médico and motivo are never here. */
export interface ReportPatient {
  paciente: string
  cedula: string
  edad: string
  genero: string
  telefono: string
  convenio: string
  fechaMuestra: string
  fechaReporte: string
  orden: string
}

export interface ReportLab {
  name: string
  descriptor: string
  rif: string
}

/** Everything the paper and the PDF print. Both render from this one value, so they cannot drift apart. */
export interface ReportDocument {
  orderId: string
  mode: ReportMode
  lineId: string | null
  /** A draft is a partial order. It carries the INCOMPLETO banner and the watermark. */
  draft: boolean
  missing: string[]
  lab: ReportLab
  patient: ReportPatient
  sections: ReportSection[]
  /** One name, or one per section when different bioanalysts released different sections. */
  processedBy: { section: string | null; name: string }[]
  /** The address a QR scan opens. Null when the QR setting is inactive or no issue exists yet. */
  verifyUrl: string | null
  /** Printed beside the QR, only when the value check setting is on. */
  consultCode: string | null
  issueId: string | null
}

export type ReportAvailability =
  | { kind: 'EMPTY' }
  | { kind: 'EN_REVISION' }
  | { kind: 'READY'; document: ReportDocument; stored: StoredReportInfo | null }

export interface StoredReportInfo {
  id: string
  createdAt: string
  byName: string
}

export interface ReportActionResult {
  ok: boolean
  message: string
  reportId?: string
}
