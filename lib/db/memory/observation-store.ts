import 'server-only'

import { todayInLab } from '@/lib/server/domain/client-rules'
import type { Observation } from '@/types/observations/observation.types'

const MAX_TEXT = 2000

type ObservationState = { byId: Map<string, Observation>; counter: number }

const globalStore = globalThis as typeof globalThis & { __biomegObservations?: ObservationState }

function seed(): ObservationState {
  const today = todayInLab()
  const byId = new Map<string, Observation>()
  byId.set('obs-1', {
    id: 'obs-1',
    date: today,
    text: 'Equipo de hematología calibrado al inicio del turno.',
    authorId: 'u-bioanalista',
    authorName: 'Lcda. Demo',
    createdAt: `${today}T08:15:00.000Z`,
    retractedAt: null,
    retractedById: null,
    retractedByName: null,
  })
  return { byId, counter: 1 }
}

function state(): ObservationState {
  return (globalStore.__biomegObservations ??= seed())
}

export function observationMaxLength(): number {
  return MAX_TEXT
}

export function listObservationsByDate(date: string): Observation[] {
  return [...state().byId.values()]
    .filter((row) => row.date === date && row.retractedAt === null)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export function getObservation(id: string): Observation | null {
  return state().byId.get(id) ?? null
}

export function createObservation(input: {
  date: string
  text: string
  authorId: string
  authorName: string
  now?: string
}): Observation {
  const current = state()
  current.counter += 1
  const id = `obs-${current.counter}`
  const row: Observation = {
    id,
    date: input.date,
    text: input.text,
    authorId: input.authorId,
    authorName: input.authorName,
    createdAt: input.now ?? new Date().toISOString(),
    retractedAt: null,
    retractedById: null,
    retractedByName: null,
  }
  current.byId.set(id, row)
  return row
}

export function retractObservation(input: {
  id: string
  byId: string
  byName: string
  now?: string
}): Observation | null {
  const row = state().byId.get(input.id)
  if (!row || row.retractedAt) return null
  const next: Observation = {
    ...row,
    retractedAt: input.now ?? new Date().toISOString(),
    retractedById: input.byId,
    retractedByName: input.byName,
  }
  state().byId.set(input.id, next)
  return next
}

export function resetObservationsForTests(): void {
  globalStore.__biomegObservations = seed()
}

export function clearObservationsForTests(): void {
  globalStore.__biomegObservations = { byId: new Map(), counter: 0 }
}
