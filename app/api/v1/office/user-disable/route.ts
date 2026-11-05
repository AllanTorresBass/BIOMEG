import { withCommand } from '@/lib/server/api/with-command'
import { disableUser } from '@/lib/server/commands/users'
import { userIdSchema } from '@/types/office/office.schemas'

export const POST = withCommand(userIdSchema, disableUser)
