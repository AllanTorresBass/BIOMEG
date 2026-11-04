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

export type PaymentMethodId =
  | 'EFECTIVO_USD'
  | 'ZELLE'
  | 'EFECTIVO_BS'
  | 'TDEBITO'
  | 'TCREDITO'
  | 'PAGO_MOVIL'
  | 'TRANSFERENCIA'

export interface DraftPayment {
  method: PaymentMethodId
  /** As typed, with a dot decimal. Blank means no payment on this row. */
  amount: string
  bank: string
  /** Free text. */
  reference: string
}

export interface OrderDraft {
  id: string
  ownerId: string
  path: OrderPath
  step: 1 | 2 | 3 | 4
  state: 'BORRADOR'
  clientId: string | null
  motivo: string
  /** ISO date, or null until the operator confirms a new visit or types one. */
  sampleDate: string | null
  costType: CostType | null
  billing: DraftBilling
  lines: DraftLine[]
  physicianId: string | null
  convenioId: string | null
  titular: string
  payments: DraftPayment[]
  /** Percent as typed. "0" means no discount. */
  discountPct: string
  discountMotivo: string
  /** Set once Guardar succeeds. A second save on the same draft finds it here. */
  savedOrderId: string | null
  createdAt: string
}

export interface PersonalInput {
  draftId: string
  physicianId: string | null
}

export interface PaymentInput {
  draftId: string
  convenioId: string | null
  titular: string
  razonSocial: string
  payments: DraftPayment[]
  discountPct: string
  discountMotivo: string
}

export interface SaveInput {
  draftId: string
  /** One per Guardar attempt. The same key twice never creates a second order. */
  key: string
  /** The BCV rate the operator saw. A different current rate asks for a confirm. */
  rateSeen: string
  confirmRate?: boolean
}

export interface SaveResult {
  ok: boolean
  message: string
  need: 'RATE_CHANGED' | 'DISCOUNT_APPROVAL' | 'DISCOUNT_MOTIVO' | null
  /** The order that exists after this call, whether it was just created or was already there. */
  orderId: string | null
  /** True when the screen must reload because another save won. */
  reload: boolean
}

export type DraftNeed = 'CONFIRM_NO_DISP' | 'CONFIRM_OVERRIDE' | 'SAME_DAY' | 'MOTIVO' | 'STEP_UP'

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

/** Anular, remove line and Generar presupuesto share this shape. */
export interface OrderActionResult extends DraftResult {
  quoteId?: string
}

export interface VoidOrderInput {
  orderId: string
  confirmed?: boolean
  motivo?: string
}

export interface RemoveLineInput {
  orderId: string
  lineId: string
  confirmed?: boolean
}
