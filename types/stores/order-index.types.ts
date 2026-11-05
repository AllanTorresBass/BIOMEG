import type { OrderStub } from '@/types/domain/order-stub.types'

export interface OrderIndexState {
  orders: Map<string, OrderStub>
}
