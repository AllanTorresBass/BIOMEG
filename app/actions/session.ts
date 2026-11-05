'use server'

import { redirect } from 'next/navigation'
import { strings } from '@/lib/strings'
import { auditEvent } from '@/lib/server/audit'
import { getStaffContext } from '@/lib/server/session/current'
import { startSession, leaveSession } from '@/lib/server/session/start'
import { lockSession, verifyCredentials } from '@/lib/server/session/store'
import type { FormState } from '@/types/session/session.types'

export async function signIn(_previous: FormState, formData: FormData): Promise<FormState> {
  const username = String(formData.get('username') ?? '')
  const password = String(formData.get('password') ?? '')

  const { result, account } = verifyCredentials(username, password)
  if (result !== 'OK' || !account) {
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
  redirect('/')
}

export async function signOut(): Promise<void> {
  const context = await getStaffContext()
  if (context) {
    await auditEvent({ command: 'session.leave', outcome: 'ALLOWED', session: context.session, account: context.account })
    await leaveSession(context.session.id)
  }
  redirect('/entrar')
}

export async function lockCurrentSession(): Promise<void> {
  const context = await getStaffContext()
  if (!context || context.locked) return
  lockSession(context.session)
  await auditEvent({ command: 'session.lock', outcome: 'ALLOWED', session: context.session, account: context.account })
}
