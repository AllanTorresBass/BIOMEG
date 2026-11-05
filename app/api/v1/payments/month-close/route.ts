import { withCommand } from '@/lib/server/api/with-command'
import { closeMonth } from '@/lib/server/commands/payments'
import { monthCloseSchema } from '@/types/orders/payments.schemas'

export const POST = withCommand(monthCloseSchema, closeMonth)
