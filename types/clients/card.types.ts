import type { ClientSummary } from '@/types/domain/client.types'

/** The client as the card shows it. Built on the server so the browser never sees the full record. */
export interface ClientCardData {
  id: string | null
  version: number | null
  fullName: string
  cedulaType: string
  cedulaNumber: string
  /** DD/MM/AAAA. Empty for a new client. */
  birthDate: string
  /** Computed from the birth date. Never typed. */
  ageText: string
  sex: string
  phone: string
  email: string
  verified: boolean
  active: boolean
  consentWhatsapp: boolean
  consentEmail: boolean
  /** True when any order exists, including voided. C.I. fields stay locked. */
  cedulaLocked: boolean
  hasOrders: boolean
}

export interface ClientListProps {
  rows: readonly ClientSummary[]
  selectedId: string | null
}

export interface ClientSearchProps {
  canIncludeInactive: boolean
  initialIncludeInactive?: boolean
  onSearch: (text: string, includeInactive: boolean) => void
  resultCount?: number
}

export interface ClientBrowserProps {
  initialRows: readonly ClientSummary[]
  selectedId: string | null
  canIncludeInactive: boolean
  initialIncludeInactive?: boolean
}
