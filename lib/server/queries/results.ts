import 'server-only'

import { decide } from '@/lib/auth/decide'
import { getStub } from '@/lib/db/memory/order-index'
import { demoSeed } from '@/lib/db/memory/seed'
import { resultOrderState } from '@/lib/domain/result-rules'
import { buildResultGrid } from '@/lib/server/domain/result-grid'
import { guardRoute, mayReach } from '@/lib/server/guard'
import { toDecisionSession } from '@/lib/server/session/current'
import type { StaffContext } from '@/types/session/session.types'

export async function getResultsScreen(context: StaffContext, id: string, section: string | undefined) {
  if (!(await guardRoute(context, ['result.read'], `/ordenes/${id}/resultados`))) return { kind: 'BLOCKED' } as const

  const stub = getStub(id)
  if (!stub || stub.voided) return { kind: 'MISSING' } as const

  const read = decide({
    session: toDecisionSession(context),
    command: 'result.read',
    facts: { state: resultOrderState(stub) },
    gestures: { confirmVerified: false, stepUpVerified: false },
  })
  if (!read.allowed) return { kind: 'BLOCKED' } as const

  return {
    kind: 'READY',
    view: buildResultGrid(stub, {
      canEnter: mayReach(context, ['result.enter']),
      isBioanalyst: context.account.roles.includes('BIOANALISTA'),
      section,
    }),
    sectionTitles: [...new Set(demoSeed.resultLines.map((line) => line.section))],
    lines: demoSeed.resultLines.map((line) => ({ id: line.id, name: line.name })),
  } as const
}
