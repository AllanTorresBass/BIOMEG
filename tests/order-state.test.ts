import { describe, expect, it } from 'vitest'

import { appendAudit, listAudit, resetAuditForTests } from '@/lib/db/memory/audit-store'
import { canVoid, deriveOrderState, type OrderResult } from '@/lib/server/domain/order-state'
import { applyAggregatesOnly, applyReleasedSectionsPartial, applyStatusOnly } from '@/lib/auth/scopes'

const result = (sectionId: string, state: OrderResult['state']): OrderResult => ({ sectionId, state })
const derive = (results: OrderResult[], extra: { saved?: boolean; voided?: boolean } = {}) =>
  deriveOrderState({ saved: true, voided: false, results, ...extra })

describe('order state', () => {
  it('is BORRADOR until saved, then ABIERTA', () => {
    expect(derive([], { saved: false })).toBe('BORRADOR')
    expect(derive([result('a', 'PENDIENTE')])).toBe('ABIERTA')
  })

  it('moves to INCOMPLETO at the first stored result', () => {
    expect(derive([result('a', 'CARGADO'), result('b', 'PENDIENTE')])).toBe('INCOMPLETO')
  })

  it('is LIBERADO only when every section is released', () => {
    expect(derive([result('a', 'LIBERADO'), result('b', 'CARGADO')])).toBe('INCOMPLETO')
    expect(derive([result('a', 'LIBERADO'), result('b', 'LIBERADO')])).toBe('LIBERADO')
  })

  it('moves a fully released order to EN_CORRECCION with its section', () => {
    expect(derive([result('a', 'EN_CORRECCION'), result('b', 'LIBERADO')])).toBe('EN_CORRECCION')
  })

  it('keeps a partial order INCOMPLETO during a correction', () => {
    expect(derive([result('a', 'EN_CORRECCION'), result('b', 'CARGADO')])).toBe('INCOMPLETO')
  })

  it('voids only while no result is released', () => {
    expect(canVoid([result('a', 'CARGADO')])).toBe(true)
    expect(canVoid([result('a', 'LIBERADO')])).toBe(false)
    expect(derive([result('a', 'CARGADO')], { voided: true })).toBe('ANULADA')
    expect(() => derive([result('a', 'LIBERADO')], { voided: true })).toThrow()
  })
})

describe('scope helpers', () => {
  it('drops value fields for status_only', () => {
    const row = { orderNumber: '0001', status: 'CARGADO', value: '12,7' }
    expect(applyStatusOnly(row, ['value'])).toEqual({ orderNumber: '0001', status: 'CARGADO' })
  })

  it('suppresses small groups for aggregates_only', () => {
    const output = applyAggregatesOnly([
      { label: 'A', count: 12 },
      { label: 'B', count: 2 },
    ])
    expect(output.groups).toEqual([{ label: 'A', count: 12 }])
    expect(output.suppressedGroups).toBe(1)
  })

  it('keeps released sections only and flags the partial', () => {
    const output = applyReleasedSectionsPartial([
      { name: 'Hematología', released: true },
      { name: 'Química', released: false },
    ])
    expect(output.sections).toHaveLength(1)
    expect(output.partial).toBe(true)
  })
})

describe('audit store', () => {
  it('is append only and stores no change on a refused event', () => {
    resetAuditForTests()
    appendAudit({
      who: { userId: 'u1', displayName: 'Demo', roles: ['RECEPCION'], sessionId: 's1' },
      what: { command: 'client.merge', recordType: 'client', recordId: 'c1', state: null },
      when: { serverTime: '2026-11-04T12:00:00.000Z', timeZone: 'America/Caracas' },
      where: { channel: 'staff', workstation: 'PC-1', address: null },
      how: { gesture: 'NONE', source: 'api' },
      why: { motivo: null, tableVersion: 5, rowId: null },
      result: { outcome: 'REFUSED', reason: 'ROLE' },
      change: { before: { cedula: '12345678' }, after: null },
    })
    const [stored] = listAudit()
    expect(stored?.change).toBeNull()
    expect(Object.isFrozen(stored)).toBe(true)
    expect(listAudit()).toHaveLength(1)
  })
})
