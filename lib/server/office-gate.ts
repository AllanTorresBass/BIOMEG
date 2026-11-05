import 'server-only'

import { revalidatePath } from 'next/cache'
import { gate, gated } from '@/lib/server/draft-gate'
import { getStaffContext } from '@/lib/server/session/current'
import { strings } from '@/lib/strings'
import type { DraftResult } from '@/types/orders/draft.types'
import type { OfficeNeed, OfficeResult } from '@/types/office/office.types'
import type { Presented, Target } from '@/types/server/draft-gate.types'
import type { StaffContext } from '@/types/session/session.types'

const text = strings.pendingReview.office

function asNeed(need: DraftResult['need']): OfficeNeed {
  if (need === 'STEP_UP' || need === 'MOTIVO' || need === 'CONFIRM_OVERRIDE') return need
  return null
}

export function officeFail(message: string, need: OfficeNeed = null): OfficeResult {
  return { ok: false, message, need }
}

export function officeDone(message: string): OfficeResult {
  return { ok: true, message, need: null }
}

export async function officeContext(): Promise<StaffContext | null> {
  const context = await getStaffContext()
  if (!context || context.locked) return null
  return context
}

export async function officeAllow(
  context: StaffContext,
  command: string,
  facts: Record<string, boolean | string>,
  presented: Presented,
  target: Target,
): Promise<{ rowId: string | null } | OfficeResult> {
  const allowed = await gate({ context }, command, facts, presented, target)
  if (gated(allowed)) return officeFail(allowed.message || text.notAllowed, asNeed(allowed.need))
  return allowed
}

export function refreshShell(): void {
  revalidatePath('/', 'layout')
}
