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
}

export interface ClientListProps {
  rows: ClientSummary[]
  selectedId: string | null
  query: string
  includeInactive: boolean
}
