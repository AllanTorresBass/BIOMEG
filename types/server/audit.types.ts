import type { AuditChannel, AuditSource } from '@/types/audit/audit.types'
import type { DecisionReason, Gesture } from '@/types/auth/auth.types'
import type { PublicAccount, StaffSession } from '@/types/session/session.types'

export interface AuditEventInput {
  command: string
  outcome: 'ALLOWED' | 'REFUSED'
  reason?: DecisionReason
  session?: StaffSession | null
  account?: PublicAccount | null
  workstation?: string | null
  gesture?: Gesture
  source?: AuditSource
  channel?: AuditChannel
  recordType?: string | null
  recordId?: string | null
  state?: string | null
  motivo?: string | null
  rowId?: string | null
  change?: { before: unknown; after: unknown; field?: string } | null
}
