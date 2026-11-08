import 'server-only'

import { randomBytes } from 'node:crypto'
import { cookies } from 'next/headers'
import { SESSION_COOKIE, SESSION_SETTINGS, WORKSTATION_COOKIE } from '@/lib/config/session'
import { auditEvent } from '@/lib/server/audit'
import { createSession, endSession } from '@/lib/server/session/accounts'
import type { PublicAccount } from '@/types/session/session.types'

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365
const SESSION_SECONDS = SESSION_SETTINGS.maxSessionHours * 60 * 60

/** The v0 preview runs in a frame, where a lax cookie is not sent. A deployed site is top level. */
function cookieOptions(maxAge?: number) {
  const production = process.env.NODE_ENV === 'production'
  return {
    httpOnly: true,
    secure: true,
    sameSite: production ? ('lax' as const) : ('none' as const),
    path: '/',
    ...(maxAge ? { maxAge } : {}),
  }
}

/** Ends whatever session the browser holds, then opens one for the account. */
export async function startSession(account: PublicAccount, source: 'ui' | 'instalacion' = 'ui'): Promise<void> {
  const jar = await cookies()
  const workstation = jar.get(WORKSTATION_COOKIE)?.value ?? `PC-${randomBytes(2).toString('hex').toUpperCase()}`
  jar.set(WORKSTATION_COOKIE, workstation, cookieOptions(ONE_YEAR_SECONDS))

  const { session, replaced } = await createSession(account.id, workstation)
  for (const previous of replaced) {
    await auditEvent({
      command: 'session.leave',
      outcome: 'ALLOWED',
      session: previous,
      account: null,
      source: 'system',
      state: 'REPLACED_ON_WORKSTATION',
    })
  }
  jar.set(SESSION_COOKIE, session.id, cookieOptions(SESSION_SECONDS))
  await auditEvent({ command: 'session.enter', outcome: 'ALLOWED', session, account, source })
}

export async function leaveSession(sessionId: string): Promise<void> {
  await endSession(sessionId)
  const jar = await cookies()
  jar.delete(SESSION_COOKIE)
}

/** Points the browser at a session that replaced the previous one, such as after a step-up. */
export async function adoptSession(sessionId: string): Promise<void> {
  const jar = await cookies()
  jar.set(SESSION_COOKIE, sessionId, cookieOptions(SESSION_SECONDS))
}
