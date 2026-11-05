import { todayInLab } from '@/lib/server/domain/client-rules'
import type { OrderStub } from '@/types/domain/order-stub.types'
import type { CostType, PriceColumn } from '@/types/orders/draft.types'

/**
 * Exams this client already has on an order opened today (America/Caracas). A voided order
 * does not count, and a different exam the same day does not trigger it.
 */
export function repeatedExamIds(
  orders: readonly OrderStub[],
  clientId: string,
  examIds: readonly string[],
  now: Date = new Date(),
): string[] {
  const today = todayInLab(now)
  const taken = new Set<string>()
  for (const order of orders) {
    if (order.clientId !== clientId || order.voided) continue
    if (todayInLab(new Date(order.createdAt)) !== today) continue
    for (const id of order.examIds ?? []) taken.add(id)
  }
  return examIds.filter((id) => taken.has(id))
}

/**
 * True only when a pair is saved for the tipo de costo and the operator chose another column.
 * With no saved pair there is nothing to override: the operator simply chooses.
 */
export function needsColumnOverride(
  saved: Partial<Record<CostType, PriceColumn>>,
  costType: CostType | null,
  column: PriceColumn | null,
): boolean {
  if (costType === null || column === null) return false
  const preferred = saved[costType]
  return preferred !== undefined && preferred !== column
}
