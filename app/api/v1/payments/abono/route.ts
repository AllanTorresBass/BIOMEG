import { withCommand } from '@/lib/server/api/with-command'
import { addAbono } from '@/lib/server/commands/payments'
import { abonoSchema } from '@/types/orders/payments.schemas'

export const POST = withCommand(abonoSchema, addAbono)
