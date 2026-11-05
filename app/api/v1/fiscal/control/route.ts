import { withCommand } from '@/lib/server/api/with-command'
import { assignControlNumber } from '@/lib/server/commands/fiscal'
import { assignControlSchema } from '@/types/orders/fiscal.schemas'

export const POST = withCommand(assignControlSchema, assignControlNumber)
