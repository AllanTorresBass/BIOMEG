import { withCommand } from '@/lib/server/api/with-command'
import { saveBilling } from '@/lib/server/commands/order-draft'
import { billingSchema } from '@/types/orders/orders.schemas'

export const POST = withCommand(billingSchema, saveBilling)
