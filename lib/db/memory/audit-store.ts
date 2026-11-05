import 'server-only'

import type { AuditRow, AuditRowInput } from '@/types/audit/audit.types'

type AuditState = { rows: AuditRow[]; counter: number }

const globalStore = globalThis as typeof globalThis & { __biomegAudit?: AuditState }

function state(): AuditState {
  return (globalStore.__biomegAudit ??= { rows: [], counter: 0 })
}

/** Append only. There is no update and no delete. A refused or failed event never stores a change. */
export function appendAudit(input: AuditRowInput): AuditRow {
  const current = state()
  current.counter += 1
  const counter = current.counter
  const row: AuditRow = Object.freeze({
    id: `aud-${String(counter).padStart(6, '0')}`,
    sequence: counter,
    requestId: input.requestId ?? `req-${String(counter).padStart(6, '0')}`,
    severity: input.severity ?? 'INFO',
    who: input.who,
    what: {
      command: input.what.command,
      event: input.what.event ?? input.what.command,
      recordType: input.what.recordType,
      recordId: input.what.recordId,
      state: input.what.state,
    },
    when: input.when,
    where: input.where,
    how: input.how,
    why: input.why,
    result: input.result,
    change: input.result.outcome === 'ALLOWED' ? input.change : null,
  })
  current.rows.push(row)
  return row
}

export function listAudit(): readonly AuditRow[] {
  return [...state().rows]
}

export function resetAuditForTests(): void {
  const current = state()
  current.rows.length = 0
  current.counter = 0
}
