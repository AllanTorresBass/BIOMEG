import { withCommand } from '@/lib/server/api/with-command'
import { changeOwnPassword } from '@/lib/server/commands/password'
import { changePasswordSchema } from '@/types/session/session.schemas'

export const POST = withCommand(changePasswordSchema, changeOwnPassword)
