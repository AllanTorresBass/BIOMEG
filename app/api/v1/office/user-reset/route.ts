import { withCommand } from '@/lib/server/api/with-command'
import { resetUserPassword } from '@/lib/server/commands/users'
import { userIdSchema } from '@/types/office/office.schemas'

export const POST = withCommand(userIdSchema, resetUserPassword)
