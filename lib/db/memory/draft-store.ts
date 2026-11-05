import 'server-only'

import { emptyPayments } from '@/lib/config/payment-methods'
import type { OrderDraft, OrderPath } from '@/types/orders/draft.types'
import type { DraftState } from '@/types/stores/draft-store.types'

const globalStore = globalThis as typeof globalThis & { __biomegDrafts?: DraftState }
const state: DraftState = (globalStore.__biomegDrafts ??= { drafts: new Map(), counter: 0 })

function isUntouched(draft: OrderDraft): boolean {
  return draft.clientId === null && draft.lines.length === 0
}

/** A draft belongs to the person who started it. Anyone else gets null. */
export function getDraft(id: string, ownerId: string): OrderDraft | null {
  const draft = state.drafts.get(id)
  return draft && draft.ownerId === ownerId ? draft : null
}

/**
 * Opens a draft in state BORRADOR. Opening the screen twice reuses the empty draft already
 * waiting, so a refresh never leaves a second empty order behind.
 */
export function startDraft(ownerId: string, path: OrderPath): OrderDraft {
  for (const draft of state.drafts.values()) {
    if (draft.ownerId === ownerId && draft.path === path && isUntouched(draft)) return draft
  }
  state.counter += 1
  const draft: OrderDraft = {
    id: `d-${state.counter}`,
    ownerId,
    path,
    step: 1,
    state: 'BORRADOR',
    clientId: null,
    motivo: '',
    sampleDate: null,
    costType: null,
    billing: { cedula: '', razonSocial: '', direccion: '' },
    lines: [],
    physicianId: null,
    convenioId: null,
    titular: '',
    payments: emptyPayments(),
    discountPct: '0',
    discountMotivo: '',
    savedOrderId: null,
    createdAt: new Date().toISOString(),
  }
  state.drafts.set(draft.id, draft)
  return draft
}

export function nextLineId(draft: OrderDraft): string {
  const highest = draft.lines.reduce((max, line) => Math.max(max, Number(line.id.split('-').pop()) || 0), 0)
  return `${draft.id}-l-${highest + 1}`
}

/** Cancelar discards the unsaved edits. */
export function discardDraft(id: string, ownerId: string): boolean {
  const draft = getDraft(id, ownerId)
  return draft ? state.drafts.delete(id) : false
}
