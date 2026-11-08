import 'server-only'

import {
  createObservation as storeCreate,
  getObservation,
  observationMaxLength,
  retractObservation as storeRetract,
} from '@/lib/db/memory/observation-store'
import { auditEvent } from '@/lib/server/audit'
import { todayInLab } from '@/lib/server/domain/client-rules'
import { decide } from '@/lib/auth/decide'
import { getStaffContext, toDecisionSession } from '@/lib/server/session/current'
import { strings } from '@/lib/strings'
import { revalidatePath } from 'next/cache'
import type { CreateObservationInput, RetractObservationInput } from '@/types/observations/observation.schemas'
import type { ObservationResult, ObservationRowView } from '@/types/observations/observation.types'

const text = strings.observations

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/

function fail(message: string): ObservationResult {
  return { ok: false, message, need: null }
}

function done(message: string, observation?: ObservationRowView): ObservationResult {
  return { ok: true, message, need: null, ...(observation ? { observation } : {}) }
}

function previewOf(value: string): string {
  const line = value.split(/\r?\n/)[0]?.trim() ?? ''
  return line.length > 120 ? `${line.slice(0, 117)}…` : line
}

export function toObservationRow(
  row: {
    id: string
    date: string
    text: string
    authorId: string
    authorName: string
    createdAt: string
  },
  currentUserId: string,
  today: string,
): ObservationRowView {
  return {
    id: row.id,
    date: row.date,
    text: row.text,
    authorId: row.authorId,
    authorName: row.authorName,
    createdAt: row.createdAt,
    preview: previewOf(row.text),
    canRetract: row.authorId === currentUserId && row.date === today,
  }
}

export async function createObservation(input: CreateObservationInput): Promise<ObservationResult> {
  const context = await getStaffContext()
  if (!context || context.locked) return fail(text.notAllowed)

  const session = toDecisionSession(context)
  const decision = decide({ session, command: 'observation.use' })
  if (!decision.allowed) {
    await auditEvent({
      command: 'observation.create',
      outcome: 'REFUSED',
      reason: 'ROLE',
      session: context.session,
      account: context.account,
      recordType: 'observation',
    })
    return fail(text.notAllowed)
  }

  if (!DATE_PATTERN.test(input.date) || Number.isNaN(new Date(`${input.date}T00:00:00Z`).getTime())) {
    await auditEvent({
      command: 'observation.create',
      outcome: 'REFUSED',
      reason: 'STATE',
      state: 'DATE_INVALID',
      session: context.session,
      account: context.account,
      recordType: 'observation',
    })
    return fail(text.dateInvalid)
  }

  const trimmed = input.text.trim()
  if (trimmed === '') {
    await auditEvent({
      command: 'observation.create',
      outcome: 'REFUSED',
      reason: 'STATE',
      state: 'EMPTY',
      session: context.session,
      account: context.account,
      recordType: 'observation',
    })
    return fail(text.textRequired)
  }
  if (trimmed.length > observationMaxLength()) {
    await auditEvent({
      command: 'observation.create',
      outcome: 'REFUSED',
      reason: 'STATE',
      state: 'TOO_LONG',
      session: context.session,
      account: context.account,
      recordType: 'observation',
    })
    return fail(text.textTooLong(observationMaxLength()))
  }

  const saved = storeCreate({
    date: input.date,
    text: trimmed,
    authorId: context.account.id,
    authorName: context.account.displayName,
  })
  await auditEvent({
    command: 'observation.create',
    outcome: 'ALLOWED',
    session: context.session,
    account: context.account,
    recordType: 'observation',
    recordId: saved.id,
    change: { before: null, after: { date: saved.date, text: saved.text }, field: 'text' },
  })
  revalidatePath('/')
  return done(text.saved, toObservationRow(saved, context.account.id, todayInLab()))
}

export async function retractObservation(input: RetractObservationInput): Promise<ObservationResult> {
  const context = await getStaffContext()
  if (!context || context.locked) return fail(text.notAllowed)

  const session = toDecisionSession(context)
  const decision = decide({ session, command: 'observation.use' })
  if (!decision.allowed) {
    await auditEvent({
      command: 'observation.retract',
      outcome: 'REFUSED',
      reason: 'ROLE',
      session: context.session,
      account: context.account,
      recordType: 'observation',
      recordId: input.id,
    })
    return fail(text.notAllowed)
  }

  const existing = getObservation(input.id)
  if (!existing || existing.retractedAt) {
    await auditEvent({
      command: 'observation.retract',
      outcome: 'REFUSED',
      reason: 'STATE',
      state: 'MISSING',
      session: context.session,
      account: context.account,
      recordType: 'observation',
      recordId: input.id,
    })
    return fail(text.missing)
  }

  if (existing.authorId !== context.account.id) {
    await auditEvent({
      command: 'observation.retract',
      outcome: 'REFUSED',
      reason: 'STATE',
      state: 'NOT_AUTHOR',
      session: context.session,
      account: context.account,
      recordType: 'observation',
      recordId: input.id,
    })
    return fail(text.retractNotAuthor)
  }

  const today = todayInLab()
  if (existing.date !== today) {
    await auditEvent({
      command: 'observation.retract',
      outcome: 'REFUSED',
      reason: 'STATE',
      state: 'PRIOR_DAY',
      session: context.session,
      account: context.account,
      recordType: 'observation',
      recordId: input.id,
    })
    return fail(text.retractPriorDay)
  }

  if (input.confirmed !== true) {
    return fail(text.retractConfirmNeeded)
  }

  const next = storeRetract({
    id: input.id,
    byId: context.account.id,
    byName: context.account.displayName,
  })
  if (!next) return fail(text.missing)

  await auditEvent({
    command: 'observation.retract',
    outcome: 'ALLOWED',
    session: context.session,
    account: context.account,
    recordType: 'observation',
    recordId: next.id,
    change: { before: { text: existing.text }, after: null, field: 'retracted' },
  })
  revalidatePath('/')
  return done(text.retracted)
}
