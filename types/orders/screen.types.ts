import type { CatalogOption, CostType, DraftBilling, DraftLineView, DraftTotalsView } from '@/types/orders/draft.types'

export interface PatientView {
  id: string
  name: string
  cedulaText: string
  ageText: string
  verified: boolean
}

export interface ClientStepProps {
  draftId: string
  query: string
  patient: PatientView | null
  results: PatientView[]
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

export interface PatientHeaderProps {
  patient: PatientView
}

export interface StepIndicatorProps {
  current: 1 | 2
}
