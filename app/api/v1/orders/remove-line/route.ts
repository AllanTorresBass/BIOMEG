import { withCommand } from '@/lib/server/api/with-command'
import { removeOrderLine } from '@/lib/server/commands/order-actions'
import { removeOrderLineSchema } from '@/types/orders/orders.schemas'

export const POST = withCommand(removeOrderLineSchema, removeOrderLine)
