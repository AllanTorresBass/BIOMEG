import 'server-only'

import { decide } from '@/lib/auth/decide'
import { vigenteIssueOf } from '@/lib/db/memory/issue-store'
import { getStub } from '@/lib/db/memory/order-index'
import { getReport } from '@/lib/db/memory/report-store'
import { resultsOf } from '@/lib/db/memory/result-store'
import { demoSeed } from '@/lib/db/memory/seed'
import { resultOrderState } from '@/lib/domain/result-rules'
import { auditEvent } from '@/lib/server/audit'
import { buildDeliveryView, deliveryStateOf } from '@/lib/server/domain/delivery'
import { buildReport } from '@/lib/server/domain/report'
import { guardRoute } from '@/lib/server/guard'
import { requestOrigin } from '@/lib/server/origin'
import { getStaffContext, toDecisionSession } from '@/lib/server/session/current'
import type { ReportMode } from '@/types/orders/report.types'
import type { StoredReport } from '@/types/stores/report-store.types'
import type { Guarded, ReportFileAnswer, ReportScreen } from '@/types/queries/screens.types'
import type { OrderStub } from '@/types/domain/order-stub.types'
import type { StaffContext } from '@/types/session/session.types'

export async function getReportScreen(context: StaffContext, id: string, prueba: string | undefined): Promise<Guarded<ReportScreen>> {
  const mode: ReportMode = prueba ? 'PRUEBA' : 'PACIENTE'
  const command = mode === 'PRUEBA' ? 'report.print.single' : 'report.print.patient'
  if (!(await guardRoute(context, [command], `/ordenes/${id}/reporte`))) return { kind: 'BLOCKED' }

  const stub = getStub(id)
  if (!stub || stub.voided) return { kind: 'MISSING' }

  const session = toDecisionSession(context)
  const read = decide({
    session,
    command,
    facts: { state: resultOrderState(stub) },
    gestures: { confirmVerified: false, stepUpVerified: false },
  })
  if (!read.allowed) return { kind: 'BLOCKED' }

  const lineId = mode === 'PRUEBA' ? (prueba ?? null) : null
  const report = buildReport({ stub, mode, lineId, origin: await requestOrigin() })
  const names = new Map(demoSeed.resultLines.map((line) => [line.id, line.name]))
  const choices = resultsOf(stub.id)
    .filter((cell) => cell.value.trim() !== '')
    .map((cell) => ({ lineId: cell.lineId, name: names.get(cell.lineId) ?? cell.lineId }))

  const deliveryState = deliveryStateOf(stub)
  const gestures = { confirmVerified: true, stepUpVerified: true }
  const deliveryView =
    mode === 'PACIENTE' && deliveryState
      ? buildDeliveryView(stub, {
          send: decide({
            session,
            command: 'delivery.send',
            facts: { state: deliveryState, delivery_mode_allowed: true, incomplete_approved: true },
            gestures,
          }).allowed,
          approve: decide({ session, command: 'delivery.approve_incomplete', facts: { state: deliveryState }, gestures }).allowed,
        })
      : null

  return { kind: 'READY', stub, mode, lineId, report, choices, deliveryView }
}

/** A kept file may no longer be readable: the order was voided, reopened, released since, or the issue replaced. */
function isStillCurrent(stub: OrderStub, report: StoredReport): boolean {
  if (stub.voided || stub.correctionOpen) return false
  if (report.draft) return !stub.released
  return report.issueId !== null && vigenteIssueOf(stub.id)?.id === report.issueId
}

/** R-051 by state, on every download. A role that may print something may not read every stored file. */
export async function readReportFile(orderId: string, reportId: string | null): Promise<ReportFileAnswer> {
  const context = await getStaffContext()
  if (!context || context.locked) return { kind: 'REFUSED', status: 401 }

  const report = reportId ? getReport(reportId) : null
  const stub = getStub(orderId)
  if (!report || !stub || report.orderId !== orderId) return { kind: 'REFUSED', status: 404 }

  const decision = decide({
    session: toDecisionSession(context),
    command: report.mode === 'PRUEBA' ? 'report.print.single' : 'report.print.patient',
    facts: { state: resultOrderState(stub) },
    gestures: { confirmVerified: false, stepUpVerified: false },
  })
  if (!decision.allowed || !isStillCurrent(stub, report)) {
    await auditEvent({
      command: 'access.denied',
      outcome: 'REFUSED',
      reason: decision.allowed ? 'STATE' : decision.reason,
      session: context.session,
      account: context.account,
      recordType: 'report',
      recordId: report.id,
      state: resultOrderState(stub),
      rowId: decision.rowId,
    })
    return { kind: 'REFUSED', status: decision.allowed ? 404 : 403 }
  }

  const name = `reporte-${report.document.patient.orden}${report.draft ? '-borrador' : ''}.pdf`
  return { kind: 'FILE', file: { pdf: report.pdf, name } }
}
