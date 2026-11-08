import 'server-only'

import { randomBytes } from 'node:crypto'
import { query, withTransaction } from '@/lib/db/client'
import { SESSION_SETTINGS } from '@/lib/config/session'
import { todayInLab } from '@/lib/server/domain/client-rules'
import { hashPassword, passwordMatches } from '@/lib/server/session/passwords'
import { toAppRoles, toDbRole } from '@/lib/server/session/roles'
import type { StaffRole } from '@/types/auth/auth.types'
import type { StaffDirectoryRow } from '@/types/server/store.types'
import type { PublicAccount, SignInResult, StaffSession, PasswordChangeResult } from '@/types/session/session.types'

const USER_COLUMNS = `
  u.id,
  u.username,
  u.display_name,
  u.password_hash,
  u.license_number,
  u.active,
  u.must_change_password,
  u.password_expires_at,
  COALESCE(array_agg(DISTINCT ur.role_id) FILTER (WHERE ur.role_id IS NOT NULL), '{}') AS roles,
  COALESCE(array_agg(DISTINCT tg.role_id) FILTER (WHERE tg.role_id IS NOT NULL AND tg.role_id <> 'bioanalista'), '{}') AS cover_roles,
  to_char(MAX(tg.ends_at) AT TIME ZONE 'America/Caracas', 'YYYY-MM-DD') AS cover_until
`

interface UserRow {
  id: string
  username: string
  display_name: string
  password_hash: string | null
  license_number: string | null
  active: boolean
  must_change_password: boolean
  password_expires_at: Date | null
  roles: string[]
  cover_roles: string[]
  cover_until: string | null
}

interface SessionRow {
  id: string
  user_id: string
  workstation: string | null
  created_at: Date
  last_seen_at: Date
  expires_at: Date
  locked_at: Date | null
  step_up_until: Date | null
}

function toPublic(row: UserRow): PublicAccount {
  const roles = toAppRoles(row.roles)
  for (const role of toAppRoles(row.cover_roles)) {
    if (role !== 'BIOANALISTA' && !roles.includes(role)) roles.push(role)
  }
  return {
    id: row.id,
    username: row.username,
    displayName: row.display_name,
    roles,
    mustChangePassword: row.must_change_password,
  }
}

function toDirectory(row: UserRow): StaffDirectoryRow {
  const account = toPublic(row)
  const covered = row.cover_until !== null && row.cover_until >= todayInLab()
  return {
    id: account.id,
    username: account.username,
    displayName: account.displayName,
    roles: toAppRoles(row.roles),
    active: row.active,
    coverRoles: covered ? toAppRoles(row.cover_roles) : [],
    coverUntil: covered ? row.cover_until : null,
    licensePresent: row.license_number !== null && row.license_number !== '',
  }
}

function toSession(row: SessionRow): StaffSession {
  const freshMs = SESSION_SETTINGS.stepUpFreshSeconds * 1000
  return {
    id: row.id,
    userId: row.user_id,
    workstation: row.workstation ?? '',
    startedAt: new Date(row.created_at).getTime(),
    lastSeenAt: new Date(row.last_seen_at).getTime(),
    locked: row.locked_at !== null,
    ended: false,
    stepUpAt: row.step_up_until ? new Date(row.step_up_until).getTime() - freshMs : null,
  }
}

async function userByUsername(username: string): Promise<UserRow | null> {
  const found = await query<UserRow>(
    `SELECT ${USER_COLUMNS}
     FROM users u
     LEFT JOIN user_roles ur ON ur.user_id = u.id
     LEFT JOIN temporary_grants tg ON tg.user_id = u.id AND tg.ends_at >= now()
     WHERE lower(u.username) = $1
     GROUP BY u.id`,
    [username],
  )
  return found.rows[0] ?? null
}

async function userById(userId: string): Promise<UserRow | null> {
  const found = await query<UserRow>(
    `SELECT ${USER_COLUMNS}
     FROM users u
     LEFT JOIN user_roles ur ON ur.user_id = u.id
     LEFT JOIN temporary_grants tg ON tg.user_id = u.id AND tg.ends_at >= now()
     WHERE u.id = $1
     GROUP BY u.id`,
    [userId],
  )
  return found.rows[0] ?? null
}

