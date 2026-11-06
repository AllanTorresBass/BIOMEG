import type { AuditRow } from '@/types/audit/audit.types'

export interface DurationSummary {
  count: number
  /** Median of the measured pairs, in milliseconds. Null when nothing completed. */
  medianMs: number | null
}

export interface AuditMetrics {
  /** ALLOWED order.open rows in range. Section 6.2 intake has no end event. */
  intake: number
  timeToFirstResult: DurationSummary
  releaseWait: DurationSummary
  turnaround: DurationSummary
  deliveryLag: DurationSummary
  portalUptake: DurationSummary
  correctionTime: DurationSummary
  resendLag: DurationSummary
  /** Pairs whose resend is still open, or took longer than two days. A starting threshold. */
  resendLagOverTwoDays: number
  adminQueue: DurationSummary
  discounts: number
  priceColumnOverrides: number
  portalFailures: { address: string; count: number }[]
  stepUpFailures: number
  selfEnteredReleases: number
  analyzerConflicts: number
  rateWarnings: number
  /** order.open → first control.assign */
  controlWait: DurationSummary
  /** ALLOWED patient.save that followed a similar-name confirm. */
  similarNameConfirms: number
  /** REFUSED patient.save with state SIMILAR_NAME. */
  similarNameRefusals: number
  /** ALLOWED order.line.add that carried a same-day motivo. */
  sameDayExamWarns: number
  deliveryFailures: { channel: string; count: number }[]
  /** Resend tasks with no later ALLOWED delivery. */
  openResendBacklog: number
  /** REFUSED delivery.send / delivery.resend on a released order (consent path). */
  consentRefusals: number
  /** Orders with a delivery then a later result.correct.open. */
  correctionsAfterDelivery: number
  refusals: { role: string; command: string; count: number }[]
  sameUserReversals: number
}

export interface RestaAging {
  /** Orders with Resta > 0 that are not voided. */
  openCount: number
  /** Median age of those orders from savedAt to now, in milliseconds. */
  medianAgeMs: number | null
}

export interface ClientShare {
  activeCount: number
  unverifiedCount: number
}

const TWO_DAYS_MS = 2 * 24 * 60 * 60 * 1000
const DELIVERY = new Set(['delivery.whatsapp', 'delivery.email'])
const PORTAL_FAILURES = new Set(['portal.login.failed', 'portal.code.failed'])

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

function sourceIdOf(row: AuditRow): string | null {
  const before = row.change?.before
  if (typeof before !== 'object' || before === null || !('sourceId' in before)) return null
  return typeof before.sourceId === 'string' ? before.sourceId : null
}

/** Wait from a merge request (R-019) to the act (R-020). Pairs by survivor or source id. */
function adminQueue(rows: readonly AuditRow[]): number[] {
  const requests = rows
    .filter((row) => allowed(row, 'client.merge.request'))
    .sort((left, right) => left.sequence - right.sequence)
  const values: number[] = []
  for (const merge of rows.filter((row) => allowed(row, 'patient.merge'))) {
    const sourceId = sourceIdOf(merge)
    const match = [...requests]
      .reverse()
      .find(
        (request) =>
          request.sequence < merge.sequence &&
          (request.what.recordId === merge.what.recordId || (sourceId !== null && request.what.recordId === sourceId)),
      )
    if (match) values.push(elapsed(match, merge))
  }
  return values
}

function portalFailures(rows: readonly AuditRow[]): { address: string; count: number }[] {
  const groups = new Map<string, number>()
  for (const row of rows) {
    if (row.result.outcome !== 'REFUSED' || !PORTAL_FAILURES.has(row.what.event)) continue
    const address = row.where.address ?? 'sin-dirección'
    groups.set(address, (groups.get(address) ?? 0) + 1)
  }
  return [...groups.entries()].map(([address, count]) => ({ address, count }))
}

function selfEnteredReleases(grouped: Map<string, AuditRow[]>): number {
  let count = 0
  for (const list of grouped.values()) {
    const enter = list.find((row) => allowed(row, 'result.enter') && row.who.userId)
    if (!enter?.who.userId) continue
    const release = list.find(
      (row) => allowed(row, 'result.release') && row.sequence > enter.sequence && row.who.userId === enter.who.userId,
    )
    if (release) count += 1
  }
  return count
}

/**
 * Resend lag from section 6.2: start at result.correct.release, require a later
 * delivery.resend.task, then measure to the first delivery.* after that task.
 */
function resendLagValues(grouped: Map<string, AuditRow[]>): number[] {
  const values: number[] = []
  for (const list of grouped.values()) {
    const start = list.find((row) => allowed(row, 'result.correct.release'))
    if (!start) continue
    const task = list.find((row) => allowed(row, 'delivery.resend.task') && row.sequence > start.sequence)
    if (!task) continue
    const delivery = list.find(
      (row) => DELIVERY.has(row.what.event) && row.result.outcome === 'ALLOWED' && row.sequence > task.sequence,
    )
    if (delivery) values.push(elapsed(start, delivery))
  }
  return values
}

function openResendBacklog(grouped: Map<string, AuditRow[]>): number {
  let count = 0
  for (const list of grouped.values()) {
    for (const task of list.filter((row) => allowed(row, 'delivery.resend.task'))) {
      const delivered = list.some(
        (row) => DELIVERY.has(row.what.event) && row.result.outcome === 'ALLOWED' && row.sequence > task.sequence,
      )
      if (!delivered) count += 1
    }
  }
  return count
}

