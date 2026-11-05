import { withCommand } from '@/lib/server/api/with-command'
import { addBacteriologyNote } from '@/lib/server/commands/results'
import { orderIdSchema } from '@/types/orders/orders.schemas'

export const POST = withCommand(orderIdSchema, addBacteriologyNote)
