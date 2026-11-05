import { withCommand } from '@/lib/server/api/with-command'
import { generateQuote } from '@/lib/server/commands/order-actions'
import { draftIdSchema } from '@/types/orders/orders.schemas'

export const POST = withCommand(draftIdSchema, generateQuote)
