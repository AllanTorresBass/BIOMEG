import { withCommand } from '@/lib/server/api/with-command'
import { saveResult } from '@/lib/server/commands/results'
import { saveResultSchema } from '@/types/orders/orders.schemas'

export const POST = withCommand(saveResultSchema, saveResult)
