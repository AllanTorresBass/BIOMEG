import 'server-only'

import { applyStatusOnly } from '@/lib/auth/scopes'
import { LAB_TIME_ZONE } from '@/lib/utils/format'
import type { OrderStub } from '@/types/domain/order-stub.types'
import type { WorklistRow, WorklistState } from '@/types/orders/worklist.types'

const DAY_FORMAT = new Intl.DateTimeFormat('en-CA', {
  timeZone: LAB_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

export function worklistState(stub: OrderStub): WorklistState {
  if (stub.correctionOpen) return 'EN_CORRECCION'
  if (stub.released) return 'LIBERADO'
  if (stub.hasResult) return 'INCOMPLETO'
  return 'ABIERTA'
}

function sampleDay(stub: OrderStub): string {
  return stub.sampleDate ?? DAY_FORMAT.format(new Date(stub.createdAt))
}

/** Voided orders leave the worklist. A correction left open stays listed whatever the date. */
export function buildWorklist(stubs: readonly OrderStub[], date: string, reviewOnly = false): WorklistRow[] {
  return stubs
    .filter((stub) => !stub.voided)
    .filter((stub) => stub.correctionOpen === true || sampleDay(stub) === date)
    .filter((stub) => !reviewOnly || stub.needsReview)
    .map((stub) => ({
      id: stub.id,
      number: stub.number ?? stub.id,
      patient: stub.clientName,
      convenio: stub.convenioName ?? null,
      sampleDate: sampleDay(stub),
      state: worklistState(stub),
      printed: stub.printed === true,
      needsReview: stub.needsReview,
    }))
    .sort((a, b) => a.number.localeCompare(b.number))
}

/** status_only: the review flag points at a clinical change, so reception never receives it. */
export function toStatusOnly(rows: readonly WorklistRow[]): WorklistRow[] {
  return rows.map((row) => applyStatusOnly({ ...row }, ['needsReview']))
}