async function failureState(username: string, address: string): Promise<{ paused: boolean; flood: boolean }> {
  const found = await query<{ recent: number; hour_count: number }>(
    `SELECT
       count(*) FILTER (WHERE address = $2 AND failed_at > now() - make_interval(mins => $3))::int AS recent,
       count(*)::int AS hour_count
     FROM staff_sign_in_failures
     WHERE username_key = $1 AND failed_at > now() - interval '1 hour'`,
    [username, address, SESSION_SETTINGS.pauseMinutes],
  )
  const row = found.rows[0]
  return {
    paused: (row?.recent ?? 0) >= SESSION_SETTINGS.maxFailedAttempts,
    flood: (row?.hour_count ?? 0) >= 20,
  }
}

async function recordFailure(username: string, address: string): Promise<void> {
  await query(
    `INSERT INTO staff_sign_in_failures (username_key, address, failed_at)
     VALUES ($1, $2, clock_timestamp())
     ON CONFLICT DO NOTHING`,
    [username, address],
  )
  await query(`DELETE FROM staff_sign_in_failures WHERE failed_at < now() - interval '2 hours'`)
}

export async function verifyCredentials(
  username: string,
  password: string,
  address: string,
): Promise<{ result: SignInResult; account: PublicAccount | null; flood: boolean }> {
  const key = username.trim().toLowerCase()
  const where = address.slice(0, 80) || 'local'
  const before = await failureState(key, where)
  if (before.paused) {
    await passwordMatches(null, password)
    return { result: 'PAUSED', account: null, flood: before.flood }
  }

  const row = await userByUsername(key)
  const expired = row?.password_expires_at != null && row.password_expires_at.getTime() <= Date.now()
  const matches = await passwordMatches(row?.password_hash ?? null, password)
  if (row && row.active && !expired && matches) {
    await query(`DELETE FROM staff_sign_in_failures WHERE username_key = $1 AND address = $2`, [key, where])
    return { result: 'OK', account: toPublic(row), flood: false }
  }

  await recordFailure(key, where)
  const after = await failureState(key, where)
  return { result: 'FAILED', account: null, flood: after.flood }
}

export async function getAccount(userId: string): Promise<PublicAccount | null> {
  const row = await userById(userId)
  if (!row?.active) return null
  return toPublic(row)
}

export async function listAccounts(): Promise<PublicAccount[]> {
  const found = await query<UserRow>(
    `SELECT ${USER_COLUMNS}
     FROM users u
     LEFT JOIN user_roles ur ON ur.user_id = u.id
     LEFT JOIN temporary_grants tg ON tg.user_id = u.id AND tg.ends_at >= now()
     WHERE u.active
     GROUP BY u.id
     ORDER BY u.display_name`,
  )
  return found.rows.map(toPublic)
}

export async function listStaffDirectory(): Promise<StaffDirectoryRow[]> {
  const found = await query<UserRow>(
    `SELECT ${USER_COLUMNS}
     FROM users u
     LEFT JOIN user_roles ur ON ur.user_id = u.id
     LEFT JOIN temporary_grants tg ON tg.user_id = u.id AND tg.ends_at >= now()
     GROUP BY u.id
     ORDER BY u.display_name`,
  )
  return found.rows.map(toDirectory)
}

export async function activeAdminCount(): Promise<number> {
  const found = await query<{ n: number }>(
    `SELECT count(DISTINCT u.id)::int AS n
     FROM users u
     JOIN user_roles ur ON ur.user_id = u.id
     WHERE u.active AND ur.role_id = 'administracion'`,
  )
  return found.rows[0]?.n ?? 0
}

