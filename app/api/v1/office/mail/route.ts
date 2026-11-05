import { withCommand } from '@/lib/server/api/with-command'
import { saveMail } from '@/lib/server/commands/maintenance'
import { mailSchema } from '@/types/office/office.schemas'

export const POST = withCommand(mailSchema, saveMail)
