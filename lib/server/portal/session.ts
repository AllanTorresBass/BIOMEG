import 'server-only'

import { cache } from 'react'
import { cookies } from 'next/headers'
import { PORTAL_CHALLENGE_COOKIE, PORTAL_COOKIE, PORTAL_SETTINGS } from '@/lib/config/portal'
import { endPortalSession, getPortalSession, startPortalSession } from '@/lib/db/memory/portal-store'
import type { PortalSession } from '@/types/portal/portal.types'

/** The v0 preview runs in a frame, where a lax cookie is not sent. A deployed site is top level. */
function cookieOptions(maxAgeSeconds?: number) {
  const production = process.env.NODE_ENV === 'production'
  return {
    httpOnly: true,
    secure: true,
    sameSite: production ? ('lax' as const) : ('none' as const),
    path: '/',
    ...(maxAgeSeconds ? { maxAge: maxAgeSeconds } : {}),
  }
}

/** The portal session of this browser, or null. It never reads the staff cookie. */
export const getPortalContext = cache(async (): Promise<PortalSession | null> => {
  const jar = await cookies()
  const id = jar.get(PORTAL_COOKIE)?.value
  return id ? getPortalSession(id) : null
})

export async function rememberChallenge(challengeId: string): Promise<void> {
  const jar = await cookies()
  jar.set(PORTAL_CHALLENGE_COOKIE, challengeId, cookieOptions(PORTAL_SETTINGS.codeMinutes * 60))
}

export async function pendingChallenge(): Promise<string | null> {
  const jar = await cookies()
  return jar.get(PORTAL_CHALLENGE_COOKIE)?.value ?? null
}

export async function enterPortal(clientIds: string[], name: string): Promise<PortalSession> {
  const jar = await cookies()
  const session = startPortalSession(clientIds, name)
  jar.set(PORTAL_COOKIE, session.id, cookieOptions(PORTAL_SETTINGS.sessionHours * 3600))
  jar.delete(PORTAL_CHALLENGE_COOKIE)
  return session
}

export async function leavePortalSession(): Promise<PortalSession | null> {
  const jar = await cookies()
  const id = jar.get(PORTAL_COOKIE)?.value
  const session = id ? getPortalSession(id) : null
  if (id) endPortalSession(id)
  jar.delete(PORTAL_COOKIE)
  jar.delete(PORTAL_CHALLENGE_COOKIE)
  return session
}
