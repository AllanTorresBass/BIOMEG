export type StaffRole = 'RECEPCION' | 'AUXILIAR' | 'BIOANALISTA' | 'ADMINISTRACION'
export type PortalRole = 'CLIENTE' | 'PUBLICO'
export type SystemRole = 'SISTEMA_ANALIZADOR' | 'SISTEMA_ENVIADOR' | 'SISTEMA_PROGRAMADOR'
export type Role = StaffRole | PortalRole | SystemRole

export type Gesture = 'NONE' | 'CONFIRM' | 'STEP_UP'

export type Scope =
  | 'status_only'
  | 'clinical_text_masked'
  | 'aggregates_only'
  | 'released_sections_labeled_partial'
  | 'date_and_number_until_released'

export type Relation = 'own' | 'client' | 'token'

export type Condition =
  | { readonly fact: string; readonly is: boolean }
  | { readonly fact: string; readonly oneOf: readonly string[] }

export interface Grant {
  readonly gesture: Gesture
  /** A typed reason is required before the action runs. */
  readonly motivo?: boolean
  /** The matrix letter R. Allows reading and refuses an action. */
  readonly read?: boolean
  /** Conditions on this role only, on top of the row's. */
  readonly when?: readonly Condition[]
  readonly relation?: Relation
  readonly scope?: Scope
}

export interface PermissionRow {
  readonly id: string
  readonly label: string
  readonly commands: readonly string[]
  /** Conditions that must all hold for the row to apply. Empty means always. */
  readonly when: readonly Condition[]
  readonly blocked: boolean
  /** A row of reads defaults a decision to read mode. */
  readonly kind: 'read' | 'action'
  /** True when the row's condition is `$own`, so a refusal reads OWNERSHIP. */
  readonly ownDependent: boolean
  readonly grants: Readonly<Partial<Record<Role, Grant>>>
}

export type RefusalReason =
  | 'SESSION'
  | 'UNKNOWN_COMMAND'
  | 'ROLE'
  | 'BLOCKED'
  | 'STATE'
  | 'OWNERSHIP'
  | 'STEP_UP'
  | 'CONFIRM'
  | 'MOTIVO_REQUIRED'

export type DecisionReason = 'OK' | RefusalReason

export interface DecisionSession {
  readonly valid: boolean
  readonly active: boolean
  readonly userId: string
  readonly roles: readonly Role[]
  /** The client in a portal session. */
  readonly clientId?: string
}

export interface DecisionRecord {
  readonly ownerUserId?: string
  readonly clientId?: string
  /** Set by the server after it compared the token. */
  readonly tokenMatches?: boolean
}

export interface PresentedGestures {
  /** True only after the server verified the confirm. */
  readonly confirmVerified?: boolean
  /** True only after the server verified the password re-entry. */
  readonly stepUpVerified?: boolean
  readonly motivo?: string
}

export interface DecideInput {
  readonly session: DecisionSession
  readonly command: string
  /** Defaults to the matched row's kind. */
  readonly mode?: 'read' | 'write'
  /** Facts read from the store. Only real booleans and strings count. */
  readonly facts?: Readonly<Record<string, unknown>>
  readonly record?: DecisionRecord
  readonly gestures?: PresentedGestures
}

export interface Decision {
  readonly allowed: boolean
  readonly reason: DecisionReason
  readonly rowId: string | null
  readonly gesture: Gesture
  readonly motivoRequired: boolean
  readonly scope: Scope | null
  readonly tableVersion: number
}
