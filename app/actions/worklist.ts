'use server'

import { isWorklistDate, loadWorklist } from '@/lib/server/worklist-load'
import { getStaffContext } from '@/lib/server/session/current'
import type { WorklistView } from '@/types/orders/worklist.types'

/** Refresh for the open worklist. It re-reads through the same loader as the page. */
export async function fetchWorklist(date: string, reviewOnly: boolean): Promise<WorklistView | null> {
  const context = await getStaffContext()
  if (!context || context.locked || !isWorklistDate(date)) return null
  return loadWorklist(context, date, reviewOnly)
}
