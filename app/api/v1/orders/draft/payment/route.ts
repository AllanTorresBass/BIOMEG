import { withCommand } from '@/lib/server/api/with-command'
import { savePayment } from '@/lib/server/commands/order-save'
import { paymentSchema } from '@/types/orders/orders.schemas'

export const POST = withCommand(paymentSchema, savePayment)
