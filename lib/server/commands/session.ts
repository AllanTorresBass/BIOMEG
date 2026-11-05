import 'server-only'

import { isDemoAccessOn } from '@/lib/server/settings'
import { strings } from '@/lib/strings'
import { auditEvent } from '@/lib/server/audit'
import { getStaffContext } from '@/lib/server/session/current'
import { startSession, leaveSession } from '@/lib/server/session/start'
import { lockSession, markStepUp, unlockSession, verifyCredentials } from '@/lib/server/session/store'
import type { SignInInput, StepUpInput } from '@/types/session/session.schemas'
import type { FormState } from '@/types/session/session.types'

export async function signIn({ username, password }: SignInInput): Promise<FormState> {
  const { result, account } = verifyCredentials(username, password)
  if (result !== 'OK' || !account || !isDemoAccessOn()) {
    await auditEvent({
      command: 'session.enter.failed',
      outcome: 'REFUSED',
      reason: 'SESSION',
      workstation: null,
      recordType: 'username',
      recordId: result === 'PAUSED' ? 'PAUSED' : null,
    })
    return { error: strings.auth.signInFailed }
  }

  await startSession(account)
  return { error: null, redirectTo: '/' }
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
  lockSession(context.session)
  await auditEvent({ command: 'session.lock', outcome: 'ALLOWED', session: context.session, account: context.account })
}

/** The one place a password re-entry is checked, for the idle lock and for every step-up gesture. */
export async function verifyStepUp({ password }: StepUpInput): Promise<{ ok: boolean; message?: string }> {
  const refused = { ok: false, message: strings.auth.verifyFailed }
  const context = await getStaffContext()
  if (!context) return refused

  const { session, account } = context
  const { result } = verifyCredentials(account.username, password)
  if (result !== 'OK') {
    await auditEvent({ command: 'step_up.failed', outcome: 'REFUSED', reason: 'STEP_UP', gesture: 'STEP_UP', session, account })
    return refused
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
