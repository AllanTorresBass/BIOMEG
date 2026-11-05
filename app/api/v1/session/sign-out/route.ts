import { withCommand } from '@/lib/server/api/with-command'
import { signOut } from '@/lib/server/commands/session'
import { noInputSchema } from '@/types/session/session.schemas'

export const POST = withCommand(noInputSchema, () => signOut(), { audience: 'public' })