export async function createSession(userId: string, workstation: string): Promise<{ session: StaffSession; replaced: StaffSession[] }> {
  return withTransaction(async (client) => {
    const closed = await client.query<SessionRow>(
      `UPDATE staff_sessions
       SET ended_at = now()
       WHERE workstation = $1 AND ended_at IS NULL
       RETURNING id, user_id, workstation, created_at, last_seen_at, expires_at, locked_at, step_up_until`,
      [workstation],
    )
    const opened = await client.query<SessionRow>(
      `INSERT INTO staff_sessions (user_id, workstation, expires_at)
       VALUES ($1, $2, now() + make_interval(hours => $3))
       RETURNING id, user_id, workstation, created_at, last_seen_at, expires_at, locked_at, step_up_until`,
      [userId, workstation, SESSION_SETTINGS.maxSessionHours],
    )
    const session = opened.rows[0]
    if (!session) throw new Error('session was not stored')
    return { session: toSession(session), replaced: closed.rows.map(toSession) }
  })
}

export async function getSession(sessionId: string): Promise<StaffSession | null> {
  const found = await query<SessionRow>(
    `SELECT id, user_id, workstation, created_at, last_seen_at, expires_at, locked_at, step_up_until
     FROM staff_sessions
     WHERE id = $1 AND ended_at IS NULL AND expires_at > now()`,
    [sessionId],
  )
  const row = found.rows[0]
  return row ? toSession(row) : null
}

export async function endSession(sessionId: string): Promise<void> {
  await query(`UPDATE staff_sessions SET ended_at = now() WHERE id = $1 AND ended_at IS NULL`, [sessionId])
}

export async function endUserSessions(userId: string): Promise<void> {
  await query(`UPDATE staff_sessions SET ended_at = now() WHERE user_id = $1 AND ended_at IS NULL`, [userId])
}

export async function touchSession(sessionId: string): Promise<void> {
  await query(
    `UPDATE staff_sessions SET last_seen_at = now() WHERE id = $1 AND ended_at IS NULL AND locked_at IS NULL`,
    [sessionId],
  )
}

export async function lockSession(sessionId: string): Promise<void> {
  await query(
    `UPDATE staff_sessions SET locked_at = COALESCE(locked_at, now()) WHERE id = $1 AND ended_at IS NULL`,
    [sessionId],
  )
}

/** Ends the current session and opens a new id that already holds a fresh step-up. */
export async function rotateStepUp(sessionId: string): Promise<StaffSession | null> {
  return withTransaction(async (client) => {
    const opened = await client.query<SessionRow>(
      `WITH closed AS (
         UPDATE staff_sessions
         SET ended_at = now()
         WHERE id = $1 AND ended_at IS NULL
         RETURNING user_id, workstation, expires_at
       )
       INSERT INTO staff_sessions (user_id, workstation, expires_at, last_seen_at, step_up_until)
       SELECT user_id, workstation, expires_at, now(), now() + make_interval(secs => $2)
       FROM closed
       RETURNING id, user_id, workstation, created_at, last_seen_at, expires_at, locked_at, step_up_until`,
      [sessionId, SESSION_SETTINGS.stepUpFreshSeconds],
    )
    const row = opened.rows[0]
    return row ? toSession(row) : null
  })
}

export async function changePassword(userId: string, current: string, next: string): Promise<PasswordChangeResult> {
  const found = await query<{ password_hash: string | null }>(`SELECT password_hash FROM users WHERE id = $1 AND active`, [userId])
  const encoded = found.rows[0]?.password_hash ?? null
  if (!(await passwordMatches(encoded, current))) return 'WRONG_CURRENT'
  if (next.length < SESSION_SETTINGS.minPasswordLength) return 'TOO_SHORT'
  if (next === current) return 'SAME'
  await query(
    `UPDATE users
     SET password_hash = $2, must_change_password = false, password_expires_at = null, updated_at = now()
     WHERE id = $1`,
    [userId, await hashPassword(next)],
  )
  return 'OK'
}

async function usernameTaken(username: string): Promise<boolean> {
  const found = await query(`SELECT 1 FROM users WHERE lower(username) = $1`, [username])
  return (found.rowCount ?? 0) > 0
}

