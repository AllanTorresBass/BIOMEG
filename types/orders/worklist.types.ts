export type WorklistState = 'ABIERTA' | 'INCOMPLETO' | 'LIBERADO' | 'EN_CORRECCION'

export interface WorklistRow {
  id: string
  number: string
  patient: string
  convenio: string | null
  /** YYYY-MM-DD */
  sampleDate: string
  state: WorklistState
  printed: boolean
  /** Flagged for bioanalyst review. Dropped for Recepción under status_only. */
  needsReview?: boolean
}

export interface WorklistView {
  /** False when the role may not read the worklist. No rows then. */
  allowed: boolean
  /** Auxiliar and Bioanalista open Cargar resultados from a row. Recepción opens nothing. */
  canOpen: boolean
  date: string
  rows: WorklistRow[]
}
