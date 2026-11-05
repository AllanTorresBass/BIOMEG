import 'server-only'

import { createHash, randomBytes, randomInt, randomUUID, timingSafeEqual } from 'node:crypto'
import { PORTAL_SETTINGS } from '@/lib/config/portal'
import type { PortalSession } from '@/types/portal/portal.types'

interface Challenge {
  clientIds: string[]
  name: string
  salt: string
  hash: string
  expiresAt: number
  wrong: number
  spent: boolean
}

interface Failure {
  count: number
  pausedUntil: number
}

interface PortalState {
  challenges: Map<string, Challenge>
  sessions: Map<string, PortalSession>
  failures: Map<string, Failure>
}

const globalStore = globalThis as typeof globalThis & { __biomegPortal?: PortalState }
const state: PortalState = (globalStore.__biomegPortal ??= {
  challenges: new Map(),
  sessions: new Map(),
  failures: new Map(),
})

function digest(code: string, salt: string): string {
  return createHash('sha256').update(`${salt}:${code}`).digest('hex')
}

/** Failures are counted by the typed cédula, found or not, so a count never reveals whether it exists. */
export function failureKey(type: string, digits: string): string {
  return `${type.trim().toUpperCase()}-${digits.replace(/\D/g, '')}`
}

export function isPaused(key: string, now: number = Date.now()): boolean {
  const record = state.failures.get(key)
  return record !== undefined && record.pausedUntil > now
}

export function registerFailure(key: string, now: number = Date.now()): void {
  const record = state.failures.get(key) ?? { count: 0, pausedUntil: 0 }
  if (record.pausedUntil !== 0 && record.pausedUntil <= now) {
    record.count = 0
    record.pausedUntil = 0
  }
  record.count += 1
  if (record.count >= PORTAL_SETTINGS.maxFailedAttempts) {
    record.pausedUntil = now + PORTAL_SETTINGS.pauseMinutes * 60_000
  }
  state.failures.set(key, record)
}

export function clearFailures(key: string): void {
  state.failures.delete(key)
}

/** Opens a code for the clients that matched. The code is stored hashed and never read back. */
export function openChallenge(clientIds: string[], name: string, now: number = Date.now()): { challengeId: string; code: string } {
  const code = String(randomInt(0, 10 ** PORTAL_SETTINGS.codeLength)).padStart(PORTAL_SETTINGS.codeLength, '0')
  const salt = randomBytes(8).toString('hex')
  const challengeId = randomUUID()
  state.challenges.set(challengeId, {
    clientIds,
    name,
    salt,
    hash: digest(code, salt),
    expiresAt: now + PORTAL_SETTINGS.codeMinutes * 60_000,
    wrong: 0,
    spent: false,
  })
  return { challengeId, code }
}

export type ChallengeOutcome =
  | { kind: 'OK'; clientIds: string[]; name: string }
  | { kind: 'WRONG' | 'EXPIRED' | 'LOCKED' }

/** A code works once. After too many wrong tries, even the right code is refused. */
export function checkChallenge(challengeId: string, code: string, now: number = Date.now()): ChallengeOutcome {
  const challenge = state.challenges.get(challengeId)
  if (!challenge || challenge.spent || challenge.expiresAt <= now) return { kind: 'EXPIRED' }
  if (challenge.wrong >= PORTAL_SETTINGS.maxWrongCodes) return { kind: 'LOCKED' }

  const expected = Buffer.from(challenge.hash, 'hex')
  const actual = Buffer.from(digest(code.trim(), challenge.salt), 'hex')
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) {
    challenge.wrong += 1
    return { kind: 'WRONG' }
  }
  challenge.spent = true
  return { kind: 'OK', clientIds: challenge.clientIds, name: challenge.name }
}

export function startPortalSession(clientIds: string[], name: string, now: number = Date.now()): PortalSession {
  const session: PortalSession = { id: randomUUID(), clientIds, name, startedAt: now, lastSeenAt: now, ended: false }
  state.sessions.set(session.id, session)
  return session
}

/** A session ends after the idle limit or the absolute limit, whichever comes first. */
export function getPortalSession(id: string, now: number = Date.now()): PortalSession | null {
  const session = state.sessions.get(id)
  if (!session || session.ended) return null
  const idleMs = PORTAL_SETTINGS.idleMinutes * 60_000
  const absoluteMs = PORTAL_SETTINGS.sessionHours * 3_600_000
  if (now - session.lastSeenAt > idleMs || now - session.startedAt > absoluteMs) {
    session.ended = true
    return null
  }
  session.lastSeenAt = now
  return session
}

export function endPortalSession(id: string): void {
  const session = state.sessions.get(id)
  if (session) session.ended = true
}

/** Test and demo hooks. */
export function resetPortalStore(): void {
  state.challenges.clear()
  state.sessions.clear()
  state.failures.clear()
}
