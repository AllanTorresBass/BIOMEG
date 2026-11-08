import 'server-only'

import { headers } from 'next/headers'
import { databaseAuth, isDemoAccessOn } from '@/lib/server/settings'
import { strings } from '@/lib/strings'
import { logger } from '@/lib/logger'
import { auditEvent } from '@/lib/server/audit'
import { getStaffContext } from '@/lib/server/session/current'
import { adoptSession, startSession, leaveSession } from '@/lib/server/session/start'
import { lockSession, rotateStepUp, verifyCredentials } from '@/lib/server/session/accounts'
import { markStepUp, unlockSession } from '@/lib/server/session/store'
import type { SignInInput, StepUpInput } from '@/types/session/session.schemas'
import type { FormState } from '@/types/session/session.types'

async function clientAddress(): Promise<string> {
  const headerList = await headers()
  const forwarded = headerList.get('x-forwarded-for')?.split(',')[0]?.trim()
  const raw = forwarded || headerList.get('x-real-ip') || 'local'
  return raw.slice(0, 80) || 'local'
}

export async function signIn({ username, password }: SignInInput): Promise<FormState> {
  let result: 'OK' | 'FAILED' | 'PAUSED' = 'FAILED'
  let account = null as Awaited<ReturnType<typeof verifyCredentials>>['account']
  let flood = false
  try {
    const checked = await verifyCredentials(username, password, await clientAddress())
    result = checked.result
    account = checked.account
    flood = checked.flood
  } catch (error) {
    logger.error('staff sign-in could not read the account store', { error })
  }
  if (result !== 'OK' || !account || (!databaseAuth() && !isDemoAccessOn())) {
    await auditEvent({
      command: 'session.enter.failed',
      outcome: 'REFUSED',
      reason: 'SESSION',
      workstation: null,
      recordType: 'username',
      recordId: result === 'PAUSED' ? 'PAUSED' : flood ? 'FLOOD' : null,
    })
    return { error: strings.auth.signInFailed }
  }

  await startSession(account)
  return { error: null, redirectTo: account.mustChangePassword ? '/clave' : '/' }
}

export async function signOut(): Promise<{ redirectTo: string }> {
  const context = await getStaffContext()
  if (context) {
    await auditEvent({ command: 'session.leave', outcome: 'ALLOWED', session: context.session, account: context.account })
    await leaveSession(context.session.id)
  }
  return { redirectTo: '/entrar' }
}

export async function lockCurrentSession(): Promise<void> {
  const context = await getStaffContext()
  if (!context || context.locked) return
  await lockSession(context.session)
  await auditEvent({ command: 'session.lock', outcome: 'ALLOWED', session: context.session, account: context.account })
}

/** The one place a password re-entry is checked, for the idle lock and for every step-up gesture. */
export async function verifyStepUp({ password }: StepUpInput): Promise<{ ok: boolean; message?: string }> {
  const refused = { ok: false, message: strings.auth.verifyFailed }
  const context = await getStaffContext()
  if (!context) return refused

  const { session, account } = context
  const { result } = await verifyCredentials(account.username, password, await clientAddress())
  if (result !== 'OK') {
    await auditEvent({ command: 'step_up.failed', outcome: 'REFUSED', reason: 'STEP_UP', gesture: 'STEP_UP', session, account })
    return refused
  }

  if (databaseAuth()) {
    const next = await rotateStepUp(session.id)
    if (!next) return refused
    await adoptSession(next.id)
    const command = context.locked ? 'session.unlock' : 'step_up.verified'
    await auditEvent({ command, outcome: 'ALLOWED', gesture: 'STEP_UP', session: next, account })
    return { ok: true }
  }

  if (context.locked) {
    unlockSession(session)
    await auditEvent({ command: 'session.unlock', outcome: 'ALLOWED', gesture: 'STEP_UP', session, account })
  } else {
    markStepUp(session)
    await auditEvent({ command: 'step_up.verified', outcome: 'ALLOWED', gesture: 'STEP_UP', session, account })
  }
  return { ok: true }
}
