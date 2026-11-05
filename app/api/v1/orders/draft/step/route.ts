import { withCommand } from '@/lib/server/api/with-command'
import { goToStep } from '@/lib/server/commands/order-draft'
import { goToStepSchema } from '@/types/orders/orders.schemas'

export const POST = withCommand(goToStepSchema, goToStep)