async function uniqueUsername(displayName: string): Promise<string> {
  const base =
    displayName
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '')
      .slice(0, 24) || 'usuario'
  let username = base
  let n = 2
  while (await usernameTaken(username)) {
    username = `${base}${n}`
    n += 1
  }
  return username
}

function temporaryPassword(): string {
  return randomBytes(18).toString('base64url')
}

export async function createStaffAccount(
  displayName: string,
  roles: readonly StaffRole[],
): Promise<{ id: string; temporaryPassword: string } | null> {
  const name = displayName.trim().slice(0, 80)
  if (name === '' || roles.length === 0 || roles.includes('BIOANALISTA')) return null
  const password = temporaryPassword()
  const username = await uniqueUsername(name)
  const id = await withTransaction(async (client) => {
    const inserted = await client.query<{ id: string }>(
      `INSERT INTO users (username, display_name, password_hash, must_change_password, password_expires_at)
       VALUES ($1, $2, $3, true, now() + interval '24 hours')
       RETURNING id`,
      [username, name, await hashPassword(password)],
    )
    const userId = inserted.rows[0]?.id
    if (!userId) throw new Error('user was not stored')
    for (const role of roles) {
      await client.query(`INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2)`, [userId, toDbRole(role)])
    }
    return userId
  })
  return { id, temporaryPassword: password }
}

export async function setStaffActive(userId: string, active: boolean): Promise<boolean> {
  const updated = await query(`UPDATE users SET active = $2, updated_at = now() WHERE id = $1`, [userId, active])
  if ((updated.rowCount ?? 0) === 0) return false
  if (!active) await endUserSessions(userId)
  return true
}

export async function replaceStaffRoles(userId: string, roles: readonly StaffRole[]): Promise<boolean> {
  if (roles.length === 0 || roles.includes('BIOANALISTA')) return false
  const exists = await query(`SELECT 1 FROM users WHERE id = $1`, [userId])
  if ((exists.rowCount ?? 0) === 0) return false
  await withTransaction(async (client) => {
    await client.query(`DELETE FROM user_roles WHERE user_id = $1`, [userId])
    for (const role of roles) {
      await client.query(`INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2)`, [userId, toDbRole(role)])
    }
  })
  return true
}

export async function setStaffCover(userId: string, roles: readonly StaffRole[], until: string): Promise<boolean> {
  if (roles.includes('BIOANALISTA') || !/^\d{4}-\d{2}-\d{2}$/.test(until)) return false
  const exists = await query(`SELECT 1 FROM users WHERE id = $1`, [userId])
  if ((exists.rowCount ?? 0) === 0) return false
  await withTransaction(async (client) => {
    await client.query(`DELETE FROM temporary_grants WHERE user_id = $1`, [userId])
    for (const role of roles) {
      await client.query(
        `INSERT INTO temporary_grants (user_id, role_id, ends_at)
         VALUES ($1, $2, (($3::date + time '23:59:59') AT TIME ZONE 'America/Caracas'))`,
        [userId, toDbRole(role), until],
      )
    }
  })
  return true
}

export async function grantStaffBioanalista(userId: string, license: string): Promise<boolean> {
  const value = license.trim().slice(0, 40)
  if (value === '') return false
  const updated = await query(
    `UPDATE users SET license_number = $2, updated_at = now() WHERE id = $1`,
    [userId, value],
  )
  if ((updated.rowCount ?? 0) === 0) return false
  await query(
    `INSERT INTO user_roles (user_id, role_id) VALUES ($1, 'bioanalista') ON CONFLICT DO NOTHING`,
    [userId],
  )
  return true
}

export async function resetStaffPassword(userId: string): Promise<string | null> {
  const exists = await query(`SELECT 1 FROM users WHERE id = $1`, [userId])
  if ((exists.rowCount ?? 0) === 0) return null
  const password = temporaryPassword()
  await query(
    `UPDATE users
     SET password_hash = $2, must_change_password = true, password_expires_at = now() + interval '24 hours', updated_at = now()
     WHERE id = $1`,
    [userId, await hashPassword(password)],
  )
  await endUserSessions(userId)
  return password
}
