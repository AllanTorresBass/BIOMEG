import { withCommand } from '@/lib/server/api/with-command'
import { savePersonal } from '@/lib/server/commands/order-save'
import { personalSchema } from '@/types/orders/orders.schemas'

export const POST = withCommand(personalSchema, savePersonal)
