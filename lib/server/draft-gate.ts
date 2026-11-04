import 'server-only'

import { revalidatePath } from 'next/cache'
import { decide } from '@/lib/auth/decide'
import { getClient } from '@/lib/db/memory/client-store'
import { getDraft } from '@/lib/db/memory/draft-store'
import { auditEvent } from '@/lib/server/audit'
import { getStaffContext, toDecisionSession } from '@/lib/server/session/current'
import { isStepUpFresh } from '@/lib/server/session/store'
import { strings } from '@/lib/strings'
import type { DraftNeed, DraftResult, OrderDraft } from '@/types/orders/draft.types'
import type { RefusalReason } from '@/types/auth/auth.types'
import type { StaffContext } from '@/types/session/session.types'

const text = strings.pendingReview.orders

export const ROUTE = '/ordenes/nueva'

export function fail(message: string, need: DraftNeed | null = null): DraftResult {
  return { ok: false, message, need }
}

export function done(message: string): DraftResult {
  return { ok: true, message, need: null }
}

export interface Opened {
  context: StaffContext
  draft: OrderDraft
}

export async function open(draftId: string): Promise<Opened | DraftResult> {
  const context = await getStaffContext()
  if (!context || context.locked) return fail(text.notAllowed)
  const draft = getDraft(draftId, context.account.id)
  if (!draft) return fail(text.draftMissing)
  return { context, draft }
}

export function isResult(value: Opened | DraftResult): value is DraftResult {
  return 'need' in value
}

export interface Presented {
  confirmed?: boolean
  motivo?: string
}

export interface Target {
  recordType: string
  recordId: string
  state: string
}

/** What the gate helpers need. Order actions have no draft, so they always pass a target. */
export interface Subject {
  context: StaffContext
  draft?: OrderDraft
}

function targetOf(draft: OrderDraft | undefined, target?: Target): Target {
  if (target) return target
  if (!draft) throw new Error('A target is required when there is no draft.')
  return { recordType: 'order_draft', recordId: draft.id, state: draft.state }
}

/** Asks the permission table. A refusal is audited, and a missing confirm or motivo comes back as a need. */
export async function gate(
  { context, draft }: Subject,
  command: string,
  facts: Record<string, boolean | string>,
  presented: Presented = {},
  target?: Target,
): Promise<{ rowId: string | null } | DraftResult> {
  const decision = decide({
    session: toDecisionSession(context),
    command,
    facts,
    gestures: {
      confirmVerified: presented.confirmed === true,
      stepUpVerified: isStepUpFresh(context.session),
      motivo: presented.motivo,
    },
  })
  if (decision.allowed) return { rowId: decision.rowId }
  await auditEvent({
    command,
    outcome: 'REFUSED',
    reason: decision.reason,
    session: context.session,
    account: context.account,
    ...targetOf(draft, target),
    rowId: decision.rowId,
  })
  if (decision.reason === 'CONFIRM') return fail('', 'CONFIRM_OVERRIDE')
  if (decision.reason === 'STEP_UP') return fail('', 'STEP_UP')
  if (decision.reason === 'MOTIVO_REQUIRED') return fail(strings.auth.motivoRequired, 'MOTIVO')
  return fail(text.notAllowed)
}

export function gated(value: { rowId: string | null } | DraftResult): value is DraftResult {
  return 'need' in value
}

export async function record(
  opened: Subject,
  command: string,
  rowId: string | null,
  change: { before: unknown; after: unknown; field?: string } | null,
  motivo?: string,
  target?: Target,
): Promise<void> {
  await auditEvent({
    command,
    outcome: 'ALLOWED',
    session: opened.context.session,
    account: opened.context.account,
    ...targetOf(opened.draft, target),
    rowId,
    motivo: motivo?.trim() || null,
    change,
  })
}

/** A refusal that is not a permission one, such as a second save on an order that already exists. */
export async function recordRefusal(opened: Subject, command: string, reason: RefusalReason, target?: Target): Promise<void> {
  await auditEvent({
    command,
    outcome: 'REFUSED',
    reason,
    session: opened.context.session,
    account: opened.context.account,
    ...targetOf(opened.draft, target),
    rowId: null,
  })
}

export function refresh(): void {
  revalidatePath(ROUTE)
}

export function activeClient(clientId: string | null) {
  const client = clientId ? getClient(clientId) : null
  return client && client.active ? client : null
}
