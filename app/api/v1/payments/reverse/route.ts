import { withCommand } from '@/lib/server/api/with-command'
import { reversePayment } from '@/lib/server/commands/payments'
import { reversePaymentSchema } from '@/types/orders/payments.schemas'

export const POST = withCommand(reversePaymentSchema, reversePayment)
