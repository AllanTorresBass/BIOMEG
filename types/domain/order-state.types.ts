export type ResultState = 'PENDIENTE' | 'CARGADO' | 'LIBERADO' | 'EN_CORRECCION'

export type OrderState = 'BORRADOR' | 'ABIERTA' | 'INCOMPLETO' | 'LIBERADO' | 'EN_CORRECCION' | 'ANULADA'

export interface OrderResult {
  sectionId: string
  state: ResultState
}

export interface OrderStateInput {
  /** False while the Nueva orden form is unsaved. */
  saved: boolean
  voided: boolean
  results: readonly OrderResult[]
}

export type SectionStatus = 'PENDIENTE' | 'CARGADO' | 'LIBERADO' | 'EN_CORRECCION'
