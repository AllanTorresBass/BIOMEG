import 'server-only'

import { strings } from '@/lib/strings'
import { SESSION_SETTINGS } from '@/lib/config/session'
import { auditEvent } from '@/lib/server/audit'
import { getStaffContext } from '@/lib/server/session/current'
import { changePassword } from '@/lib/server/session/store'
import type { ChangePasswordInput } from '@/types/session/session.schemas'
import type { FormState } from '@/types/session/session.types'

/** For the signed-in user only. The audit row never holds either password. */
export async function changeOwnPassword({ current, next }: ChangePasswordInput): Promise<FormState> {
  const context = await getStaffContext()
  if (!context || context.locked) return { error: strings.auth.passwordFailed }

  const result = changePassword(context.account.id, current, next)

  if (result !== 'OK') {
    await auditEvent({
      command: 'password.change',
      outcome: 'REFUSED',
      reason: 'STATE',
      session: context.session,
      account: context.account,
    })
    if (result === 'TOO_SHORT') return { error: strings.auth.passwordTooShort(SESSION_SETTINGS.minPasswordLength) }
    if (result === 'SAME') return { error: strings.auth.passwordSame }
    return { error: strings.auth.passwordFailed }
  }

  await auditEvent({ command: 'password.change', outcome: 'ALLOWED', session: context.session, account: context.account })
  return { error: null, done: true }
}
