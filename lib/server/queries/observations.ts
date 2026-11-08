import 'server-only'

import { decide } from '@/lib/auth/decide'
import { listObservationsByDate } from '@/lib/db/memory/observation-store'
import { toObservationRow } from '@/lib/server/commands/observations'
import { todayInLab } from '@/lib/server/domain/client-rules'
import { toDecisionSession } from '@/lib/server/session/current'
import type { ObservationsScreen } from '@/types/observations/observation.types'
import type { StaffContext } from '@/types/session/session.types'

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/

export function isObservationDate(value: string): boolean {
  return DATE_PATTERN.test(value) && !Number.isNaN(new Date(`${value}T00:00:00Z`).getTime())
}

export function getObservationsScreen(context: StaffContext, date: string): ObservationsScreen {
  const decision = decide({ session: toDecisionSession(context), command: 'observation.use' })
  if (!decision.allowed) {
    return { kind: 'BLOCKED', date, canUse: false, currentUserId: context.account.id, rows: [] }
  }
  const day = isObservationDate(date) ? date : todayInLab()
  const today = todayInLab()
  const rows = listObservationsByDate(day).map((row) => toObservationRow(row, context.account.id, today))
  return {
    kind: 'READY',
    date: day,
    canUse: true,
    currentUserId: context.account.id,
    rows,
  }
}
