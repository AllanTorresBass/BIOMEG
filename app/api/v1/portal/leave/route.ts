import { withCommand } from '@/lib/server/api/with-command'
import { leavePortal } from '@/lib/server/commands/portal'
import { noInputSchema } from '@/types/session/session.schemas'

export const POST = withCommand(noInputSchema, () => leavePortal(), { audience: 'public' })
