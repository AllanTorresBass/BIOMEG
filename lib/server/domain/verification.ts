import 'server-only'

import { createHash } from 'node:crypto'
import { decide } from '@/lib/auth/decide'
import { VERIFICATION_SETTINGS } from '@/lib/config/verification'
import { consultCodeMatches, issueByToken } from '@/lib/db/memory/issue-store'
import { getStub } from '@/lib/db/memory/order-index'
import { findReport } from '@/lib/db/memory/report-store'
import { reportDateOf } from '@/lib/db/memory/result-store'
import { isCodePaused, registerWrongCode, takeRequest } from '@/lib/db/memory/verification-store'
import { auditEvent, requestAddress } from '@/lib/server/audit'
import { buildReport } from '@/lib/server/domain/report'
import { requestOrigin } from '@/lib/server/origin'
import { renderReportPdf } from '@/lib/server/pdf/report-pdf'
import { isValueCheckOn } from '@/lib/server/settings'
import { strings } from '@/lib/strings'
import { formatDate } from '@/lib/utils/format'
import type { DecisionSession } from '@/types/auth/auth.types'
import type { OrderStub } from '@/types/domain/order-stub.types'
import type { IssueRecord } from '@/types/orders/issue.types'
import type { VerificationFile, VerificationView } from '@/types/verification/verification.types'
import type { RefusalDetail } from '@/types/domain/verification.types'

const PUBLIC_SESSION: DecisionSession = { valid: true, active: true, userId: 'publico', roles: ['PUBLICO'] }
const UNAVAILABLE: VerificationView = { kind: 'NO_DISPONIBLE' }
const DAY_MS = 86_400_000

function publicState(stub: OrderStub): string {
  if (stub.correctionOpen) return 'EN_CORRECCION'
  if (stub.released) return 'LIBERADO'
  return stub.hasResult ? 'INCOMPLETO' : 'ABIERTA'
}

function tokenPrefix(token: string): string {
  return createHash('sha256').update(token).digest('hex').slice(0, 12)
}

/** A token is known only through a non-voided order. A voided order answers like an unknown token. */
function findTarget(token: string): { issue: IssueRecord; stub: OrderStub } | null {
  const issue = issueByToken(token)
  const stub = issue ? getStub(issue.orderId) : null
  return issue && stub && !stub.voided ? { issue, stub } : null
}

async function withinRequestLimit(): Promise<boolean> {
  return takeRequest((await requestAddress()) ?? 'desconocida')
}

/** The token is logged only as a hash prefix, as the audit log page requires. */
function auditRefusal({ command, token, reason, state, rowId }: RefusalDetail) {
  return auditEvent({
    command,
    outcome: 'REFUSED',
    reason,
    channel: 'verify',
    recordType: 'verify_token',
    recordId: tokenPrefix(token),
    state,
    rowId: rowId ?? null,
  })
}

/** The whole public answer for one scan. The view carries only what the page may show. */
export async function readVerification(token: string): Promise<VerificationView> {
  if (!(await withinRequestLimit())) {
    await auditRefusal({ command: 'verify.read', token, reason: 'STATE', state: 'RATE_LIMITED' })
    return UNAVAILABLE
  }
  const target = findTarget(token)
  if (!target) {
    await auditRefusal({ command: 'verify.read', token, reason: 'OWNERSHIP', state: null })
    return UNAVAILABLE
  }

  const { issue, stub } = target
  const state = publicState(stub)
  const decision = decide({
    session: PUBLIC_SESSION,
    command: 'verify.read',
    facts: { state },
    record: { tokenMatches: true },
  })
  if (!decision.allowed) {
    await auditRefusal({ command: 'verify.read', token, reason: decision.reason, state, rowId: decision.rowId })
    return UNAVAILABLE
  }

  await auditEvent({
    command: 'verify.read',
    outcome: 'ALLOWED',
    channel: 'verify',
    recordType: 'issue',
    recordId: issue.id,
    state,
    rowId: decision.rowId,
  })

  const orderNumber = stub.number ?? stub.id
  const labName = strings.brand.name
  if (issue.status === 'REEMPLAZADO') {
    return {
      kind: 'REEMPLAZADO',
      orderNumber,
      labName,
      reportDateText: formatDate(issue.createdAt),
      replacedDateText: formatDate(issue.replacedAt),
    }
  }
  return {
    kind: 'ESTADO',
    orderNumber,
    labName,
    reportDateText: formatDate(reportDateOf(stub.id) ?? issue.createdAt),
    state: state as 'LIBERADO' | 'INCOMPLETO' | 'EN_CORRECCION',
    valueCheck: isValueCheckOn() && state === 'LIBERADO',
  }
}

function originalPdf(stub: OrderStub, issue: IssueRecord, origin: string | null): Buffer | null {
  const stored = findReport(stub.id, 'PACIENTE', null, issue.id)
  if (stored) return stored.pdf
  const built = buildReport({ stub, mode: 'PACIENTE', lineId: null, origin })
  return built.kind === 'READY' ? renderReportPdf(built.document) : null
}

/** R-149. Every refusal looks the same to the caller, and a pause never stops the state page. */
export async function openOriginalReport(token: string, code: string, now: number = Date.now()): Promise<VerificationFile | null> {
  const command = 'verify.file.read'
  if (!(await withinRequestLimit())) {
    await auditRefusal({ command, token, reason: 'STATE', state: 'RATE_LIMITED' })
    return null
  }
  const target = findTarget(token)
  if (!target) {
    await auditRefusal({ command, token, reason: 'OWNERSHIP', state: null })
    return null
  }

  const { issue, stub } = target
  const state = publicState(stub)
  const enabled = isValueCheckOn()
  if (enabled && isCodePaused(issue.tokenHash, now)) {
    await auditRefusal({ command, token, reason: 'STATE', state: 'PAUSED' })
    return null
  }

  const codeMatches = enabled && consultCodeMatches(issue, code)
  if (enabled && !codeMatches) registerWrongCode(issue.tokenHash, now)

  const decision = decide({
    session: PUBLIC_SESSION,
    command,
    facts: {
      value_check_enabled: enabled,
      state,
      issue_current: issue.status === 'VIGENTE',
      printed_code_matches: codeMatches,
      within_value_check_period: now - Date.parse(issue.createdAt) <= VERIFICATION_SETTINGS.valueCheckDays * DAY_MS,
    },
    record: { tokenMatches: true },
  })
  const pdf = decision.allowed ? originalPdf(stub, issue, await requestOrigin()) : null
  if (!pdf) {
    await auditRefusal({ command, token, reason: decision.allowed ? 'STATE' : decision.reason, state, rowId: decision.rowId })
    return null
  }

  await auditEvent({
    command,
    outcome: 'ALLOWED',
    channel: 'verify',
    recordType: 'issue',
    recordId: issue.id,
    state,
    rowId: decision.rowId,
  })
  return { pdf, name: `informe-${stub.number ?? stub.id}.pdf` }
}
