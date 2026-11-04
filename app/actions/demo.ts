'use server'

import { redirect } from 'next/navigation'
import { startSession } from '@/lib/server/session/start'
import { getAccount } from '@/lib/server/session/store'

/** Demo only. Removed with components/dev/DemoRoleSwitcher.tsx in a later stage. */
export async function switchDemoUser(formData: FormData): Promise<void> {
  const account = getAccount(String(formData.get('userId') ?? ''))
  if (!account) return
  await startSession(account, 'instalacion')
  redirect('/')
}
