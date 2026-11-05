import { describe, expect, it, vi } from 'vitest'

vi.mock('server-only', () => ({}))

import { abandonCorrection, canDeliver, finishCorrection, reportSurfaceOf, startCorrection } from '@/lib/db/memory/correction-store'
import { issuesOf } from '@/lib/db/memory/issue-store'
import { getCorrection, releaseSections, sectionRelease, sectionResultState, writeResult } from '@/lib/db/memory/result-store'

const base = { source: 'teclado' as const, byId: 'u-1', byName: 'Ana', mark: null }
const HEM = 'HEMATOLOGIA COMPLETA'

function releasedOrder(orderId: string) {
  writeResult({ ...base, orderId, lineId: 'rl-01', value: '10', expectedVersion: 0 })
  releaseSections(orderId, [HEM], 'b-1', 'Beatriz')
}

describe('correction cycle', () => {
  it('opens a correction on a released section and hides the report meanwhile', () => {
    releasedOrder('cor-1')
    const outcome = startCorrection('cor-1', HEM, 'Valor mal digitado', 'b-1', 'Beatriz')
    expect(outcome.kind).toBe('opened')
    expect(sectionResultState('cor-1', HEM)).toBe('EN_CORRECCION')
    expect(canDeliver('cor-1')).toBe(false)
    expect(reportSurfaceOf('cor-1').kind).toBe('EN_REVISION')
  })

  it('refuses a second correction on the same section', () => {
    releasedOrder('cor-2')
    startCorrection('cor-2', HEM, 'Primero', 'b-1', 'Beatriz')
    expect(startCorrection('cor-2', HEM, 'Segundo', 'b-2', 'Carlos').kind).not.toBe('opened')
    expect(getCorrection('cor-2', HEM)?.byName).toBe('Beatriz')
  })

  it('cancels an open correction and keeps the original release (E-31)', () => {
    releasedOrder('cor-3')
    startCorrection('cor-3', HEM, 'Revisar', 'b-1', 'Beatriz')
    expect(abandonCorrection('cor-3', HEM)).not.toBeNull()
    expect(getCorrection('cor-3', HEM)).toBeNull()
    expect(sectionResultState('cor-3', HEM)).toBe('LIBERADO')
    expect(sectionRelease('cor-3', HEM)).not.toBeNull()
    expect(canDeliver('cor-3')).toBe(true)
  })

  it('releases the correction and leaves a single current issue (E-34)', () => {
    releasedOrder('cor-4')
    startCorrection('cor-4', HEM, 'Valor mal digitado', 'b-1', 'Beatriz')
    const outcome = finishCorrection('cor-4', HEM, 'b-1', 'Beatriz')
    expect(outcome.kind).toBe('released')
    expect(getCorrection('cor-4', HEM)).toBeNull()
    expect(sectionResultState('cor-4', HEM)).toBe('LIBERADO')
    expect(issuesOf('cor-4').filter((issue) => issue.status === 'VIGENTE')).toHaveLength(1)
    expect(canDeliver('cor-4')).toBe(true)
  })

  it('rolls everything back when the commit step fails', () => {
    releasedOrder('cor-5')
    startCorrection('cor-5', HEM, 'Valor mal digitado', 'b-1', 'Beatriz')
    const issuesBefore = issuesOf('cor-5').length
    const outcome = finishCorrection('cor-5', HEM, 'b-1', 'Beatriz', () => {
      throw new Error('boom')
    })
    expect(outcome.kind).toBe('failed')
    expect(getCorrection('cor-5', HEM)).not.toBeNull()
    expect(issuesOf('cor-5')).toHaveLength(issuesBefore)
    expect(canDeliver('cor-5')).toBe(false)
  })

  it('has nothing to release when no correction is open', () => {
    releasedOrder('cor-6')
    expect(finishCorrection('cor-6', HEM, 'b-1', 'Beatriz').kind).toBe('none')
  })
})
