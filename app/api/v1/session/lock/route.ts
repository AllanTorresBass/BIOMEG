import { withCommand } from '@/lib/server/api/with-command'
import { lockCurrentSession } from '@/lib/server/commands/session'
import { noInputSchema } from '@/types/session/session.schemas'

export const POST = withCommand(noInputSchema, () => lockCurrentSession())
