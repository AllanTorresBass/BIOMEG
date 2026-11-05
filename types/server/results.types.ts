import type { Subject, Target } from '@/types/server/draft-gate.types'
import type { OrderStub } from '@/types/domain/order-stub.types'

export interface Opened extends Subject {
  stub: OrderStub
  target: Target
}
