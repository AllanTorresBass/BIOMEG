import { withCommand } from '@/lib/server/api/with-command'
import { removeLine } from '@/lib/server/commands/order-draft'
import { removeDraftLineSchema } from '@/types/orders/orders.schemas'

export const POST = withCommand(removeDraftLineSchema, removeLine)
