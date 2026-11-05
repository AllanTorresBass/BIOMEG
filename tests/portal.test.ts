import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('server-only', () => ({}))

import { PORTAL_SETTINGS } from '@/lib/config/portal'
import { getStub, updateStub } from '@/lib/db/memory/order-index'
import {
  checkChallenge,
  endPortalSession,
  failureKey,
  getPortalSession,
  isPaused,
  openChallenge,
  registerFailure,
  resetPortalStore,
  startPortalSession,
} from '@/lib/db/memory/portal-store'
import { demoSeed } from '@/lib/db/memory/seed'
import {
  hasAnyOrder,
  matchClients,
  phoneFor,
  portalFileOf,
  visitFor,
  visitsOf,
} from '@/lib/server/domain/portal'
import type { ClientRecord } from '@/types/domain/client.types'

const MINUTE = 60_000

function releasedStub() {
  const stub = getStub('o-1')
  if (!stub) throw new Error('demo order missing')
  return stub
}

function ownerOf(clientId: string) {
  const owner = demoSeed.clients.find((client) => client.id === clientId)
  if (!owner?.cedulaType || !owner.cedulaDigits || !owner.birthDate) throw new Error('demo client incomplete')
  return { id: owner.id, cedulaType: owner.cedulaType, cedulaDigits: owner.cedulaDigits, birthDate: owner.birthDate }
}

beforeEach(() => resetPortalStore())
afterEach(() => resetPortalStore())

describe('portal sign-in match', () => {
  it('matches only when the cédula and the birth date both agree', () => {
    const owner = ownerOf(releasedStub().clientId)
    expect(matchClients(owner.cedulaType, owner.cedulaDigits, owner.birthDate).map((c) => c.id)).toContain(owner.id)
    expect(matchClients(owner.cedulaType, owner.cedulaDigits, '1900-01-01')).toEqual([])
    expect(matchClients(owner.cedulaType === 'V' ? 'E' : 'V', owner.cedulaDigits, owner.birthDate)).toEqual([])
    expect(matchClients(owner.cedulaType, '', owner.birthDate)).toEqual([])
  })
})

describe('portal contact', () => {
  const base = { phone: null, email: null } as unknown as ClientRecord

  it('returns nothing when the client has no phone on file', () => {
    expect(phoneFor([base])).toBeNull()
  })

  it('never falls back to email', () => {
    expect(phoneFor([{ ...base, email: 'paciente@example.com' } as ClientRecord])).toBeNull()
    expect(phoneFor([{ ...base, phone: '04141234567', email: 'paciente@example.com' } as ClientRecord])).toBe('04141234567')
  })

  it('needs at least one order', () => {
    expect(hasAnyOrder([{ ...base, id: 'sin-ordenes' } as ClientRecord])).toBe(false)
    expect(hasAnyOrder([{ ...base, id: getStub('o-1')!.clientId } as ClientRecord])).toBe(true)
  })
})

describe('failed attempts', () => {
  it('pauses a cédula after too many failures and lifts the pause with time', () => {
    const key = failureKey('V', '12.000.001')
    const start = 1_000_000
    for (let i = 0; i < PORTAL_SETTINGS.maxFailedAttempts - 1; i += 1) registerFailure(key, start)
    expect(isPaused(key, start)).toBe(false)
    registerFailure(key, start)
    expect(isPaused(key, start)).toBe(true)
    expect(isPaused(key, start + (PORTAL_SETTINGS.pauseMinutes + 1) * MINUTE)).toBe(false)
  })

  it('counts a cédula that does not exist the same way as one that does', () => {
    expect(failureKey('v', '99.999.999')).toBe(failureKey('V', '99999999'))
  })

  it('keeps no digits in the key and depends on the secret', () => {
    const key = failureKey('V', '99999999')
    expect(key).not.toContain('99999999')
    vi.stubEnv('PORTAL_HASH_SECRET', 'otro-secreto-de-prueba')
    expect(failureKey('V', '99999999')).not.toBe(key)
    vi.unstubAllEnvs()
  })
})

