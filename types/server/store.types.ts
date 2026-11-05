import type { StaffRole } from '@/types/auth/auth.types'
import type { PublicAccount, StaffSession } from '@/types/session/session.types'

export interface StoredAccount extends PublicAccount {
  salt: string
  hash: string
  active: boolean
  license: string | null
  coverRoles: StaffRole[]
  /** Inclusive laboratory date. Empty once the day has passed. */
  coverUntil: string | null
  passwordExpiresAt: number | null
}

export interface FailureRecord {
  count: number
  pausedUntil: number
}

export interface StaffDirectoryRow {
  id: string
  username: string
  displayName: string
  roles: StaffRole[]
  active: boolean
  coverRoles: StaffRole[]
  coverUntil: string | null
  licensePresent: boolean
}

export interface SessionState {
  accounts: Map<string, StoredAccount>
  sessions: Map<string, StaffSession>
  failures: Map<string, FailureRecord>
}
