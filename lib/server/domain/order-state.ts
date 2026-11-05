import 'server-only'
import type { OrderResult, OrderState, OrderStateInput, ResultState, SectionStatus } from '@/types/domain/order-state.types'

function sectionStatuses(results: readonly OrderResult[]): SectionStatus[] {
  const bySection = new Map<string, ResultState[]>()
  for (const result of results) {
    const list = bySection.get(result.sectionId) ?? []
    list.push(result.state)
    bySection.set(result.sectionId, list)
  }
  return [...bySection.values()].map((states) => {
    if (states.includes('EN_CORRECCION')) return 'EN_CORRECCION'
    if (states.every((state) => state === 'LIBERADO')) return 'LIBERADO'
    if (states.every((state) => state === 'PENDIENTE')) return 'PENDIENTE'
    return 'CARGADO'
  })
}

/** ANULADA is reachable only while no result is released. */
export function canVoid(results: readonly OrderResult[]): boolean {
  return !results.some((result) => result.state === 'LIBERADO' || result.state === 'EN_CORRECCION')
}

export function deriveOrderState(input: OrderStateInput): OrderState {
  if (!input.saved) return 'BORRADOR'
  if (input.voided) {
    if (!canVoid(input.results)) {
      throw new Error('An order with a released result cannot be voided.')
    }
    return 'ANULADA'
  }

  const sections = sectionStatuses(input.results)
  const anyStored = sections.some((status) => status !== 'PENDIENTE')
  if (!anyStored) return 'ABIERTA'

  if (sections.every((status) => status === 'LIBERADO')) return 'LIBERADO'

  // A fully released order moves to EN_CORRECCION with its section.
  // An order that was still partial stays INCOMPLETO, and the section shows En revisión.
  const onlyReleasedOrCorrecting = sections.every((status) => status === 'LIBERADO' || status === 'EN_CORRECCION')
  if (onlyReleasedOrCorrecting && sections.some((status) => status === 'EN_CORRECCION')) {
    return 'EN_CORRECCION'
  }
  return 'INCOMPLETO'
}
