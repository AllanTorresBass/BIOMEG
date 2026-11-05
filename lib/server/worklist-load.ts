import 'server-only'

import { decide } from '@/lib/auth/decide'
import { allOrders } from '@/lib/db/memory/order-index'
import { buildWorklist, toStatusOnly } from '@/lib/server/domain/worklist'
import { toDecisionSession } from '@/lib/server/session/current'
import type { StaffContext } from '@/types/session/session.types'
import type { WorklistView } from '@/types/orders/worklist.types'

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/

export function isWorklistDate(value: string): boolean {
  return DATE_PATTERN.test(value) && !Number.isNaN(new Date(`${value}T00:00:00Z`).getTime())
}

/**
 * The one place the worklist is read. The page and the refresh action both call it, so the
 * scope applies to every response and reception never receives a clinical flag.
 */
export function loadWorklist(context: StaffContext, date: string, reviewOnly: boolean): WorklistView {
  const decision = decide({ session: toDecisionSession(context), command: 'worklist.read' })
  if (!decision.allowed) return { allowed: false, canOpen: false, date, rows: [] }

  const statusOnly = decision.scope === 'status_only'
  const rows = buildWorklist(allOrders(), date, reviewOnly && !statusOnly)
  return {
    allowed: true,
    canOpen: !statusOnly,
    date,
    rows: statusOnly ? toStatusOnly(rows) : rows,
  }
}
