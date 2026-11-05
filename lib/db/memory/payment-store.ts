import 'server-only'

import type { CashClose, MonthClose, PaymentEntry } from '@/types/orders/payment.types'
import type { PaymentState } from '@/types/stores/payment-store.types'

const globalStore = globalThis as typeof globalThis & { __biomegPayments?: PaymentState }
const state: PaymentState = (globalStore.__biomegPayments ??= { entries: [], closes: [], months: [], counter: 0 })

function nextId(prefix: string): string {
  state.counter += 1
  return `${prefix}-${state.counter}`
}

export function addEntry(input: Omit<PaymentEntry, 'id' | 'closeId' | 'reversedById'>): PaymentEntry {
  const entry: PaymentEntry = { ...input, id: nextId('pay'), closeId: null, reversedById: null }
  state.entries.push(entry)
  return entry
}

export function getEntry(id: string): PaymentEntry | null {
  return state.entries.find((entry) => entry.id === id) ?? null
}

export function allEntries(): readonly PaymentEntry[] {
  return state.entries
}

export function entriesOfOrder(orderId: string): PaymentEntry[] {
  return state.entries.filter((entry) => entry.orderId === orderId)
}

/** The row stays, and only learns which row reversed it. There is no delete. */
export function markReversed(id: string, reversedById: string): void {
  const entry = getEntry(id)
  if (entry) entry.reversedById = reversedById
}

/** Everything this person took that no close holds yet. A payment after a close lands here (E-48). */
export function openEntriesOf(userId: string): PaymentEntry[] {
  return state.entries.filter((entry) => entry.byId === userId && entry.closeId === null)
}

export function addClose(input: Omit<CashClose, 'id' | 'reopenedAt' | 'reopenedByName' | 'reopenMotivo'>): CashClose {
  const close: CashClose = { ...input, id: nextId('close'), reopenedAt: null, reopenedByName: null, reopenMotivo: null }
  state.closes.push(close)
  for (const id of close.entryIds) {
    const entry = getEntry(id)
    if (entry) entry.closeId = close.id
  }
  return close
}

export function getClose(id: string): CashClose | null {
  return state.closes.find((close) => close.id === id) ?? null
}

export function allCloses(): readonly CashClose[] {
  return state.closes
}

/** The close stays as evidence. Its rows go back to the open period. */
export function reopenClose(id: string, byName: string, motivo: string): CashClose | null {
  const close = getClose(id)
  if (!close || close.reopenedAt) return null
  close.reopenedAt = new Date().toISOString()
  close.reopenedByName = byName
  close.reopenMotivo = motivo
  for (const entryId of close.entryIds) {
    const entry = getEntry(entryId)
    if (entry?.closeId === close.id) entry.closeId = null
  }
  return close
}

export function monthCloseOf(month: string): MonthClose | null {
  return state.months.find((entry) => entry.month === month) ?? null
}

export function addMonthClose(close: MonthClose): void {
  state.months.push(close)
}

export function allMonthCloses(): readonly MonthClose[] {
  return state.months
}

/** Test hook. */
export function resetPaymentStore(): void {
  state.entries = []
  state.closes = []
  state.months = []
  state.counter = 0
}
