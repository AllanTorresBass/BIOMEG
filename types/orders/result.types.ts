export type ResultMark = 'ALTO' | 'BAJO'
export type ResultSource = 'teclado' | 'equipo'

/** The fact the permission table reads as `state`. */
export type ResultOrderState = 'PENDIENTE' | 'CARGADO' | 'EN_CORRECCION' | 'LIBERADO'

/** One stored cell. The value is text, exactly as typed. */
export interface StoredResult {
  orderId: string
  lineId: string
  value: string
  mark: ResultMark | null
  source: ResultSource
  byId: string
  byName: string
  at: string
  /** Version check for the cell. A second writer with an old version gets a conflict. */
  version: number
  /** A value from the analyzer that arrived on a typed cell. It waits for the bioanalyst. */
  incoming: { value: string; at: string } | null
}

export interface GridRow {
  lineId: string
  name: string
  unit: string | null
  reference: string
  numeric: boolean
  value: string
  mark: ResultMark | null
  source: ResultSource | null
  byName: string | null
  at: string | null
  version: number
  incoming: { value: string; at: string } | null
}

export interface SectionRelease {
  byId: string
  byName: string
  at: string
}

export interface GridSection {
  title: string
  subsection: string | null
  note: string
  rows: GridRow[]
  /** Set once the section is released. Its cells are read-only from then on. */
  released: { byName: string; at: string } | null
  /** The section has results and is not released, so the bioanalyst can select it. */
  releasable: boolean
  /** Set while a released section is reopened for correction. */
  correction: { byName: string; at: string; motivo: string } | null
  /** The section is released and no correction is open on it. */
  correctable: boolean
}

/** A released section reopened for correction. The snapshot is what the section held when it was reopened. */
export interface SectionCorrection {
  orderId: string
  section: string
  motivo: string
  byId: string
  byName: string
  at: string
  snapshot: StoredResult[]
}

export interface RowHistoryEntry {
  operator: string
  at: string
  before: string
  after: string
  motivo: string
}

export interface Discrepancy {
  orderId: string
  lineId: string
  name: string
  value: string
  at: string
}

export interface ResultGridView {
  orderId: string
  orderNumber: string
  patientName: string
  patientSex: 'F' | 'M' | null
  sampleDate: string | null
  reportDate: string | null
  /** The bioanalyst who made the latest release. */
  processedBy: string | null
  state: ResultOrderState
  /** The chip on the order: ABIERTA, INCOMPLETO, LIBERADO or EN_CORRECCION. */
  chip: 'ABIERTA' | 'INCOMPLETO' | 'LIBERADO' | 'EN_CORRECCION'
  /** Sections with no stored result, named in the chip when the order is INCOMPLETO. */
  missingSections: string[]
  sections: GridSection[]
  /** Changes whenever a release or correction changes, so the grid reloads its local cells. */
  revision: string
  canEnter: boolean
  isBioanalyst: boolean
  discrepancies: Discrepancy[]
  hasBacteriology: boolean
}

export type ResultNeed = 'MOTIVO' | 'STEP_UP' | null

export interface ResultActionResult {
  ok: boolean
  message: string
  need: ResultNeed
  saved?: { version: number; mark: ResultMark | null; byName: string; at: string; value: string }
  conflict?: { byName: string; at: string; storedValue: string; yourValue: string; version: number }
}

export interface SaveResultInput {
  orderId: string
  lineId: string
  value: string
  expectedVersion: number
  /** Set by the bioanalyst only. undefined means: fill it automatically when the rules allow. */
  manualMark?: ResultMark | ''
  motivo?: string
}

export type RowHistoryResult =
  | { ok: true; entries: RowHistoryEntry[] }
  | { ok: false; message: string }

