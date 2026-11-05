import type { ClientService } from '@/lib/services/clients/ClientService'
import type { DeliveryService } from '@/lib/services/delivery/DeliveryService'
import type { OrderService } from '@/lib/services/orders/OrderService'
import type { PaymentService } from '@/lib/services/payments/PaymentService'
import type { PortalService } from '@/lib/services/portal/PortalService'
import type { ResultService } from '@/lib/services/results/ResultService'
import type { SessionService } from '@/lib/services/session/SessionService'
import type { WorklistService } from '@/lib/services/worklist/WorklistService'

export interface ServiceContainer {
  readonly clientService: ClientService
  readonly deliveryService: DeliveryService
  readonly orderService: OrderService
  readonly paymentService: PaymentService
  readonly portalService: PortalService
  readonly resultService: ResultService
  readonly sessionService: SessionService
  readonly worklistService: WorklistService
}
