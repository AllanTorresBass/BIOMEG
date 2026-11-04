import type { DecisionReason, Gesture } from '@/types/auth/auth.types'

export type AuditChannel = 'staff' | 'portal' | 'verify' | 'system'
export type AuditSource = 'ui' | 'api' | 'system' | 'instalacion'

export interface AuditRow {
  id: string
  who: {
    userId: string | null
    displayName: string | null
    roles: readonly string[]
    sessionId: string | null
  }
  what: {
    command: string
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
    outcome: 'ALLOWED' | 'REFUSED'
    reason: DecisionReason
  }
  /** Always null on a refused event, so no cédula digits or results are stored. */
  change: { before: unknown; after: unknown } | null
}

export type AuditRowInput = Omit<AuditRow, 'id'>
