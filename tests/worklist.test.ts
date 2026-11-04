import { describe, expect, it } from 'vitest'
import { buildWorklist, toStatusOnly, worklistState } from '@/lib/server/domain/worklist'
import { isWorklistDate } from '@/lib/server/worklist-load'
import type { OrderStub } from '@/types/domain/order-stub.types'

function stub(id: string, patch: Partial<OrderStub> = {}): OrderStub {
  return {
    id,
    clientId: `c-${id}`,
    clientName: `Paciente ${id}`,
    cedulaType: null,
    cedulaDigits: null,
    createdAt: '2026-03-10T15:00:00.000Z',
    voided: false,
    hasResult: false,
    released: false,
    issued: false,
    needsReview: false,
    number: `0000${id}`,
    sampleDate: '2026-03-10',
    ...patch,
  }
}

describe('worklistState', () => {
  it('maps the order facts to the four states', () => {
    expect(worklistState(stub('1'))).toBe('ABIERTA')
    expect(worklistState(stub('1', { hasResult: true }))).toBe('INCOMPLETO')
    expect(worklistState(stub('1', { hasResult: true, released: true }))).toBe('LIBERADO')
    expect(worklistState(stub('1', { hasResult: true, released: true, correctionOpen: true }))).toBe('EN_CORRECCION')
  })
})

describe('buildWorklist', () => {
  it('lists only the orders of the chosen sample date', () => {
    const rows = buildWorklist([stub('1'), stub('2', { sampleDate: '2026-03-09' })], '2026-03-10')
    expect(rows.map((row) => row.id)).toEqual(['1'])
  })

  it('leaves voided orders out', () => {
    expect(buildWorklist([stub('1', { voided: true })], '2026-03-10')).toEqual([])
  })

  it('keeps an open correction listed on any date', () => {
    const rows = buildWorklist([stub('1', { sampleDate: '2026-02-01', correctionOpen: true })], '2026-03-10')
    expect(rows).toHaveLength(1)
    expect(rows[0]?.state).toBe('EN_CORRECCION')
  })

  it('falls back to the creation day when there is no sample date', () => {
    const rows = buildWorklist([stub('1', { sampleDate: null })], '2026-03-10')
    expect(rows).toHaveLength(1)
  })

  it('filters to orders in review on request', () => {
    const rows = buildWorklist([stub('1'), stub('2', { needsReview: true })], '2026-03-10', true)
    expect(rows.map((row) => row.id)).toEqual(['2'])
  })

  it('sorts by order number', () => {
    const rows = buildWorklist([stub('2'), stub('1')], '2026-03-10')
    expect(rows.map((row) => row.id)).toEqual(['1', '2'])
  })
})

describe('toStatusOnly', () => {
  it('drops the review flag and keeps the status columns', () => {
    const row = toStatusOnly(buildWorklist([stub('1', { needsReview: true, hasResult: true })], '2026-03-10'))[0]
    expect(row).toBeDefined()
    expect('needsReview' in (row ?? {})).toBe(false)
    expect(row?.state).toBe('INCOMPLETO')
    expect(row?.patient).toBe('Paciente 1')
  })
})

describe('isWorklistDate', () => {
  it('accepts real dates only', () => {
    expect(isWorklistDate('2026-03-10')).toBe(true)
    expect(isWorklistDate('2026-13-45')).toBe(false)
    expect(isWorklistDate('10/03/2026')).toBe(false)
    expect(isWorklistDate('')).toBe(false)
  })
})
