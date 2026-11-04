import 'server-only'

import { headers } from 'next/headers'
import { appendAudit } from '@/lib/db/memory/audit-store'
import { TABLE_VERSION } from '@/lib/auth/table'
import type { AuditRow, AuditSource } from '@/types/audit/audit.types'
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
  recordType?: string | null
  recordId?: string | null
  state?: string | null
  motivo?: string | null
  rowId?: string | null
  change?: { before: unknown; after: unknown; field?: string } | null
}

async function requestAddress(): Promise<string | null> {
  try {
    const list = await headers()
    return list.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null
  } catch {
    return null
  }
}

/** One row per event, refused ones included. A refused row never carries a change. */
export async function auditEvent(input: AuditEventInput): Promise<AuditRow> {
  const address = await requestAddress()
  return appendAudit({
    who: {
      userId: input.account?.id ?? null,
      displayName: input.account?.displayName ?? null,
      roles: input.account?.roles ?? [],
      sessionId: input.session?.id ?? null,
    },
    what: {
      command: input.command,
      recordType: input.recordType ?? null,
      recordId: input.recordId ?? null,
      state: input.state ?? null,
    },
    when: { serverTime: new Date().toISOString(), timeZone: 'America/Caracas' },
    where: {
      channel: 'staff',
      workstation: input.workstation ?? input.session?.workstation ?? null,
      address,
    },
    how: { gesture: input.gesture ?? 'NONE', source: input.source ?? 'ui' },
    why: { motivo: input.motivo ?? null, tableVersion: TABLE_VERSION, rowId: input.rowId ?? null },
    result: { outcome: input.outcome, reason: input.reason ?? (input.outcome === 'ALLOWED' ? 'OK' : 'ROLE') },
    change: input.outcome === 'REFUSED' ? null : (input.change ?? null),
  })
}
