import { withCommand } from '@/lib/server/api/with-command'
import { cancelCorrection } from '@/lib/server/commands/results'
import { correctionSchema } from '@/types/orders/orders.schemas'

export const POST = withCommand(correctionSchema, cancelCorrection)
