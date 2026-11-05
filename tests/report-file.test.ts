import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const session = vi.hoisted(() => ({ roles: ['RECEPCION'] as string[], locked: false, signedIn: true }))

vi.mock('server-only', () => ({}))
vi.mock('next/headers', () => ({ headers: async () => new Headers() }))
vi.mock('@/lib/server/session/current', () => ({
  getStaffContext: async () =>
    session.signedIn
      ? { session: { id: 's', workstation: null }, account: { id: 'u', displayName: 'Demo', roles: session.roles }, locked: session.locked }
      : null,
  toDecisionSession: () => ({ valid: true, active: true, userId: 'u', roles: session.roles }),
}))

import { printedLinesOf, replaceIssue, restoreIssues, snapshotIssues, vigenteIssueOf } from '@/lib/db/memory/issue-store'
import { getStub, updateStub } from '@/lib/db/memory/order-index'
import { saveReport } from '@/lib/db/memory/report-store'
import { buildReport } from '@/lib/server/domain/report'
import { readReportFile } from '@/lib/server/queries/reports'

const ORDER = 'o-1'
const original = { ...getStub(ORDER)!, correctionOpen: false }
let snapshot: ReturnType<typeof snapshotIssues>

function store(draft: boolean) {
  const built = buildReport({ stub: getStub(ORDER)!, mode: 'PACIENTE', lineId: null, origin: null })
  if (built.kind !== 'READY') throw new Error('not ready')
  return saveReport({
    orderId: ORDER,
    mode: 'PACIENTE',
    lineId: null,
    issueId: draft ? null : vigenteIssueOf(ORDER)!.id,
    draft,
    byName: 'Demo',
    document: built.document,
    pdf: Buffer.from('%PDF-'),
  })
}

beforeEach(() => {
  snapshot = snapshotIssues()
  session.roles = ['RECEPCION']
  session.locked = false
  session.signedIn = true
})

afterEach(() => {
  restoreIssues(snapshot)
  updateStub(ORDER, original)
})

describe('reading a stored report file', () => {
  it('gives Recepción an issued file on a released order', async () => {
    expect((await readReportFile(ORDER, store(false).id)).kind).toBe('FILE')
  })

  it('refuses Recepción a draft of an unreleased order', async () => {
    updateStub(ORDER, { released: false, hasResult: true })
    expect(await readReportFile(ORDER, store(true).id)).toEqual({ kind: 'REFUSED', status: 403 })
  })

  it('gives the bioanalyst that same draft', async () => {
    updateStub(ORDER, { released: false, hasResult: true })
    session.roles = ['BIOANALISTA']
    expect((await readReportFile(ORDER, store(true).id)).kind).toBe('FILE')
  })

  it('refuses a role with no print row', async () => {
    session.roles = ['ADMINISTRACION']
    expect(await readReportFile(ORDER, store(false).id)).toEqual({ kind: 'REFUSED', status: 403 })
  })

  it.each([
    ['an open correction', { correctionOpen: true }],
    ['a voided order', { voided: true }],
  ])('holds a kept file back during %s', async (_name, patch) => {
    session.roles = ['BIOANALISTA']
    const report = store(false)
    updateStub(ORDER, patch)
    expect((await readReportFile(ORDER, report.id)).kind).toBe('REFUSED')
  })

  it('refuses the file of a replaced issue, and a draft once released', async () => {
    session.roles = ['BIOANALISTA']
    const issued = store(false)
    const draft = store(true)
    expect((await readReportFile(ORDER, draft.id)).kind).toBe('REFUSED')
    replaceIssue(ORDER, printedLinesOf(ORDER))
    expect((await readReportFile(ORDER, issued.id)).kind).toBe('REFUSED')
  })

  it('answers 404 for another order, and 401 with no session or a locked station', async () => {
    const report = store(false)
    expect(await readReportFile('o-2', report.id)).toEqual({ kind: 'REFUSED', status: 404 })
    expect(await readReportFile(ORDER, null)).toEqual({ kind: 'REFUSED', status: 404 })
    session.locked = true
    expect(await readReportFile(ORDER, report.id)).toEqual({ kind: 'REFUSED', status: 401 })
    session.locked = false
    session.signedIn = false
    expect(await readReportFile(ORDER, report.id)).toEqual({ kind: 'REFUSED', status: 401 })
  })
})
