import 'server-only'

import { redirect } from 'next/navigation'
import { getStaffContext } from '@/lib/server/session/current'
import type { StaffContext } from '@/types/session/session.types'

/** Pages that need a signed-in person. No session sends them to the sign-in screen. */
export async function requireStaff(): Promise<StaffContext> {
  const context = await getStaffContext()
  if (!context) redirect('/entrar')
  return context
}

/** Same, and a person who must replace the first password is sent to do that first. */
export async function requireReadyStaff(): Promise<StaffContext> {
  const context = await requireStaff()
  if (context.account.mustChangePassword) redirect('/clave')
  return context
}
