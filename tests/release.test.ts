import { describe, expect, it } from 'vitest'
import {
  processedByOf,
  releaseSections,
  reportDateOf,
  sectionRelease,
  sectionsWithResults,
  writeResult,
} from '@/lib/db/memory/result-store'

const base = { source: 'teclado' as const, byId: 'u-1', byName: 'Ana', mark: null }
const HEM = 'HEMATOLOGIA COMPLETA'
const QUIM = 'QUIMICA SANGUINEA'

function enter(orderId: string, lineId: string) {
  writeResult({ ...base, orderId, lineId, value: '10', expectedVersion: 0 })
}

describe('releaseSections', () => {
  it('releases a section that has results and records who and when', () => {
    enter('rel-1', 'rl-01')
    const outcome = releaseSections('rel-1', [HEM], 'b-1', 'Beatriz')
    expect(outcome.kind).toBe('released')
    expect(sectionRelease('rel-1', HEM)?.byName).toBe('Beatriz')
    expect(reportDateOf('rel-1')).not.toBeNull()
    expect(processedByOf('rel-1')).toBe('Beatriz')
  })

  it('is not complete while sections of the catalog are still open', () => {
    enter('rel-2', 'rl-01')
    const outcome = releaseSections('rel-2', [HEM], 'b-1', 'Beatriz')
    expect(outcome.kind === 'released' && outcome.complete).toBe(false)
  })

  it('refuses a section with no results and releases nothing', () => {
    enter('rel-3', 'rl-01')
    const outcome = releaseSections('rel-3', [HEM, QUIM], 'b-1', 'Beatriz')
    expect(outcome).toEqual({ kind: 'empty', section: QUIM })
    expect(sectionRelease('rel-3', HEM)).toBeNull()
    expect(reportDateOf('rel-3')).toBeNull()
  })

  it('gives back the first releaser when a second one tries the same section', () => {
    enter('rel-4', 'rl-01')
    releaseSections('rel-4', [HEM], 'b-1', 'Beatriz')
    const second = releaseSections('rel-4', [HEM], 'b-2', 'Carlos')
    expect(second.kind).toBe('already')
    if (second.kind === 'already') expect(second.by.byName).toBe('Beatriz')
    expect(sectionRelease('rel-4', HEM)?.byName).toBe('Beatriz')
  })

  it('releases several sections together', () => {
    enter('rel-5', 'rl-01')
    enter('rel-5', 'rl-09')
    const outcome = releaseSections('rel-5', [HEM, QUIM], 'b-1', 'Beatriz')
    expect(outcome.kind === 'released' && outcome.sections).toEqual([HEM, QUIM])
    expect(sectionsWithResults('rel-5').sort()).toEqual([HEM, QUIM].sort())
  })

  it('reports no processor for an order without releases', () => {
    expect(processedByOf('rel-none')).toBeNull()
  })
})
