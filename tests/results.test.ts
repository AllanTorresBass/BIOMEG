import { describe, expect, it } from 'vitest'
import { discrepanciesOf, dropIncoming, getNote, getResult, holdIncoming, queueDiscrepancy, setNote, writeResult } from '@/lib/db/memory/result-store'
import { autoMark, closedRange, isNumericValue, parseLabNumber, resultOrderState } from '@/lib/domain/result-rules'

const base = { source: 'teclado' as const, byId: 'u-1', byName: 'Ana', mark: null }

describe('parseLabNumber', () => {
  it('reads comma and dot decimals', () => {
    expect(parseLabNumber('12,7')).toBe(12.7)
    expect(parseLabNumber('12.7')).toBe(12.7)
  })

  it('reads a dot with three digits after it as thousands', () => {
    expect(parseLabNumber('13.100')).toBe(13100)
  })

  it('rejects text and mixed input', () => {
    expect(parseLabNumber('abc')).toBeNull()
    expect(parseLabNumber('1,2,3')).toBeNull()
    expect(parseLabNumber('')).toBeNull()
  })

  it('tells numeric values from text', () => {
    expect(isNumericValue('5,2')).toBe(true)
    expect(isNumericValue('Positivo')).toBe(false)
  })
})

describe('Marca', () => {
  it('fills ALTO and BAJO from a closed range', () => {
    expect(autoMark('70 - 110 mg/dL', '120', 'F')).toBe('ALTO')
    expect(autoMark('70 - 110 mg/dL', '60', 'M')).toBe('BAJO')
  })

  it('stays blank when in range', () => {
    expect(autoMark('70 - 110 mg/dL', '90', 'F')).toBeNull()
  })

  it('stays blank when the sex is blank', () => {
    expect(autoMark('70 - 110 mg/dL', '120', null)).toBeNull()
  })

  it('stays blank for references that are not one closed range', () => {
    expect(autoMark('HOMBRES: 13 - 17 MUJERES: 12 - 15', '20', 'F')).toBeNull()
    expect(autoMark('Menor de 200', '300', 'F')).toBeNull()
    expect(closedRange('Menor de 200')).toBeNull()
  })

  it('stays blank for a value that is not a number', () => {
    expect(autoMark('70 - 110', 'Positivo', 'F')).toBeNull()
  })
})

describe('resultOrderState', () => {
  it('maps the stub to the state the table reads', () => {
    expect(resultOrderState({ hasResult: false, released: false })).toBe('PENDIENTE')
    expect(resultOrderState({ hasResult: true, released: false })).toBe('CARGADO')
    expect(resultOrderState({ hasResult: true, released: true })).toBe('LIBERADO')
    expect(resultOrderState({ hasResult: true, released: true, correctionOpen: true })).toBe('EN_CORRECCION')
  })
})

describe('result store', () => {
  it('saves a new cell at version 1 and bumps it on each write', () => {
    const first = writeResult({ ...base, orderId: 't-1', lineId: 'l-1', value: '10', expectedVersion: 0 })
    expect(first.kind).toBe('saved')
    const second = writeResult({ ...base, orderId: 't-1', lineId: 'l-1', value: '11', expectedVersion: 1 })
    expect(second.kind === 'saved' && second.result.version).toBe(2)
    expect(getResult('t-1', 'l-1')?.value).toBe('11')
  })

  it('returns the stored cell to a second writer with an old version', () => {
    writeResult({ ...base, orderId: 't-2', lineId: 'l-1', value: '10', expectedVersion: 0 })
    const stale = writeResult({ ...base, orderId: 't-2', lineId: 'l-1', value: '99', expectedVersion: 0 })
    expect(stale.kind).toBe('conflict')
    expect(getResult('t-2', 'l-1')?.value).toBe('10')
  })

  it('holds an analyzer value beside the typed one and drops it on request', () => {
    writeResult({ ...base, orderId: 't-3', lineId: 'l-1', value: '10', expectedVersion: 0 })
    holdIncoming('t-3', 'l-1', '14')
    expect(getResult('t-3', 'l-1')?.value).toBe('10')
    expect(getResult('t-3', 'l-1')?.incoming?.value).toBe('14')
    dropIncoming('t-3', 'l-1')
    expect(getResult('t-3', 'l-1')?.incoming).toBeNull()
  })

  it('ignores an incoming value for a cell that does not exist', () => {
    expect(holdIncoming('t-4', 'missing', '1')).toBeNull()
  })

  it('queues discrepancies per order', () => {
    queueDiscrepancy({ orderId: 't-5', lineId: 'l-1', name: 'Glucosa', value: '99', at: new Date().toISOString() })
    expect(discrepanciesOf('t-5')).toHaveLength(1)
    expect(discrepanciesOf('t-6')).toHaveLength(0)
  })

  it('keeps a section note and clears it when blank', () => {
    setNote('t-7', 'HEMATOLOGIA', 'Muestra lipémica')
    expect(getNote('t-7', 'HEMATOLOGIA')).toBe('Muestra lipémica')
    setNote('t-7', 'HEMATOLOGIA', '  ')
    expect(getNote('t-7', 'HEMATOLOGIA')).toBe('')
  })
})
