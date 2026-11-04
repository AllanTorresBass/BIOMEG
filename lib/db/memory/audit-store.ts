import 'server-only'

import type { AuditRow, AuditRowInput } from '@/types/audit/audit.types'

const rows: AuditRow[] = []
let counter = 0

/** Append only. There is no update and no delete. A refused event never stores a change. */
export function appendAudit(input: AuditRowInput): AuditRow {
  counter += 1
  const row: AuditRow = Object.freeze({
    ...input,
    id: `aud-${String(counter).padStart(6, '0')}`,
    change: input.result.outcome === 'REFUSED' ? null : input.change,
  })
  rows.push(row)
  return row
}

export function listAudit(): readonly AuditRow[] {
  return [...rows]
}

export function resetAuditForTests(): void {
  rows.length = 0
  counter = 0
}
