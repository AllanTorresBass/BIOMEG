import { withCommand } from '@/lib/server/api/with-command'
import { verifyStepUp } from '@/lib/server/commands/session'
import { stepUpSchema } from '@/types/session/session.schemas'

export const POST = withCommand(stepUpSchema, verifyStepUp)
