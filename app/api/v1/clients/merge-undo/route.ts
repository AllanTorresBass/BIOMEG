import { withCommand } from '@/lib/server/api/with-command'
import { undoMerge } from '@/lib/server/commands/client-lifecycle'
import { undoMergeSchema } from '@/types/clients/clients.schemas'

export const POST = withCommand(undoMergeSchema, undoMerge)
