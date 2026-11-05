import { withCommand } from '@/lib/server/api/with-command'
import { saveOrder } from '@/lib/server/commands/order-save'
import { saveOrderSchema } from '@/types/orders/orders.schemas'

export const POST = withCommand(saveOrderSchema, saveOrder, { status: 201 })
