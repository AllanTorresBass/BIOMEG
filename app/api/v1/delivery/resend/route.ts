import { withCommand } from '@/lib/server/api/with-command'
import { resendDelivery } from '@/lib/server/commands/delivery'
import { deliverySchema } from '@/types/orders/orders.schemas'

export const POST = withCommand(deliverySchema, resendDelivery)
