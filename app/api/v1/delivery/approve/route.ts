import { withCommand } from '@/lib/server/api/with-command'
import { approveIncompleteSend } from '@/lib/server/commands/delivery'
import { orderIdSchema } from '@/types/orders/orders.schemas'

export const POST = withCommand(orderIdSchema, approveIncompleteSend)
