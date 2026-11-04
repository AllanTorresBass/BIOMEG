import type { CedulaType } from '@/lib/utils/format'

export type Sex = 'F' | 'M'
export type ConsentChannel = 'WHATSAPP' | 'EMAIL'

export interface ConsentEntry {
  channel: ConsentChannel
  grantedAt: string
  grantedBy: string
  withdrawnAt: string | null
}

export interface ClientRecord {
  id: string
  fullName: string
  /** Spaces collapsed, accents removed, letters uppercased. */
  nameKey: string
  cedulaType: CedulaType | null
  cedulaDigits: string | null
  /** ISO date, stored as the source of truth. Age is always computed. */
  birthDate: string
  sex: Sex | null
  phone: string | null
  email: string | null
  /** A complete cédula pair marks Verificado. Both empty marks Sin verificar. */
  verified: boolean
  active: boolean
  deletedAt: string | null
  /** Bumped on every save. A save made from an older version is refused. */
  version: number
  createdAt: string
  lastSavedBy: string
  lastSavedAt: string
  consents: ConsentEntry[]
  /** Ids of similar clients the operator confirmed are different people. */
  similarConfirmedIds: string[]
}

/** What the card form sends. Everything arrives as text and is checked on the server. */
export interface ClientFormInput {
  id: string | null
  /** The version the operator was looking at. Null for a new client. */
  version: number | null
  fullName: string
  cedulaType: string
  cedulaNumber: string
  /** DD/MM/AAAA as typed. */
  birthDate: string
  sex: string
  phone: string
  email: string
  consentWhatsapp: boolean
  consentEmail: boolean
  /** True when the operator pressed the confirmation for similar names. */
  confirmSimilar: boolean
}

export type ClientFieldName =
  | 'fullName'
  | 'cedulaType'
  | 'cedulaNumber'
  | 'birthDate'
  | 'sex'
  | 'phone'
  | 'email'

export type ClientRefusalCode =
  | 'NAME_EMPTY'
  | 'BIRTH_EMPTY'
  | 'BIRTH_INVALID'
  | 'BIRTH_FUTURE'
  | 'CEDULA_HALF_TYPE'
  | 'CEDULA_HALF_NUMBER'
  | 'CEDULA_NOT_DIGITS'
  | 'CEDULA_LENGTH'
  | 'CEDULA_TYPE_UNKNOWN'
  | 'SEX_UNKNOWN'
  | 'EMAIL_INVALID'
  | 'CEDULA_DUPLICATE'
  | 'SIMILAR_NAME'
  | 'VERSION_CONFLICT'

export interface ClientRefusal {
  code: ClientRefusalCode
  field: ClientFieldName | null
}

/** A client reduced to what the list and the similar-name warning show. */
export interface ClientSummary {
  id: string
  fullName: string
  cedulaType: CedulaType | null
  cedulaDigits: string | null
  birthDate: string
  active: boolean
  verified: boolean
}

export interface ValidClientInput {
  fullName: string
  nameKey: string
  cedulaType: CedulaType | null
  cedulaDigits: string | null
  birthDate: string
  sex: Sex | null
  phone: string | null
  email: string | null
}

export interface ClientFormState {
  error: string | null
  field: ClientFieldName | null
  /** Set when the save was refused because of a similar name. The card shows these and asks. */
  similar: ClientSummary[]
  /** Set when the cédula already belongs to someone. The card offers that client. */
  duplicate: ClientSummary | null
  /** Set when two people saved the same client. The card shows who and when. */
  conflict: { savedBy: string; savedAt: string } | null
  savedId: string | null
}
