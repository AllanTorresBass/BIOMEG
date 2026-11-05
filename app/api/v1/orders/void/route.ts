import { withCommand } from '@/lib/server/api/with-command'
import { voidOrder } from '@/lib/server/commands/order-actions'
import { voidOrderSchema } from '@/types/orders/orders.schemas'

export const POST = withCommand(voidOrderSchema, voidOrder)
