import { withCommand } from '@/lib/server/api/with-command'
import { signIn } from '@/lib/server/commands/session'
import { signInSchema } from '@/types/session/session.schemas'

export const POST = withCommand(signInSchema, signIn, { audience: 'public' })
