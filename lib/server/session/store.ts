import 'server-only'

import { randomBytes, randomUUID, scryptSync, timingSafeEqual } from 'node:crypto'
import { SESSION_SETTINGS } from '@/lib/config/session'
import { demoSeed } from '@/lib/db/memory/seed'
import type { StaffRole } from '@/types/auth/auth.types'
import type { SessionState, StoredAccount } from '@/types/server/store.types'
import type {
  PasswordChangeResult,
  PublicAccount,
  SignInResult,
  StaffSession,
} from '@/types/session/session.types'

/** Demo only. Every invented account uses it, and the sign-in page says so. */
export const DEMO_PASSWORD = 'Demo-2026-Lab'

const KEY_LENGTH = 32

function hashPassword(password: string, salt: string): string {
  return scryptSync(password, salt, KEY_LENGTH).toString('hex')
}

function buildAccount(
  id: string,
  username: string,
  displayName: string,
  roles: StaffRole[],
): StoredAccount {
  const salt = randomBytes(16).toString('hex')
  return {
    id,
    username,
    displayName,
    roles,
    mustChangePassword: false,
    salt,
    hash: hashPassword(DEMO_PASSWORD, salt),
  }
}

function buildState(): SessionState {
  const accounts = new Map<string, StoredAccount>()
  for (const staff of demoSeed.staff) {
    accounts.set(staff.id, buildAccount(staff.id, staff.id.replace(/^u-/, ''), staff.displayName, [staff.role]))
  }
  accounts.set(
    'u-mixto',
    buildAccount('u-mixto', 'mixto', 'Persona Demo (Recepción y Auxiliar)', ['RECEPCION', 'AUXILIAR']),
  )
  return { accounts, sessions: new Map(), failures: new Map() }
}

const globalStore = globalThis as typeof globalThis & { __biomegSessionState?: SessionState }

function state(): SessionState {
  if (!globalStore.__biomegSessionState) globalStore.__biomegSessionState = buildState()
  return globalStore.__biomegSessionState
}

function toPublic(account: StoredAccount): PublicAccount {
  return {
    id: account.id,
    username: account.username,
    displayName: account.displayName,
    roles: [...account.roles],
    mustChangePassword: account.mustChangePassword,
  }
}

function matches(account: StoredAccount, password: string): boolean {
  const expected = Buffer.from(account.hash, 'hex')
  const actual = Buffer.from(hashPassword(password, account.salt), 'hex')
  return expected.length === actual.length && timingSafeEqual(expected, actual)
}

function accountByUsername(username: string): StoredAccount | null {
  const wanted = username.trim().toLowerCase()
  for (const account of state().accounts.values()) {
    if (account.username === wanted) return account
  }
  return null
}

export function getAccount(userId: string): PublicAccount | null {
  const account = state().accounts.get(userId)
  return account ? toPublic(account) : null
}

export function listDemoAccounts(): PublicAccount[] {
  return [...state().accounts.values()].map(toPublic)
}

/**
 * Checks a password and counts failures by username, known or not, so the answer
 * never says which field was wrong. After the limit, a pause refuses even a right password.
 */
export function verifyCredentials(username: string, password: string): { result: SignInResult; account: PublicAccount | null } {
  const key = username.trim().toLowerCase()
  const now = Date.now()
  const { failures } = state()
  const record = failures.get(key) ?? { count: 0, pausedUntil: 0 }

  if (record.pausedUntil > now) return { result: 'PAUSED', account: null }
  if (record.pausedUntil !== 0) {
    record.count = 0
    record.pausedUntil = 0
  }

  const account = accountByUsername(key)
  const valid = account ? matches(account, password) : false
  if (account && valid) {
    failures.delete(key)
    return { result: 'OK', account: toPublic(account) }
  }

  record.count += 1
  if (record.count >= SESSION_SETTINGS.maxFailedAttempts) {
    record.pausedUntil = now + SESSION_SETTINGS.pauseMinutes * 60_000
  }
  failures.set(key, record)
  return { result: 'FAILED', account: null }
}

/** Starting a session on a workstation ends every other session there, so nothing carries over. */
export function createSession(userId: string, workstation: string): { session: StaffSession; replaced: StaffSession[] } {
  const { sessions } = state()
  const replaced: StaffSession[] = []
  for (const existing of sessions.values()) {
    if (!existing.ended && existing.workstation === workstation) {
      existing.ended = true
      replaced.push(existing)
    }
  }
  const now = Date.now()
  const session: StaffSession = {
    id: randomUUID(),
    userId,
    workstation,
    startedAt: now,
    lastSeenAt: now,
    locked: false,
    ended: false,
    stepUpAt: null,
  }
  sessions.set(session.id, session)
  return { session, replaced }
}

export function getSession(sessionId: string): StaffSession | null {
  const session = state().sessions.get(sessionId)
  return session && !session.ended ? session : null
}

export function endSession(sessionId: string): void {
  const session = state().sessions.get(sessionId)
  if (session) session.ended = true
}

export function touchSession(session: StaffSession): void {
  session.lastSeenAt = Date.now()
}

export function lockSession(session: StaffSession): void {
  session.locked = true
}

export function unlockSession(session: StaffSession): void {
  session.locked = false
  session.lastSeenAt = Date.now()
}

export function markStepUp(session: StaffSession): void {
  session.stepUpAt = Date.now()
}

export function isStepUpFresh(session: StaffSession): boolean {
  return session.stepUpAt !== null && Date.now() - session.stepUpAt <= SESSION_SETTINGS.stepUpFreshSeconds * 1000
}

export function changePassword(userId: string, current: string, next: string): PasswordChangeResult {
  const account = state().accounts.get(userId)
  if (!account || !matches(account, current)) return 'WRONG_CURRENT'
  if (next.length < SESSION_SETTINGS.minPasswordLength) return 'TOO_SHORT'
  if (next === current) return 'SAME'
  account.salt = randomBytes(16).toString('hex')
  account.hash = hashPassword(next, account.salt)
  account.mustChangePassword = false
  return 'OK'
}

/** Looks up a role list afresh on every request, so a removed role takes effect at once. */
export function setRolesForDemo(userId: string, roles: StaffRole[]): void {
  const account = state().accounts.get(userId)
  if (account) account.roles = roles
}
