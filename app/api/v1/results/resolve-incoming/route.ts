import { withCommand } from '@/lib/server/api/with-command'
import { resolveIncoming } from '@/lib/server/commands/results'
import { resolveIncomingSchema } from '@/types/orders/orders.schemas'

export const POST = withCommand(resolveIncomingSchema, resolveIncoming)
