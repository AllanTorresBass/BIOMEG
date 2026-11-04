import 'server-only'

import { roleMayReachCommand } from '@/lib/auth/decide'
import { auditEvent } from '@/lib/server/audit'
import type { StaffContext } from '@/types/session/session.types'

/** True when any of the person's roles may reach one of the commands. Used for menus and routes. */
export function mayReach(context: StaffContext, commands: readonly string[]): boolean {
  return commands.some((command) => roleMayReachCommand(context.account.roles, command))
}

/** Route guard. A refusal writes access.denied and the caller renders BLOQUEADO with no values. */
export async function guardRoute(context: StaffContext, commands: readonly string[], route: string): Promise<boolean> {
  if (!context.locked && mayReach(context, commands)) return true
  await auditEvent({
    command: 'access.denied',
    outcome: 'REFUSED',
    reason: 'ROLE',
    session: context.session,
    account: context.account,
    recordType: 'route',
    recordId: route,
  })
  return false
}
