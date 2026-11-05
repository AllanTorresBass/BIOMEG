import type { PublicAccount, StaffSession } from '@/types/session/session.types'

export interface StoredAccount extends PublicAccount {
  salt: string
  hash: string
}

export interface FailureRecord {
  count: number
  pausedUntil: number
}

export interface SessionState {
  accounts: Map<string, StoredAccount>
  sessions: Map<string, StaffSession>
  failures: Map<string, FailureRecord>
}
