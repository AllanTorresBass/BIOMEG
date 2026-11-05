import 'server-only'

import { createResendTask, restoreDeliveries, snapshotDeliveries } from '@/lib/db/memory/delivery-store'
import { issueByToken, issuesOf, printedLinesOf, replaceIssue, restoreIssues, snapshotIssues, vigenteIssueOf } from '@/lib/db/memory/issue-store'
import { getStub, updateStub } from '@/lib/db/memory/order-index'
import { cancelSectionCorrection, closeSectionCorrection, hasOpenCorrection, openSectionCorrection, restoreResults, snapshotResults } from '@/lib/db/memory/result-store'
import type { OpenCorrectionOutcome } from '@/types/stores/result-store.types'
import type { ReportSurface } from '@/types/orders/issue.types'
import type { SectionCorrection } from '@/types/orders/result.types'
import type { FinishOutcome } from '@/types/stores/correction-store.types'

/** A fully released order shows EN_CORRECCION while any of its sections is reopened. */
function syncOrderFlag(orderId: string): void {
  const stub = getStub(orderId)
  if (!stub) return
  const open = stub.released && hasOpenCorrection(orderId)
  if (Boolean(stub.correctionOpen) !== open) updateStub(orderId, { correctionOpen: open })
}

export function startCorrection(
  orderId: string,
  section: string,
  motivo: string,
  byId: string,
  byName: string,
): OpenCorrectionOutcome {
  const outcome = openSectionCorrection(orderId, section, motivo, byId, byName)
  if (outcome.kind === 'opened') syncOrderFlag(orderId)
  return outcome
}

export function abandonCorrection(orderId: string, section: string): SectionCorrection | null {
  const correction = cancelSectionCorrection(orderId, section)
  if (correction) syncOrderFlag(orderId)
  return correction
}

/**
 * Releases the corrected section, replaces the current issue and queues the resend as one unit.
 * If any step throws, every store goes back to what it held before and nothing is left half done.
 */
export function finishCorrection(
  orderId: string,
  section: string,
  byId: string,
  byName: string,
  beforeCommit?: () => void,
): FinishOutcome {
  const results = snapshotResults()
  const issues = snapshotIssues()
  const deliveries = snapshotDeliveries()
  const flag = Boolean(getStub(orderId)?.correctionOpen)
  try {
    const correction = closeSectionCorrection(orderId, section, byId, byName)
    if (!correction) return { kind: 'none' }
    const { issue, replaced } = replaceIssue(orderId, printedLinesOf(orderId))
    const resendTask = replaced ? createResendTask(orderId, replaced.id, issue.id) : null
    beforeCommit?.()
    syncOrderFlag(orderId)
    return { kind: 'released', correction, issue, replaced, resendTask }
  } catch {
    restoreResults(results)
    restoreIssues(issues)
    restoreDeliveries(deliveries)
    if (getStub(orderId)) updateStub(orderId, { correctionOpen: flag })
    return { kind: 'failed' }
  }
}

/** Nothing goes out while a correction is open, so the old values cannot reach anyone again. */
export function canDeliver(orderId: string): boolean {
  return !hasOpenCorrection(orderId)
}

/** What the portal, the report and a QR check show for an order. */
export function reportSurfaceOf(orderId: string): ReportSurface {
  if (hasOpenCorrection(orderId)) return { kind: 'EN_REVISION' }
  const issue = vigenteIssueOf(orderId)
  return issue ? { kind: 'VIGENTE', issue } : { kind: 'DESCONOCIDO' }
}

/** A scanned token. A replaced token says so and points to the current issue, and an open correction hides values. */
export function surfaceOfToken(token: string): ReportSurface {
  const issue = issueByToken(token)
  if (!issue) return { kind: 'DESCONOCIDO' }
  if (issue.status === 'REEMPLAZADO') {
    const current = issuesOf(issue.orderId).find((entry) => entry.status === 'VIGENTE') ?? null
    return { kind: 'REEMPLAZADO', issue, current }
  }
  if (hasOpenCorrection(issue.orderId)) return { kind: 'EN_REVISION' }
  return { kind: 'VIGENTE', issue }
}
