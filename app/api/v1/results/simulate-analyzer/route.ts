import { withCommand } from '@/lib/server/api/with-command'
import { simulateAnalyzer } from '@/lib/server/commands/results'
import { simulateAnalyzerSchema } from '@/types/orders/orders.schemas'

export const POST = withCommand(simulateAnalyzerSchema, simulateAnalyzer)
