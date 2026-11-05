import { describe, expect, it } from 'vitest'

import { auditMetrics, RESEND_LAG_LIMIT_MS } from '@/lib/server/domain/audit-metrics'
import type { AuditRow } from '@/types/audit/audit.types'

function row(partial: Pick<AuditRow, 'sequence' | 'what' | 'result'> & Partial<Pick<AuditRow, 'who' | 'change' | 'when'>>): AuditRow {
  return {
    id: `aud-${partial.sequence}`,
    sequence: partial.sequence,
    requestId: 'req',
    severity: 'INFO',
    who: partial.who ?? { userId: 'u-1', displayName: 'Persona Demo', roles: ['BIOANALISTA'], sessionId: 's' },
    what: partial.what,
    when: partial.when ?? { serverTime: new Date(1_700_000_000_000 + partial.sequence * 60_000).toISOString(), timeZone: 'America/Caracas' },
    where: { channel: 'staff', workstation: null, address: null },
    how: { gesture: 'NONE', source: 'ui' },
    why: { motivo: null, tableVersion: 5, rowId: null },
    result: partial.result,
    change: partial.change ?? null,
  }
}

describe('audit metrics', () => {
  it('measures turnaround from Guardar to the last release, and counts a same-user reversal', () => {
    const metrics = auditMetrics([
      row({
        sequence: 1,
        what: { command: 'order.save', event: 'order.open', recordType: 'order', recordId: 'o-1', state: 'ABIERTA' },
        result: { outcome: 'ALLOWED', reason: 'OK' },
        when: { serverTime: '2026-11-04T12:00:00.000Z', timeZone: 'America/Caracas' },
      }),
      row({
        sequence: 2,
        what: { command: 'result.enter', event: 'result.enter', recordType: 'order', recordId: 'o-1', state: 'INCOMPLETO' },
        result: { outcome: 'ALLOWED', reason: 'OK' },
        when: { serverTime: '2026-11-04T13:00:00.000Z', timeZone: 'America/Caracas' },
        change: { before: null, after: { value: '12,7' } },
      }),
      row({
        sequence: 3,
        what: { command: 'result.release', event: 'result.release', recordType: 'order', recordId: 'o-1', state: 'LIBERADO' },
        result: { outcome: 'ALLOWED', reason: 'OK' },
        when: { serverTime: '2026-11-04T15:00:00.000Z', timeZone: 'America/Caracas' },
      }),
      row({
        sequence: 4,
        what: { command: 'payment.record', event: 'payment.record', recordType: 'payment', recordId: 'pay-1', state: null },
        result: { outcome: 'ALLOWED', reason: 'OK' },
        who: { userId: 'u-recepcion', displayName: 'Recepción Demo', roles: ['RECEPCION'], sessionId: 's' },
        change: { before: null, after: { id: 'pay-1' } },
      }),
      row({
        sequence: 5,
        what: { command: 'payment.reverse', event: 'payment.reverse', recordType: 'payment', recordId: 'pay-1', state: null },
        result: { outcome: 'ALLOWED', reason: 'OK' },
        who: { userId: 'u-recepcion', displayName: 'Recepción Demo', roles: ['RECEPCION'], sessionId: 's' },
        change: { before: { id: 'pay-1' }, after: { id: 'pay-2' } },
      }),
      row({
        sequence: 6,
        what: { command: 'order.open', event: 'order.open', recordType: 'order', recordId: 'o-2', state: null },
        result: { outcome: 'REFUSED', reason: 'ROLE' },
        who: { userId: 'u-auxiliar', displayName: 'Auxiliar Demo', roles: ['AUXILIAR'], sessionId: 's' },
      }),
    ])

    expect(metrics.timeToFirstResult).toEqual({ count: 1, medianMs: 60 * 60 * 1000 })
    expect(metrics.turnaround).toEqual({ count: 1, medianMs: 3 * 60 * 60 * 1000 })
    expect(metrics.releaseWait.count).toBe(1)
    expect(metrics.sameUserReversals).toBe(1)
    expect(metrics.refusals).toEqual([{ role: 'AUXILIAR', command: 'order.open', count: 1 }])
    expect(JSON.stringify(metrics)).not.toContain('12,7')
    expect(JSON.stringify(metrics)).not.toContain('Recepción')
  })

  it('counts a resend that takes longer than two days', () => {
    const metrics = auditMetrics([
      row({
        sequence: 1,
        what: { command: 'delivery.resend.task', event: 'delivery.resend.task', recordType: 'order', recordId: 'o-1', state: null },
        result: { outcome: 'ALLOWED', reason: 'OK' },
        when: { serverTime: '2026-11-01T12:00:00.000Z', timeZone: 'America/Caracas' },
      }),
      row({
        sequence: 2,
        what: { command: 'delivery.email', event: 'delivery.email', recordType: 'order', recordId: 'o-1', state: null },
        result: { outcome: 'ALLOWED', reason: 'OK' },
        when: { serverTime: '2026-11-04T12:00:00.000Z', timeZone: 'America/Caracas' },
      }),
    ])
    expect(metrics.resendLag.count).toBe(1)
    expect(metrics.resendLag.medianMs).toBeGreaterThan(RESEND_LAG_LIMIT_MS)
    expect(metrics.resendLagOverTwoDays).toBe(1)
  })

  it('measures the admin queue, discounts, overrides, portal and step-up failures, self-entered releases, conflicts, and rate warnings', () => {
    const metrics = auditMetrics([
      row({
        sequence: 1,
        what: { command: 'client.merge.request', event: 'client.merge.request', recordType: 'client', recordId: 'c-2', state: null },
        result: { outcome: 'ALLOWED', reason: 'OK' },
        when: { serverTime: '2026-11-04T10:00:00.000Z', timeZone: 'America/Caracas' },
      }),
      row({
        sequence: 2,
        what: { command: 'client.merge', event: 'patient.merge', recordType: 'client', recordId: 'c-1', state: null },
        result: { outcome: 'ALLOWED', reason: 'OK' },
        when: { serverTime: '2026-11-04T12:00:00.000Z', timeZone: 'America/Caracas' },
        change: { before: { sourceId: 'c-2' }, after: { survivorId: 'c-1' } },
      }),
      row({
        sequence: 3,
        what: { command: 'order.discount', event: 'order.line.change.discount', recordType: 'order', recordId: 'o-1', state: null },
        result: { outcome: 'ALLOWED', reason: 'OK' },
      }),
      row({
        sequence: 4,
        what: {
          command: 'order.price_column.override',
          event: 'order.price_column.override',
          recordType: 'order_draft',
          recordId: 'd-1',
          state: null,
        },
        result: { outcome: 'ALLOWED', reason: 'OK' },
      }),
      row({
        sequence: 5,
        what: { command: 'portal.login.failed', event: 'portal.login.failed', recordType: 'portal_key', recordId: 'abcd', state: null },
        result: { outcome: 'REFUSED', reason: 'STATE' },
        who: { userId: null, displayName: null, roles: [], sessionId: null },
      }),
      row({
        sequence: 6,
        what: { command: 'step_up.failed', event: 'step_up.failed', recordType: null, recordId: null, state: null },
        result: { outcome: 'REFUSED', reason: 'STEP_UP' },
      }),
      row({
        sequence: 7,
        what: { command: 'result.enter', event: 'result.enter', recordType: 'order', recordId: 'o-9', state: 'INCOMPLETO' },
        result: { outcome: 'ALLOWED', reason: 'OK' },
        who: { userId: 'u-bio', displayName: 'Bio', roles: ['BIOANALISTA'], sessionId: 's' },
      }),
      row({
        sequence: 8,
        what: { command: 'result.release', event: 'result.release', recordType: 'order', recordId: 'o-9', state: 'LIBERADO' },
        result: { outcome: 'ALLOWED', reason: 'OK' },
        who: { userId: 'u-bio', displayName: 'Bio', roles: ['BIOANALISTA'], sessionId: 's' },
      }),
      row({
        sequence: 9,
        what: { command: 'result.import', event: 'result.conflict', recordType: 'order', recordId: 'o-9', state: null },
        result: { outcome: 'REFUSED', reason: 'OWNERSHIP' },
      }),
      row({
        sequence: 10,
        what: { command: 'order.save', event: 'order.rate.warn', recordType: 'order_draft', recordId: 'd-2', state: null },
        result: { outcome: 'REFUSED', reason: 'STATE' },
      }),
    ])

    expect(metrics.adminQueue).toEqual({ count: 1, medianMs: 2 * 60 * 60 * 1000 })
    expect(metrics.discounts).toBe(1)
    expect(metrics.priceColumnOverrides).toBe(1)
    expect(metrics.portalFailures).toEqual([{ address: 'sin-dirección', count: 1 }])
    expect(metrics.stepUpFailures).toBe(1)
    expect(metrics.selfEnteredReleases).toBe(1)
    expect(metrics.analyzerConflicts).toBe(1)
    expect(metrics.rateWarnings).toBe(1)
    expect(JSON.stringify(metrics)).not.toContain('Bio')
  })
})
