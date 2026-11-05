import { withCommand } from '@/lib/server/api/with-command'
import { addLine } from '@/lib/server/commands/order-draft'
import { addLineSchema } from '@/types/orders/orders.schemas'

export const POST = withCommand(addLineSchema, addLine)
