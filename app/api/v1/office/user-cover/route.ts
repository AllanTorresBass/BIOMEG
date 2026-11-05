import { withCommand } from '@/lib/server/api/with-command'
import { grantCover } from '@/lib/server/commands/users'
import { coverSchema } from '@/types/office/office.schemas'

export const POST = withCommand(coverSchema, grantCover)
