import { withCommand } from '@/lib/server/api/with-command'
import { selectClient } from '@/lib/server/commands/order-draft'
import { selectClientSchema } from '@/types/orders/orders.schemas'

export const POST = withCommand(selectClientSchema, selectClient)
