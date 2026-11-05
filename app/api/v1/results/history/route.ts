import { withCommand } from '@/lib/server/api/with-command'
import { rowHistory } from '@/lib/server/commands/results'
import { rowHistorySchema } from '@/types/orders/orders.schemas'

export const POST = withCommand(rowHistorySchema, rowHistory)
