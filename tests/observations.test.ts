import { afterEach, describe, expect, it, vi } from 'vitest'

const actor = vi.hoisted(() => ({
  userId: 'u-recepcion',
  displayName: 'Recepción Demo',
  roles: ['RECEPCION'] as string[],
}))

vi.mock('server-only', () => ({}))
vi.mock('next/headers', () => ({ headers: async () => new Headers() }))
vi.mock('next/cache', () => ({ revalidatePath: () => undefined }))
vi.mock('@/lib/server/session/current', () => ({
  getStaffContext: async () => actorContext(),
  toDecisionSession: (context: { locked: boolean; account: { id: string; roles: string[] } }) => ({
    valid: true,
    active: !context.locked,
    userId: context.account.id,
    roles: context.account.roles,
  }),
}))

import { listAudit, resetAuditForTests } from '@/lib/db/memory/audit-store'
import {
  clearObservationsForTests,
  createObservation as storeCreate,
  listObservationsByDate,
  resetObservationsForTests,
} from '@/lib/db/memory/observation-store'
import { createObservation, retractObservation } from '@/lib/server/commands/observations'
import { todayInLab } from '@/lib/server/domain/client-rules'
import { getObservationsScreen } from '@/lib/server/queries/observations'
import { strings } from '@/lib/strings'
import type { StaffRole } from '@/types/auth/auth.types'
import type { StaffContext } from '@/types/session/session.types'

function actorContext(): StaffContext {
  return {
    locked: false,
    account: {
      id: actor.userId,
      username: actor.userId,
      displayName: actor.displayName,
      roles: actor.roles as StaffRole[],
      mustChangePassword: false,
    },
    session: {
      id: 's-obs',
      userId: actor.userId,
      workstation: 'PC-1',
      startedAt: Date.now(),
      lastSeenAt: Date.now(),
      locked: false,
      ended: false,
      stepUpAt: null,
    },
  }
}

afterEach(() => {
  resetObservationsForTests()
  resetAuditForTests()
  actor.userId = 'u-recepcion'
  actor.displayName = 'Recepción Demo'
  actor.roles = ['RECEPCION']
})

describe('createObservation', () => {
  it('refuses empty text', async () => {
    clearObservationsForTests()
    const result = await createObservation({ date: todayInLab(), text: '   ' })
    expect(result.ok).toBe(false)
    expect(result.message).toBe(strings.observations.textRequired)
    expect(listObservationsByDate(todayInLab())).toHaveLength(0)
    expect(listAudit().some((row) => row.what.command === 'observation.create' && row.result.outcome === 'REFUSED')).toBe(true)
  })

  it('refuses overlong text', async () => {
    clearObservationsForTests()
    const result = await createObservation({ date: todayInLab(), text: 'x'.repeat(2001) })
    expect(result.ok).toBe(false)
    expect(result.message).toContain('2000')
  })

  it('stores a note and audits ALLOWED', async () => {
    clearObservationsForTests()
    const day = todayInLab()
    const result = await createObservation({ date: day, text: 'Cinta del impresor reemplazada.' })
    expect(result.ok).toBe(true)
    expect(result.observation?.preview).toBe('Cinta del impresor reemplazada.')
    expect(listObservationsByDate(day)).toHaveLength(1)
    expect(listAudit().some((row) => row.what.command === 'observation.create' && row.result.outcome === 'ALLOWED')).toBe(true)
  })

  it('lets bioanalista create', async () => {
    clearObservationsForTests()
    actor.userId = 'u-bioanalista'
    actor.displayName = 'Lcda. Demo'
    actor.roles = ['BIOANALISTA']
    const result = await createObservation({ date: todayInLab(), text: 'Nota del banco.' })
    expect(result.ok).toBe(true)
  })
})

describe('retractObservation', () => {
  it('lets the author retract the same day with confirm', async () => {
    clearObservationsForTests()
    const day = todayInLab()
    const created = await createObservation({ date: day, text: 'Temporal.' })
    expect(created.ok).toBe(true)
    const id = created.observation!.id
    const refused = await retractObservation({ id })
    expect(refused.ok).toBe(false)
    const done = await retractObservation({ id, confirmed: true })
    expect(done.ok).toBe(true)
    expect(listObservationsByDate(day)).toHaveLength(0)
    expect(listAudit().some((row) => row.what.command === 'observation.retract' && row.result.outcome === 'ALLOWED')).toBe(true)
  })

  it('refuses retract by another author', async () => {
    clearObservationsForTests()
    const day = todayInLab()
    storeCreate({
      date: day,
      text: 'De otro.',
      authorId: 'u-bioanalista',
      authorName: 'Lcda. Demo',
    })
    const listed = listObservationsByDate(day)
    const result = await retractObservation({ id: listed[0]!.id, confirmed: true })
    expect(result.ok).toBe(false)
    expect(result.message).toBe(strings.observations.retractNotAuthor)
  })

  it('refuses retract of a prior day', async () => {
    clearObservationsForTests()
    storeCreate({
      date: '2020-01-01',
      text: 'Antigua.',
      authorId: 'u-recepcion',
      authorName: 'Recepción Demo',
    })
    const listed = listObservationsByDate('2020-01-01')
    const result = await retractObservation({ id: listed[0]!.id, confirmed: true })
    expect(result.ok).toBe(false)
    expect(result.message).toBe(strings.observations.retractPriorDay)
  })
})

describe('getObservationsScreen', () => {
  it('lists ready rows for a permitted role', () => {
    resetObservationsForTests()
    const screen = getObservationsScreen(actorContext(), todayInLab())
    expect(screen.kind).toBe('READY')
    expect(screen.canUse).toBe(true)
    expect(screen.rows.length).toBeGreaterThanOrEqual(1)
  })
})
