import { withCommand } from '@/lib/server/api/with-command'
import { saveVisit } from '@/lib/server/commands/order-draft'
import { visitSchema } from '@/types/orders/orders.schemas'

export const POST = withCommand(visitSchema, saveVisit)
