import 'server-only'

import { startSession } from '@/lib/server/session/start'
import { isDemoAccessOn } from '@/lib/server/settings'
import { getAccount } from '@/lib/server/session/accounts'
import type { DemoSwitchInput } from '@/types/session/session.schemas'

/** Demo only. Removed with components/dev/DemoRoleSwitcher.tsx in a later stage. */
export async function switchDemoUser({ userId }: DemoSwitchInput): Promise<{ ok: boolean; redirectTo?: string }> {
  if (!isDemoAccessOn()) return { ok: false }
  const account = await getAccount(userId)
  if (!account) return { ok: false }
  await startSession(account, 'instalacion')
  return { ok: true, redirectTo: '/' }
}
