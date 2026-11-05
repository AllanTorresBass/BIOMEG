import 'server-only'

import { revalidatePath } from 'next/cache'
import { getStub } from '@/lib/db/memory/order-index'
import { replaceIssue, vigenteIssueOf, printedLinesOf } from '@/lib/db/memory/issue-store'
import { saveReport } from '@/lib/db/memory/report-store'
import { resultOrderState } from '@/lib/domain/result-rules'
import { auditEvent } from '@/lib/server/audit'
import { gate, gated, record } from '@/lib/server/draft-gate'
import { buildReport, reportKindOf } from '@/lib/server/domain/report'
import { requestOrigin } from '@/lib/server/origin'
import { renderReportPdf } from '@/lib/server/pdf/report-pdf'
import { getStaffContext } from '@/lib/server/session/current'
import { strings } from '@/lib/strings'
import type { ReportActionResult, ReportMode } from '@/types/orders/report.types'

const text = strings.report

function refuse(message: string): ReportActionResult {
  return { ok: false, message }
}

/** Makes the PDF of an order. An issued PDF is kept as first made; a draft replaces the earlier draft. */
export async function generateReportPdf(input: {
  orderId: string
  mode: ReportMode
  lineId?: string | null
}): Promise<ReportActionResult> {
  const context = await getStaffContext()
  if (!context || context.locked) return refuse(text.notAllowed)
  const stub = getStub(input.orderId)
  if (!stub || stub.voided) return refuse(text.notAllowed)

  const kind = reportKindOf(stub)
  if (kind === 'EMPTY') return refuse(text.empty)
  if (kind === 'EN_REVISION') return refuse(text.inReview)

  const mode: ReportMode = input.mode === 'PRUEBA' ? 'PRUEBA' : 'PACIENTE'
  const lineId = mode === 'PRUEBA' ? (input.lineId ?? null) : null
  if (mode === 'PRUEBA' && !lineId) return refuse(text.empty)

  const state = kind === 'ISSUED' ? 'LIBERADO' : 'INCOMPLETO'
  const target = { recordType: 'order', recordId: stub.id, state: resultOrderState(stub) }
  const opened = { context }
  const allowed = await gate(opened, 'pdf.generate', { state }, {}, target)
  if (gated(allowed)) return refuse(kind === 'DRAFT' ? text.draftRefused : text.notAllowed)

  try {
    if (kind === 'ISSUED' && !vigenteIssueOf(stub.id)) {
      const { issue } = replaceIssue(stub.id, printedLinesOf(stub.id))
      await auditEvent({
        command: 'report.issue',
        outcome: 'ALLOWED',
        session: context.session,
        account: context.account,
        ...target,
        rowId: allowed.rowId,
        change: { before: null, after: issue.id, field: 'issue' },
      })
    }

    const built = buildReport({ stub, mode, lineId, origin: await requestOrigin() })
    if (built.kind !== 'READY') return refuse(text.empty)
    if (built.stored && !built.document.draft) {
      return { ok: true, message: text.pdfExisting, reportId: built.stored.id }
    }

    const pdf = renderReportPdf(built.document)
    const stored = saveReport({
      orderId: stub.id,
      mode,
      lineId,
      issueId: built.document.draft ? null : built.document.issueId,
      draft: built.document.draft,
      byName: context.account.displayName,
      document: built.document,
      pdf,
    })
    await record(opened, 'report.pdf', allowed.rowId, { before: null, after: stored.id, field: 'pdf' }, undefined, target)
    revalidatePath(`/ordenes/${stub.id}/reporte`)
    return { ok: true, message: built.document.draft ? text.pdfDraftDone : text.pdfDone, reportId: stored.id }
  } catch {
    return refuse(text.pdfFailed)
  }
}
