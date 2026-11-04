import type { PriceColumn } from '@/types/domain/demo.types'

export type { PriceColumn }

/** Chosen on the order. It is a different list from the price columns and never maps onto one. */
export type CostType = 'RUTINA' | 'SEGURO_EMPRESA' | 'EMERGENCIA' | 'HOSPITALIZADO'

export type OrderPath = 'PARTICULAR' | 'EMPRESA'

export type PricingBasis = 'SABADO' | 'ORDINARIO'

export type ExamStatus = 'DISPONIBLE' | 'NO_DISP'

export interface DraftLine {
  id: string
  examId: string
  examName: string
  costType: CostType | null
  /** null until the operator chooses one. The line then shows SIN PRECIO. */
  column: PriceColumn | null
  /** Stored when the line is priced. A later catalog change never rewrites it. */
  priceUsd: string | null
  basis: PricingBasis
  status: ExamStatus
  /** Why a repeated exam was added the same day. null when it was not a repeat. */
  repeatMotivo: string | null
  addedAt: string
}

export interface DraftBilling {
  cedula: string
  razonSocial: string
  direccion: string
}

export interface OrderDraft {
  id: string
  ownerId: string
  path: OrderPath
  step: 1 | 2
  state: 'BORRADOR'
  clientId: string | null
  motivo: string
  /** ISO date, or null until the operator confirms a new visit or types one. */
  sampleDate: string | null
  costType: CostType | null
  billing: DraftBilling
  lines: DraftLine[]
  createdAt: string
}

export type DraftNeed = 'CONFIRM_NO_DISP' | 'CONFIRM_OVERRIDE' | 'SAME_DAY' | 'MOTIVO'

export interface DraftResult {
  ok: boolean
  message: string
  need: DraftNeed | null
}

export interface AddLineInput {
  draftId: string
  examId: string
  column: PriceColumn | null
  confirmNoDisp?: boolean
  confirmOverride?: boolean
  overrideMotivo?: string
  repeatMotivo?: string
}

export interface VisitInput {
  draftId: string
  motivo: string
  /** DD/MM/YYYY as typed. Blank clears it. */
  sampleDate: string
}

export interface BillingInput {
  draftId: string
  costType: CostType | null
  cedula: string
  razonSocial: string
  direccion: string
}

/** Everything the screen needs, already formatted. The page builds it on the server. */
export interface DraftLineView {
  id: string
  examName: string
  costTypeLabel: string
  columnLabel: string
  currency: string
  priceText: string
  sinPrecio: boolean
  basisLabel: string
  available: boolean
  repeated: boolean
}

export interface DraftTotalsView {
  countText: string
  usd: string
  rate: string | null
  bs: string | null
  hasSinPrecio: boolean
}

export interface CatalogOption {
  id: string
  name: string
  available: boolean
}