describe('sign-in code', () => {
  it('works once', () => {
    const { challengeId, code } = openChallenge(['c-1'], 'Paciente')
    expect(code).toMatch(/^\d{6}$/)
    expect(checkChallenge(challengeId, code)).toEqual({ kind: 'OK', clientIds: ['c-1'], name: 'Paciente' })
    expect(checkChallenge(challengeId, code).kind).toBe('EXPIRED')
  })

  it('refuses a wrong code and then locks after too many tries, even for the right one', () => {
    const { challengeId, code } = openChallenge(['c-1'], 'Paciente')
    const wrong = code === '000000' ? '000001' : '000000'
    for (let i = 0; i < PORTAL_SETTINGS.maxWrongCodes; i += 1) {
      expect(checkChallenge(challengeId, wrong).kind).toBe('WRONG')
    }
    expect(checkChallenge(challengeId, code).kind).toBe('LOCKED')
  })

  it('expires', () => {
    const now = 5_000_000
    const { challengeId, code } = openChallenge(['c-1'], 'Paciente', now)
    expect(checkChallenge(challengeId, code, now + (PORTAL_SETTINGS.codeMinutes + 1) * MINUTE).kind).toBe('EXPIRED')
  })

  it('does not know an id it never issued', () => {
    expect(checkChallenge('nope', '123456').kind).toBe('EXPIRED')
  })
})

describe('portal session', () => {
  it('ends when left, when idle, and at the absolute limit', () => {
    const now = 9_000_000
    const left = startPortalSession(['c-1'], 'Paciente', now)
    expect(getPortalSession(left.id, now + MINUTE)).not.toBeNull()
    endPortalSession(left.id)
    expect(getPortalSession(left.id, now + 2 * MINUTE)).toBeNull()

    const idle = startPortalSession(['c-1'], 'Paciente', now)
    expect(getPortalSession(idle.id, now + (PORTAL_SETTINGS.idleMinutes + 1) * MINUTE)).toBeNull()

    const long = startPortalSession(['c-1'], 'Paciente', now)
    let at = now
    while (at - now <= PORTAL_SETTINGS.sessionHours * 3_600_000) {
      at += 10 * MINUTE
      getPortalSession(long.id, at)
    }
    expect(getPortalSession(long.id, at)).toBeNull()
  })
})

describe('portal visits', () => {
  it('shows a released visit with its sections and a download', () => {
    const stub = releasedStub()
    const visit = visitsOf([stub.clientId]).find((candidate) => candidate.orderId === stub.id)
    expect(visit?.state).toBe('LIBERADO')
    expect(visit?.canDownload).toBe(true)
    expect(visit?.sections.length).toBeGreaterThan(0)
  })

  it('does not show a visit to a client it does not belong to', () => {
    const stub = releasedStub()
    const stranger = demoSeed.clients.find((client) => client.id !== stub.clientId)!
    expect(visitFor([stranger.id], stub.id)).toBeNull()
    expect(visitFor([stub.clientId], stub.id)).not.toBeNull()
  })

  it('serves a PDF for a released visit', () => {
    const file = portalFileOf(releasedStub())
    expect(file?.pdf.subarray(0, 4).toString('latin1')).toBe('%PDF')
    expect(file?.name).toMatch(/^informe-.+\.pdf$/)
    expect(file?.name).not.toContain('parcial')
  })

  it('holds back results while a correction is open', () => {
    const stub = releasedStub()
    const original = { correctionOpen: stub.correctionOpen }
    updateStub(stub.id, { correctionOpen: true })
    try {
      const visit = visitsOf([stub.clientId]).find((candidate) => candidate.orderId === stub.id)
      expect(visit?.state).toBe('EN_REVISION')
      expect(visit?.sections).toEqual([])
      expect(visit?.canDownload).toBe(false)
      expect(portalFileOf(getStub(stub.id)!)).toBeNull()
    } finally {
      updateStub(stub.id, original)
    }
  })
})
