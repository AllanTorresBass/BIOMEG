import { withCommand } from '@/lib/server/api/with-command'
import { changeUserRoles } from '@/lib/server/commands/users'
import { replaceRolesSchema } from '@/types/office/office.schemas'

export const POST = withCommand(replaceRolesSchema, changeUserRoles)
