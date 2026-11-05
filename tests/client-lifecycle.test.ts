import { describe, expect, it } from 'vitest'
import { addMergeRequest, correctClientCedula, getClient, listMergeCandidates, listMergeRequests, listOpenMerges, mergeClients, searchClients, setClientActive, softDeleteClient, unmergeClients } from '@/lib/db/memory/client-store'
import type { Actor } from '@/types/stores/client-store.types'

const actor: Actor = { userId: 'u-test', userName: 'Prueba', now: '2026-11-04T12:00:00.000Z' }

describe('deactivate', () => {
  it('turns the client off once and does nothing the second time', () => {
    const first = setClientActive('c-2', false, actor)
    expect(first).toMatchObject({ ok: true, changed: true })
    expect(getClient('c-2')?.active).toBe(false)
    const second = setClientActive('c-2', false, actor)
    expect(second).toMatchObject({ ok: true, changed: false })
  })

  it('keeps an inactive client out of the normal search', () => {
    expect(searchClients({ text: 'Paciente Demo Dos', includeInactive: false }).map((c) => c.id)).not.toContain('c-2')
    expect(searchClients({ text: 'Paciente Demo Dos', includeInactive: true }).map((c) => c.id)).toContain('c-2')
  })

  it('reports an unknown client', () => {
    expect(setClientActive('nope', false, actor)).toEqual({ ok: false, reason: 'NOT_FOUND' })
  })
})

describe('delete', () => {
  it('keeps the record but takes it out of every search (M-02)', () => {
    expect(softDeleteClient('c-6', actor)).toMatchObject({ ok: true })
    expect(getClient('c-6')).toBeNull()
    expect(searchClients({ text: 'Paciente Demo Seis', includeInactive: true }).map((c) => c.id)).not.toContain('c-6')
  })
})

describe('correct cédula', () => {
  it('refuses a cédula another client already holds', () => {
    expect(correctClientCedula('c-1', 'V', '12000002', actor)).toEqual({ ok: false, reason: 'CEDULA_TAKEN' })
  })

  it('writes the new cédula and marks the client verified', () => {
    const result = correctClientCedula('c-1', 'V', '12999999', actor)
    expect(result.ok).toBe(true)
    expect(getClient('c-1')).toMatchObject({ cedulaType: 'V', cedulaDigits: '12999999', verified: true })
  })
})

describe('merge and undo', () => {
  it('refuses to merge a client with itself', () => {
    expect(mergeClients('c-3', 'c-3', actor)).toEqual({ ok: false, reason: 'SELF' })
  })

  it('absorbs the source into the survivor and records the merge', () => {
    const result = mergeClients('c-4', 'c-3', actor)
    expect(result.ok).toBe(true)
    expect(getClient('c-4')).toBeNull()
    expect(listOpenMerges().some((entry) => entry.sourceId === 'c-4' && entry.survivorId === 'c-3')).toBe(true)
  })

  it('brings the absorbed client back with its earlier active state (E-18)', () => {
    const open = listOpenMerges().find((entry) => entry.sourceId === 'c-4')
    expect(open).toBeDefined()
    const result = unmergeClients(open!.id, { ...actor, now: '2026-11-05T12:00:00.000Z' })
    expect(result.ok).toBe(true)
    expect(getClient('c-4')).not.toBeNull()
    expect(getClient('c-4')?.active).toBe(open!.sourceWasActive)
    expect(listOpenMerges().some((entry) => entry.id === open!.id)).toBe(false)
  })

  it('does not undo the same merge twice', () => {
    const again = mergeClients('c-4', 'c-3', actor)
    expect(again.ok).toBe(true)
    if (!again.ok) return
    expect(unmergeClients(again.merge.id, actor).ok).toBe(true)
    expect(unmergeClients(again.merge.id, actor)).toEqual({ ok: false, reason: 'ALREADY_UNDONE' })
  })

  it('lists everyone still in the registry as a merge candidate', () => {
    const ids = listMergeCandidates('c-3').map((candidate) => candidate.id)
    expect(ids).not.toContain('c-3')
    expect(ids).not.toContain('c-6')
  })
})

describe('merge requests', () => {
  it('lists a request under its client and clears it after a merge', () => {
    addMergeRequest({ clientId: 'c-1', note: 'Repetido con Dos', requestedBy: 'Prueba', requestedAt: actor.now })
    expect(listMergeRequests('c-1')).toHaveLength(1)
    const merged = mergeClients('c-2', 'c-1', actor)
    expect(merged.ok).toBe(true)
    expect(listMergeRequests('c-1')).toHaveLength(0)
  })
})
