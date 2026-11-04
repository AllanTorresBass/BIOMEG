import 'server-only'

import { demoSeed } from '@/lib/db/memory/seed'
import { autoMark } from '@/lib/domain/result-rules'
import type { Discrepancy, ResultMark, ResultSource, StoredResult } from '@/types/orders/result.types'

interface ResultStoreState {
  cells: Map<string, StoredResult>
  notes: Map<string, string>
  discrepancies: Discrepancy[]
}

const SEEDED_ORDER = 'o-1'
const SEEDED_SEX: 'F' | 'M' | null = 'F'

function cellKey(orderId: string, lineId: string): string {
  return `${orderId}|${lineId}`
}

/** The released demo order carries its invented result lines so the grid has something to read. */
function buildState(): ResultStoreState {
  const cells = new Map<string, StoredResult>()
  const at = new Date().toISOString()
  for (const line of demoSeed.resultLines) {
    cells.set(cellKey(SEEDED_ORDER, line.id), {
      orderId: SEEDED_ORDER,
      lineId: line.id,
      value: line.value,
      mark: autoMark(line.reference, line.value, SEEDED_SEX),
      source: 'teclado',
      byId: 'seed',
      byName: 'Carga inicial',
      at,
      version: 1,
      incoming: null,
    })
  }
  return { cells, notes: new Map(), discrepancies: [] }
}

const globalStore = globalThis as typeof globalThis & { __biomegResults?: ResultStoreState }
const state: ResultStoreState = (globalStore.__biomegResults ??= buildState())

export function getResult(orderId: string, lineId: string): StoredResult | null {
  return state.cells.get(cellKey(orderId, lineId)) ?? null
}

export function resultsOf(orderId: string): StoredResult[] {
  return [...state.cells.values()].filter((cell) => cell.orderId === orderId)
}

export interface WriteInput {
  orderId: string
  lineId: string
  value: string
  mark: ResultMark | null
  source: ResultSource
  byId: string
  byName: string
  expectedVersion: number
}

export type WriteOutcome = { kind: 'saved'; result: StoredResult } | { kind: 'conflict'; current: StoredResult }

/** Writes one cell if its version still matches. The second writer gets the stored cell back. */
export function writeResult(input: WriteInput): WriteOutcome {
  const key = cellKey(input.orderId, input.lineId)
  const current = state.cells.get(key) ?? null
  if ((current?.version ?? 0) !== input.expectedVersion) {
    return { kind: 'conflict', current: current as StoredResult }
  }
  const result: StoredResult = {
    orderId: input.orderId,
    lineId: input.lineId,
    value: input.value,
    mark: input.mark,
    source: input.source,
    byId: input.byId,
    byName: input.byName,
    at: new Date().toISOString(),
    version: (current?.version ?? 0) + 1,
    incoming: null,
  }
  state.cells.set(key, result)
  return { kind: 'saved', result }
}

/** The analyzer's value waits beside a typed cell. It never replaces it. */
export function holdIncoming(orderId: string, lineId: string, value: string): StoredResult | null {
  const key = cellKey(orderId, lineId)
  const current = state.cells.get(key)
  if (!current) return null
  const next: StoredResult = { ...current, incoming: { value, at: new Date().toISOString() }, version: current.version + 1 }
  state.cells.set(key, next)
  return next
}

export function dropIncoming(orderId: string, lineId: string): StoredResult | null {
  const key = cellKey(orderId, lineId)
  const current = state.cells.get(key)
  if (!current) return null
  const next: StoredResult = { ...current, incoming: null, version: current.version + 1 }
  state.cells.set(key, next)
  return next
}

/** After release the analyzer value is refused from the result and queued here. */
export function queueDiscrepancy(entry: Discrepancy): void {
  state.discrepancies.push(entry)
}

export function discrepanciesOf(orderId: string): Discrepancy[] {
  return state.discrepancies.filter((entry) => entry.orderId === orderId)
}

export function getNote(orderId: string, section: string): string {
  return state.notes.get(`${orderId}|${section}`) ?? ''
}

export function setNote(orderId: string, section: string, text: string): void {
  const key = `${orderId}|${section}`
  if (text.trim() === '') state.notes.delete(key)
  else state.notes.set(key, text)
}
