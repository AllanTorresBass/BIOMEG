import { withCommand } from '@/lib/server/api/with-command'
import { releaseResults } from '@/lib/server/commands/results'
import { releaseResultsSchema } from '@/types/orders/orders.schemas'

export const POST = withCommand(releaseResultsSchema, releaseResults)
