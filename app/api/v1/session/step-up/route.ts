import { NextResponse } from 'next/server'
import { auditEvent } from '@/lib/server/audit'
import { getStaffContext } from '@/lib/server/session/current'
import { markStepUp, unlockSession, verifyCredentials } from '@/lib/server/session/store'

const REFUSED_MESSAGE = 'No se pudo verificar.'

/** The one place a password re-entry is checked, for the idle lock and for every step-up gesture. */
export async function POST(request: Request) {
  if (!request.headers.get('content-type')?.includes('application/json')) {
    return NextResponse.json({ ok: false, message: REFUSED_MESSAGE }, { status: 415 })
  }

  const context = await getStaffContext()
  if (!context) return NextResponse.json({ ok: false, message: REFUSED_MESSAGE }, { status: 401 })

  const body = (await request.json().catch(() => null)) as { password?: unknown } | null
  const password = typeof body?.password === 'string' ? body.password : ''
  const { session, account } = context

  const { result } = verifyCredentials(account.username, password)
  if (result !== 'OK') {
    await auditEvent({
      command: 'step_up.failed',
      outcome: 'REFUSED',
      reason: 'STEP_UP',
      gesture: 'STEP_UP',
      session,
      account,
    })
    return NextResponse.json(
      { ok: false, message: REFUSED_MESSAGE },
      { status: result === 'PAUSED' ? 429 : 401 },
    )
  }

  if (context.locked) {
    unlockSession(session)
    await auditEvent({ command: 'session.unlock', outcome: 'ALLOWED', gesture: 'STEP_UP', session, account })
  } else {
    markStepUp(session)
    await auditEvent({ command: 'step_up.verified', outcome: 'ALLOWED', gesture: 'STEP_UP', session, account })
  }
  return NextResponse.json({ ok: true })
}
