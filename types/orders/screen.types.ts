import type { CatalogOption, CostType, DraftBilling, DraftLineView, DraftPayment, DraftTotalsView } from '@/types/orders/draft.types'

export interface PatientView {
  id: string
  name: string
  cedulaText: string
  ageText: string
  verified: boolean
}

export interface ClientStepProps {
  draftId: string
  patient: PatientView | null
  visit: { motivo: string; sampleDate: string }
  todayText: string
  canCreateClient: boolean
}

export interface ExamsStepProps {
  draftId: string
  patient: PatientView
  costType: CostType | null
  billing: DraftBilling
  catalog: CatalogOption[]
  lines: DraftLineView[]
  totals: DraftTotalsView
  rateMissing: boolean
}

export interface PersonalStepProps {
  draftId: string
  patient: PatientView
  physicianId: string | null
  physicians: { id: string; name: string }[]
}

export interface PaymentStepProps {
  draftId: string
  patient: PatientView
  isEmpresa: boolean
  convenios: { id: string; name: string; requiresTitular: boolean }[]
  convenioId: string | null
  titular: string
  razonSocial: string
  payments: DraftPayment[]
  discountPct: string
  discountMotivo: string
  discountLimit: number
  linePrices: (string | null)[]
  rate: string
  rateDate: string
  ivaRate: string | null
  igtfRate: string | null
}

export interface SavedOrderPanelProps {
  orderId: string
  number: string
  invoiceNumber: string
  controlNumber: string
  clientName: string
  examCount: number
  totalUsd: string
  totalBs: string | null
  abono: string
  resta: string
  savedBy: string
  savedAtText: string
}

export interface PatientHeaderProps {
  patient: PatientView
}

export interface StepIndicatorProps {
  current: 1 | 2
}

export interface OrderActionsProps {
  orderId: string
  voided: boolean
  hasPayment: boolean
  lines: { id: string; name: string; priceUsd: string | null }[]
}
