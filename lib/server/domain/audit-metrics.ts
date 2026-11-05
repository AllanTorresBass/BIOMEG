import type { AuditRow } from '@/types/audit/audit.types'

export interface DurationSummary {
  count: number
  /** Median of the measured pairs, in milliseconds. Null when nothing completed. */
  medianMs: number | null
}

export interface AuditMetrics {
  timeToFirstResult: DurationSummary
  releaseWait: DurationSummary
  turnaround: DurationSummary
  deliveryLag: DurationSummary
  portalUptake: DurationSummary
  correctionTime: DurationSummary
  resendLag: DurationSummary
  /** Pairs whose resend is still open, or took longer than two days. A starting threshold. */
  resendLagOverTwoDays: number
  refusals: { role: string; command: string; count: number }[]
  sameUserReversals: number
}

const TWO_DAYS_MS = 2 * 24 * 60 * 60 * 1000
const DELIVERY = new Set(['delivery.whatsapp', 'delivery.email'])

function median(values: readonly number[]): number | null {
  if (values.length === 0) return null
  const sorted = [...values].sort((left, right) => left - right)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 === 0 ? Math.round((sorted[mid - 1]! + sorted[mid]!) / 2) : sorted[mid]!
}

function summary(values: readonly number[]): DurationSummary {
  return { count: values.length, medianMs: median(values) }
}

function allowed(row: AuditRow, event: string): boolean {
  return row.what.event === event && row.result.outcome === 'ALLOWED'
}

function byRecord(rows: readonly AuditRow[]): Map<string, AuditRow[]> {
  const grouped = new Map<string, AuditRow[]>()
  for (const row of rows) {
    if (!row.what.recordId) continue
    const list = grouped.get(row.what.recordId) ?? []
    list.push(row)
    grouped.set(row.what.recordId, list)
  }
  for (const list of grouped.values()) list.sort((left, right) => left.sequence - right.sequence)
  return grouped
}

function elapsed(start: AuditRow, end: AuditRow): number {
  return new Date(end.when.serverTime).getTime() - new Date(start.when.serverTime).getTime()
}

function pair(
  grouped: Map<string, AuditRow[]>,
  startEvent: string,
  endEvent: string | readonly string[],
  pick: 'first' | 'last',
): number[] {
  const ends = typeof endEvent === 'string' ? new Set([endEvent]) : new Set(endEvent)
  const values: number[] = []
  for (const list of grouped.values()) {
    const start = list.find((row) => allowed(row, startEvent))
    if (!start) continue
    const matches = list.filter((row) => ends.has(row.what.event) && row.result.outcome === 'ALLOWED' && row.sequence > start.sequence)
    const end = pick === 'last' ? matches.at(-1) : matches[0]
    if (end) values.push(elapsed(start, end))
  }
  return values
}

function sameUserReversals(rows: readonly AuditRow[]): number {
  const recordedBy = new Map<string, string>()
  for (const row of rows) {
    if (!allowed(row, 'payment.record') || !row.who.userId) continue
    const after = row.change?.after
    if (typeof after === 'object' && after !== null && 'id' in after && typeof after.id === 'string') {
      recordedBy.set(after.id, row.who.userId)
    }
  }
  let count = 0
  for (const row of rows) {
    if (!allowed(row, 'payment.reverse') || !row.who.userId) continue
    const before = row.change?.before
    if (typeof before !== 'object' || before === null || !('id' in before) || typeof before.id !== 'string') continue
    if (recordedBy.get(before.id) === row.who.userId) count += 1
  }
  return count
}

/** Views over the audit rows. Counts and durations only: no name, cédula, phone, or result. */
export function auditMetrics(rows: readonly AuditRow[]): AuditMetrics {
  const grouped = byRecord(rows)
  const resend = pair(grouped, 'delivery.resend.task', [...DELIVERY], 'first')
  const refusals = new Map<string, { role: string; command: string; count: number }>()
  for (const row of rows) {
    if (row.result.outcome !== 'REFUSED') continue
    const role = row.who.roles[0] ?? 'NONE'
    const key = `${role}\u0000${row.what.command}`
    const current = refusals.get(key) ?? { role, command: row.what.command, count: 0 }
    current.count += 1
    refusals.set(key, current)
  }

  return {
    timeToFirstResult: summary(pair(grouped, 'order.open', 'result.enter', 'first')),
    releaseWait: summary(pair(grouped, 'result.enter', 'result.release', 'first')),
    turnaround: summary(pair(grouped, 'order.open', 'result.release', 'last')),
    deliveryLag: summary(pair(grouped, 'result.release', [...DELIVERY], 'first')),
    portalUptake: summary(pair(grouped, 'result.release', 'portal.download', 'first')),
    correctionTime: summary(pair(grouped, 'result.correct.open', 'result.correct.release', 'first')),
    resendLag: summary(resend),
    resendLagOverTwoDays: resend.filter((value) => value > TWO_DAYS_MS).length,
    refusals: [...refusals.values()],
    sameUserReversals: sameUserReversals(rows),
  }
}

/** Starting review value from the audit page. A resend still open past two days is listed by count only. */
export const RESEND_LAG_LIMIT_MS = TWO_DAYS_MS
