import type { DecisionReason, Gesture } from '@/types/auth/auth.types'

export type AuditChannel = 'staff' | 'portal' | 'verify' | 'system'
export type AuditSource = 'ui' | 'api' | 'system' | 'instalacion'
export type AuditSeverity = 'INFO' | 'NOTICE' | 'WARNING' | 'CRITICAL'
export type AuditOutcome = 'ALLOWED' | 'REFUSED' | 'FAILED'

export interface AuditRow {
  id: string
  /** Assigned by the store. A gap is visible without trusting the clock. */
  sequence: number
  /** Shared by every row written for one request. */
  requestId: string
  severity: AuditSeverity
  who: {
    userId: string | null
    displayName: string | null
    roles: readonly string[]
    sessionId: string | null
  }
  what: {
    command: string
    /** Business name. The command name when the audit page names no other event. */
    event: string
    recordType: string | null
    recordId: string | null
    state: string | null
  }
  when: {
    /** ISO instant from the server clock. */
    serverTime: string
    timeZone: 'America/Caracas'
  }
  where: {
    channel: AuditChannel
    workstation: string | null
    address: string | null
  }
  how: {
    gesture: Gesture
    source: AuditSource
  }
  why: {
    motivo: string | null
    tableVersion: number
    rowId: string | null
  }
  result: {
    outcome: AuditOutcome
    reason: DecisionReason
  }
  /** Null on a refused or failed event, so no cédula digits or results are stored. */
  change: { before: unknown; after: unknown; field?: string } | null
}

/** The store assigns the id, the sequence, and a request id when the caller has none. */
export type AuditRowInput = Omit<AuditRow, 'id' | 'sequence' | 'requestId' | 'severity' | 'what'> & {
  requestId?: string
  severity?: AuditSeverity
  what: Omit<AuditRow['what'], 'event'> & { event?: string }
}
