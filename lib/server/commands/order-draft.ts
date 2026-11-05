import 'server-only'

import type { DraftIdInput, GoToStepInput, RemoveDraftLineInput, SelectClientInput } from '@/types/orders/orders.schemas'
import { discardDraft, nextLineId } from '@/lib/db/memory/draft-store'
import { allOrders } from '@/lib/db/memory/order-index'
import { demoSeed } from '@/lib/db/memory/seed'
import { COST_TYPES, PRICE_COLUMNS, SAVED_PRICE_PAIRS } from '@/lib/config/price-defaults'
import { parseBirthDate, todayInLab } from '@/lib/server/domain/client-rules'
import { needsColumnOverride, repeatedExamIds } from '@/lib/server/domain/order-draft-rules'
import { priceFor, pricingBasis } from '@/lib/domain/pricing'
import { strings } from '@/lib/strings'
import { activeClient, done, fail, gate, gated, isResult, open, record, refresh } from '@/lib/server/draft-gate'
import type { AddLineInput, BillingInput, DraftResult, VisitInput } from '@/types/orders/draft.types'

const text = strings.pendingReview.orders

export async function selectClient({ draftId, clientId }: SelectClientInput): Promise<DraftResult> {
  const opened = await open(draftId)
  if (isResult(opened)) return opened
  const allowed = await gate(opened, 'order.open', {})
  if (gated(allowed)) return allowed

  const client = activeClient(clientId)
  if (!client) return fail(strings.orders.clientNotFound)

  const before = opened.draft.clientId
  // Another person means another visit: the lines were priced for the first one.
  if (before !== client.id) {
    opened.draft.lines = []
    opened.draft.step = 1
  }
  opened.draft.clientId = client.id
  await record(opened, 'order.open', allowed.rowId, { before: { clientId: before }, after: { clientId: client.id } })
  refresh()
  return done(text.clientSelected)
}

export async function saveVisit(input: VisitInput): Promise<DraftResult> {
  const opened = await open(input.draftId)
  if (isResult(opened)) return opened
  const allowed = await gate(opened, 'order.open', {})
  if (gated(allowed)) return allowed

  const typed = input.sampleDate.trim()
  let sampleDate: string | null = null
  if (typed !== '') {
    sampleDate = parseBirthDate(typed)
    if (!sampleDate) return fail(text.sampleDateInvalid)
    if (sampleDate > todayInLab()) return fail(text.sampleDateFuture)
  }
  const before = { motivo: opened.draft.motivo, sampleDate: opened.draft.sampleDate }
  opened.draft.motivo = input.motivo.trim().slice(0, 200)
  opened.draft.sampleDate = sampleDate
  await record(opened, 'order.open', allowed.rowId, {
    before,
    after: { motivo: opened.draft.motivo, sampleDate },
  })
  refresh()
  return done(text.visitSaved)
}

export async function saveBilling(input: BillingInput): Promise<DraftResult> {
  const opened = await open(input.draftId)
  if (isResult(opened)) return opened
  const allowed = await gate(opened, 'order.open', {})
  if (gated(allowed)) return allowed

  if (input.costType !== null && !COST_TYPES.includes(input.costType)) return fail(text.notAllowed)
  const before = { costType: opened.draft.costType, billing: opened.draft.billing }
  opened.draft.costType = input.costType
  opened.draft.billing = {
    cedula: input.cedula.trim().slice(0, 20),
    razonSocial: input.razonSocial.trim().slice(0, 120),
    direccion: input.direccion.trim().slice(0, 200),
  }
  // New lines pick up the chosen tipo de costo. Lines already on the order keep the one they were added under.
  await record(opened, 'order.open', allowed.rowId, {
    before,
    after: { costType: opened.draft.costType, billing: opened.draft.billing },
  })
  refresh()
  return done(text.billingSaved)
}

export async function addLine(input: AddLineInput): Promise<DraftResult> {
  const opened = await open(input.draftId)
  if (isResult(opened)) return opened
  const { draft } = opened

  const client = activeClient(draft.clientId)
  if (!client) return fail(strings.orders.clientNotFound)

  const { rateBs, saturdayPriceEnabled } = demoSeed.settings
  if (rateBs === '') return fail(text.rateMissing)

  const exam = demoSeed.priceRows.find((row) => row.id === input.examId)
  if (!exam) return fail(text.examMissing)
  if (input.column !== null && !PRICE_COLUMNS.includes(input.column)) return fail(text.examMissing)

  if (exam.status === 'NO_DISP' && input.confirmNoDisp !== true) return fail('', 'CONFIRM_NO_DISP')

  if (needsColumnOverride(SAVED_PRICE_PAIRS, draft.costType, input.column)) {
    const override = await gate(
      opened,
      'order.price_column.override',
      {},
      { confirmed: input.confirmOverride, motivo: input.overrideMotivo },
    )
    if (gated(override)) return override
  }

  const repeated = repeatedExamIds(allOrders(), client.id, [exam.id]).length > 0
  const repeatMotivo = input.repeatMotivo?.trim() ?? ''
  if (repeated && repeatMotivo === '') return fail('', 'SAME_DAY')

  const allowed = await gate(opened, 'order.line.add', {})
  if (gated(allowed)) return allowed

  const line = {
    id: nextLineId(draft),
    examId: exam.id,
    examName: exam.name,
    costType: draft.costType,
    column: input.column,
    priceUsd: priceFor(exam, input.column),
    basis: pricingBasis(saturdayPriceEnabled),
    status: exam.status,
    repeatMotivo: repeated ? repeatMotivo : null,
    addedAt: new Date().toISOString(),
  }
  draft.lines.push(line)
  await record(opened, 'order.line.add', allowed.rowId, { before: null, after: line }, repeated ? repeatMotivo : undefined)
  refresh()
  return done(text.lineAdded)
}

export async function removeLine({ draftId, lineId }: RemoveDraftLineInput): Promise<DraftResult> {
  const opened = await open(draftId)
  if (isResult(opened)) return opened
  const index = opened.draft.lines.findIndex((line) => line.id === lineId)
  if (index < 0) return fail(text.draftMissing)

  // A draft has no results, so the rule that applies is the one for an order without them.
  const allowed = await gate(opened, 'order.line.remove', { has_result: false })
  if (gated(allowed)) return allowed

  const [removed] = opened.draft.lines.splice(index, 1)
  await record(opened, 'order.line.remove', allowed.rowId, { before: removed, after: null })
  refresh()
  return done(text.lineRemoved)
}

/** Siguiente and Atrás across the four steps. Cliente and Exámenes cannot advance empty. */
export async function goToStep({ draftId, step }: GoToStepInput): Promise<DraftResult> {
  const opened = await open(draftId)
  if (isResult(opened)) return opened
  const { draft } = opened

  if (draft.savedOrderId) return fail(text.alreadySaved)
  if (step === 1) {
    draft.step = 1
    refresh()
    return done('')
  }
  if (!activeClient(draft.clientId)) return fail(text.needClient)
  if (step === 2) {
    draft.step = 2
    refresh()
    return done('')
  }
  if (draft.lines.length === 0) return fail(text.needLines)
  if (draft.lines.some((line) => line.repeatMotivo !== null && line.repeatMotivo.trim() === '')) {
    return fail(text.needRepeatMotivo)
  }
  draft.step = step
  refresh()
  return done('')
}

export async function cancelDraft({ draftId }: DraftIdInput): Promise<DraftResult> {
  const opened = await open(draftId)
  if (isResult(opened)) return opened
  discardDraft(draftId, opened.context.account.id)
  refresh()
  return done('')
}
