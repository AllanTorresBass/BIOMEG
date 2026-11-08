import 'server-only'

import { cache } from 'react'
import { cookies } from 'next/headers'
import { SESSION_COOKIE, SESSION_SETTINGS } from '@/lib/config/session'
import { logger } from '@/lib/logger'
import { auditEvent } from '@/lib/server/audit'
import { getAccount, getSession, lockSession, touchSession } from '@/lib/server/session/accounts'
import type { DecisionSession } from '@/types/auth/auth.types'
import type { StaffContext } from '@/types/session/session.types'

/**
 * Reads the session from the cookie. The server owns the idle clock: a session
 * quiet for the limit locks here even when the browser timer never fired.
 */
export const getStaffContext = cache(async (): Promise<StaffContext | null> => {
  const jar = await cookies()
  const sessionId = jar.get(SESSION_COOKIE)?.value
  if (!sessionId) return null

  try {
    const session = await getSession(sessionId)
    if (!session) return null
    const account = await getAccount(session.userId)
    if (!account) return null

    const idleMs = SESSION_SETTINGS.idleLockMinutes * 60_000
    if (!session.locked && Date.now() - session.lastSeenAt > idleMs) {
      await lockSession(session)
      await auditEvent({ command: 'session.lock', outcome: 'ALLOWED', session, account, source: 'system' })
    }
    if (!session.locked) await touchSession(session)

    return { session, account, locked: session.locked }
  } catch (error) {
    logger.error('staff session could not be read', { error })
    return null
  }
})

export function toDecisionSession(context: StaffContext): DecisionSession {
  return {
    valid: true,
    active: !context.locked,
    userId: context.account.id,
    roles: context.account.roles,
  }
}
