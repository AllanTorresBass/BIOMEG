import { withCommand } from '@/lib/server/api/with-command'
import { createUser } from '@/lib/server/commands/users'
import { createUserSchema } from '@/types/office/office.schemas'

export const POST = withCommand(createUserSchema, createUser)
