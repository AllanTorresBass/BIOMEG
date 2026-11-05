import { withCommand } from '@/lib/server/api/with-command'
import { reopenCash } from '@/lib/server/commands/payments'
import { cashReopenSchema } from '@/types/orders/payments.schemas'

export const POST = withCommand(cashReopenSchema, reopenCash)
