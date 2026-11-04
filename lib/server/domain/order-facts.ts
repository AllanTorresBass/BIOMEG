import type { OrderStub } from '@/types/domain/order-stub.types'
import type { SavedOrder } from '@/types/orders/order.types'

/** The facts the permission table reads for Anular and for removing a line. */
export function orderActionFacts(order: Pick<SavedOrder, 'payments'>, stub: Pick<OrderStub, 'hasResult' | 'released'>) {
  return {
    has_payment: order.payments.some((payment) => payment.amount !== ''),
    has_result: stub.hasResult,
    has_released_result: stub.released,
  }
}
