import type { PortalSession } from '@/types/portal/portal.types'

export interface Challenge {
  clientIds: string[]
  name: string
  salt: string
  hash: string
  expiresAt: number
  wrong: number
  spent: boolean
}

export interface Failure {
  count: number
  pausedUntil: number
}

export interface PortalState {
  challenges: Map<string, Challenge>
  sessions: Map<string, PortalSession>
  failures: Map<string, Failure>
  /** Used only when PORTAL_HASH_SECRET is unset. Never a value written in the code. */
  fallbackSecret: string
}

export type ChallengeOutcome =
  | { kind: 'OK'; clientIds: string[]; name: string }
  | { kind: 'WRONG' | 'EXPIRED' | 'LOCKED' }
