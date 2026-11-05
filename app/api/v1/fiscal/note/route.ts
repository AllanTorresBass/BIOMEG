import { withCommand } from '@/lib/server/api/with-command'
import { issueNote } from '@/lib/server/commands/fiscal'
import { issueNoteSchema } from '@/types/orders/fiscal.schemas'

export const POST = withCommand(issueNoteSchema, issueNote)
