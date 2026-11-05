import 'server-only'

import type { FiscalNote } from '@/types/orders/fiscal.types'
import type { FiscalState } from '@/types/stores/fiscal-store.types'

const globalStore = globalThis as typeof globalThis & { __biomegFiscal?: FiscalState }
const state: FiscalState = (globalStore.__biomegFiscal ??= { notes: [], debitCounter: 0, counter: 0 })

export function nextDebitNoteNumber(): string {
  state.debitCounter += 1
  return `ND-${String(state.debitCounter).padStart(6, '0')}`
}

export function addNote(input: Omit<FiscalNote, 'id'>): FiscalNote {
  state.counter += 1
  const note: FiscalNote = { ...input, id: `fn-${state.counter}` }
  state.notes.push(note)
  return note
}

export function findNote(kind: FiscalNote['kind'], number: string): FiscalNote | null {
  return state.notes.find((note) => note.kind === kind && note.number === number) ?? null
}

export function notesOfOrder(orderId: string): FiscalNote[] {
  return state.notes.filter((note) => note.orderId === orderId)
}

/** Test hook. */
export function resetFiscalStore(): void {
  state.notes = []
  state.debitCounter = 0
  state.counter = 0
}
