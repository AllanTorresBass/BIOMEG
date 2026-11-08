import { ClientService } from '@/lib/services/clients/ClientService'
import { DeliveryService } from '@/lib/services/delivery/DeliveryService'
import { FiscalService } from '@/lib/services/fiscal/FiscalService'
import { ObservationService } from '@/lib/services/observations/ObservationService'
import { OfficeService } from '@/lib/services/office/OfficeService'
import { OrderService } from '@/lib/services/orders/OrderService'
import { PaymentService } from '@/lib/services/payments/PaymentService'
import { PortalService } from '@/lib/services/portal/PortalService'
import { ResultService } from '@/lib/services/results/ResultService'
import { SessionService } from '@/lib/services/session/SessionService'
import { WorklistService } from '@/lib/services/worklist/WorklistService'
import type { ServiceContainer } from '@/types/contracts/services.contracts'
import type { Registry } from '@/types/lib/container.types'

const created: Registry = {}

/** Lazy, so a screen only builds the services it uses. Nothing else may call `new` on a service. */
export const container: ServiceContainer = {
  get clientService() {
    return (created.clientService ??= new ClientService())
  },
  get deliveryService() {
    return (created.deliveryService ??= new DeliveryService())
  },
  get fiscalService() {
    return (created.fiscalService ??= new FiscalService())
  },
  get observationService() {
    return (created.observationService ??= new ObservationService())
  },
  get officeService() {
    return (created.officeService ??= new OfficeService())
  },
  get orderService() {
    return (created.orderService ??= new OrderService())
  },
  get paymentService() {
    return (created.paymentService ??= new PaymentService())
  },
  get portalService() {
    return (created.portalService ??= new PortalService())
  },
  get resultService() {
    return (created.resultService ??= new ResultService())
  },
  get sessionService() {
    return (created.sessionService ??= new SessionService())
  },
  get worklistService() {
    return (created.worklistService ??= new WorklistService())
  },
}
