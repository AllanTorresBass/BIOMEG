import { withCommand } from '@/lib/server/api/with-command'
import { cancelDraft } from '@/lib/server/commands/order-draft'
import { draftIdSchema } from '@/types/orders/orders.schemas'

export const POST = withCommand(draftIdSchema, cancelDraft)
