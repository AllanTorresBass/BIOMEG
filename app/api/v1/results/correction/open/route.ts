import { withCommand } from '@/lib/server/api/with-command'
import { openCorrection } from '@/lib/server/commands/results'
import { openCorrectionSchema } from '@/types/orders/orders.schemas'

export const POST = withCommand(openCorrectionSchema, openCorrection)
