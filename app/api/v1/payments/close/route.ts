import { withCommand } from '@/lib/server/api/with-command'
import { closeCash } from '@/lib/server/commands/payments'
import { cashCloseSchema } from '@/types/orders/payments.schemas'

export const POST = withCommand(cashCloseSchema, closeCash)