function deliveryFailures(rows: readonly AuditRow[]): { channel: string; count: number }[] {
  const groups = new Map<string, number>()
  for (const row of rows) {
    if (row.result.outcome !== 'FAILED' || !DELIVERY.has(row.what.event)) continue
    const channel = row.what.event === 'delivery.whatsapp' ? 'WHATSAPP' : 'CORREO'
    groups.set(channel, (groups.get(channel) ?? 0) + 1)
  }
  return [...groups.entries()].map(([channel, count]) => ({ channel, count }))
}

function similarConfirmed(row: AuditRow): boolean {
  const after = row.change?.after
  if (typeof after !== 'object' || after === null || !('similarConfirmedIds' in after)) return false
  const ids = after.similarConfirmedIds
  return Array.isArray(ids) && ids.length > 0
}

function sameDayLine(row: AuditRow): boolean {
  if (!allowed(row, 'order.line.add')) return false
  if (row.why.motivo) return true
  const after = row.change?.after
  if (typeof after !== 'object' || after === null || !('repeatMotivo' in after)) return false
  return typeof after.repeatMotivo === 'string' && after.repeatMotivo.trim() !== ''
}

function correctionsAfterDelivery(grouped: Map<string, AuditRow[]>): number {
  let count = 0
  for (const list of grouped.values()) {
    const delivery = list.find((row) => DELIVERY.has(row.what.event) && row.result.outcome === 'ALLOWED')
    if (!delivery) continue
    if (list.some((row) => allowed(row, 'result.correct.open') && row.sequence > delivery.sequence)) count += 1
  }
  return count
}

/** Views over the audit rows. Counts and durations only: no name, cédula, phone, or result. */
export function auditMetrics(rows: readonly AuditRow[]): AuditMetrics {
  const grouped = byRecord(rows)
  const resend = resendLagValues(grouped)
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
    intake: rows.filter((row) => allowed(row, 'order.open')).length,
    timeToFirstResult: summary(pair(grouped, 'order.open', 'result.enter', 'first')),
    releaseWait: summary(pair(grouped, 'result.enter', 'result.release', 'first')),
    turnaround: summary(pair(grouped, 'order.open', 'result.release', 'last')),
    deliveryLag: summary(pair(grouped, 'result.release', [...DELIVERY], 'first')),
    portalUptake: summary(pair(grouped, 'result.release', 'portal.download', 'first')),
    correctionTime: summary(pair(grouped, 'result.correct.open', 'result.correct.release', 'first')),
    resendLag: summary(resend),
    resendLagOverTwoDays: resend.filter((value) => value > TWO_DAYS_MS).length,
    adminQueue: summary(adminQueue(rows)),
    discounts: rows.filter((row) => allowed(row, 'order.line.change.discount')).length,
    priceColumnOverrides: rows.filter((row) => allowed(row, 'order.price_column.override')).length,
    portalFailures: portalFailures(rows),
    stepUpFailures: rows.filter((row) => row.what.event === 'step_up.failed' && row.result.outcome === 'REFUSED').length,
    selfEnteredReleases: selfEnteredReleases(grouped),
    analyzerConflicts: rows.filter((row) => row.what.event === 'result.conflict' && row.result.outcome === 'REFUSED').length,
    rateWarnings: rows.filter((row) => row.what.event === 'order.rate.warn' && row.result.outcome === 'REFUSED').length,
    controlWait: summary(pair(grouped, 'order.open', 'control.assign', 'first')),
    similarNameConfirms: rows.filter((row) => allowed(row, 'patient.save') && similarConfirmed(row)).length,
    similarNameRefusals: rows.filter(
      (row) => row.what.event === 'patient.save' && row.result.outcome === 'REFUSED' && row.what.state === 'SIMILAR_NAME',
    ).length,
    sameDayExamWarns: rows.filter(sameDayLine).length,
    deliveryFailures: deliveryFailures(rows),
    openResendBacklog: openResendBacklog(grouped),
    consentRefusals: rows.filter(
      (row) =>
        (row.what.command === 'delivery.send' || row.what.command === 'delivery.resend') &&
        row.result.outcome === 'REFUSED' &&
        row.result.reason === 'STATE' &&
        row.what.state !== 'INCOMPLETO',
    ).length,
    correctionsAfterDelivery: correctionsAfterDelivery(grouped),
    refusals: [...refusals.values()],
    sameUserReversals: sameUserReversals(rows),
  }
}

/** Open Resta invoices: count and median age from Guardar. No client name in the result. */
export function restaAging(
  orders: readonly { state: string; savedAt: string; totals: { resta: string } }[],
  nowMs: number = Date.now(),
): RestaAging {
  const ages: number[] = []
  for (const order of orders) {
    if (order.state === 'ANULADA') continue
    const [whole = '0', fraction = ''] = order.totals.resta.trim().split('.')
    const cents = Number(whole) * 100 + Number(fraction.padEnd(2, '0').slice(0, 2))
    if (!Number.isFinite(cents) || cents <= 0) continue
    ages.push(nowMs - new Date(order.savedAt).getTime())
  }
  return { openCount: ages.length, medianAgeMs: median(ages) }
}

/** Active non-deleted clients: how many lack a complete cédula (Sin verificar). */
export function unverifiedShare(clients: readonly { active: boolean; verified: boolean }[]): ClientShare {
  const active = clients.filter((client) => client.active)
  return {
    activeCount: active.length,
    unverifiedCount: active.filter((client) => !client.verified).length,
  }
}

/** Starting review value from the audit page. A resend still open past two days is listed by count only. */
export const RESEND_LAG_LIMIT_MS = TWO_DAYS_MS
