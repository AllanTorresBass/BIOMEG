import { ClientService } from '@/lib/services/clients/ClientService'
import { DeliveryService } from '@/lib/services/delivery/DeliveryService'
import { OrderService } from '@/lib/services/orders/OrderService'
import { PortalService } from '@/lib/services/portal/PortalService'
import { ResultService } from '@/lib/services/results/ResultService'
import { SessionService } from '@/lib/services/session/SessionService'
import { WorklistService } from '@/lib/services/worklist/WorklistService'
import type { ServiceContainer } from '@/types/contracts/services.contracts'

type Registry = { -readonly [Name in keyof ServiceContainer]?: ServiceContainer[Name] }

const created: Registry = {}

/** Lazy, so a screen only builds the services it uses. Nothing else may call `new` on a service. */
export const container: ServiceContainer = {
  get clientService() {
    return (created.clientService ??= new ClientService())
  },
  get deliveryService() {
    return (created.deliveryService ??= new DeliveryService())
  },
  get orderService() {
    return (created.orderService ??= new OrderService())
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
