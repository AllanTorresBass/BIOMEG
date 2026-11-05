import 'server-only'

import { headers } from 'next/headers'
import { appendAudit } from '@/lib/db/memory/audit-store'
import { TABLE_VERSION } from '@/lib/auth/table'
import { currentRequestId } from '@/lib/server/audit-request'
import { cleanMotivo, eventFor, severityFor } from '@/lib/server/domain/audit-catalog'
import type { AuditRow } from '@/types/audit/audit.types'
import type { AuditEventInput } from '@/types/server/audit.types'

export async function requestAddress(): Promise<string | null> {
  try {
    const list = await headers()
    return list.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null
  } catch {
    return null
  }
}

/** One row per event, refused and failed ones included. Those rows never carry a change. */
export async function auditEvent(input: AuditEventInput): Promise<AuditRow> {
  const address = await requestAddress()
  const event = eventFor(input.command, input.event)
  const outcome = input.outcome
  return appendAudit({
    requestId: currentRequestId(),
    severity: severityFor(event),
    who: {
      userId: input.account?.id ?? null,
      displayName: input.account?.displayName ?? null,
      roles: input.account?.roles ?? [],
      sessionId: input.session?.id ?? null,
    },
    what: {
      command: input.command,
      event,
      recordType: input.recordType ?? null,
      recordId: input.recordId ?? null,
      state: input.state ?? null,
    },
    when: { serverTime: new Date().toISOString(), timeZone: 'America/Caracas' },
    where: {
      channel: input.channel ?? 'staff',
      workstation: input.workstation ?? input.session?.workstation ?? null,
      address,
    },
    how: { gesture: input.gesture ?? 'NONE', source: input.source ?? 'ui' },
    why: { motivo: cleanMotivo(input.motivo), tableVersion: TABLE_VERSION, rowId: input.rowId ?? null },
    result: { outcome, reason: input.reason ?? (outcome === 'ALLOWED' ? 'OK' : 'STATE') },
    change: outcome === 'ALLOWED' ? (input.change ?? null) : null,
  })
}
