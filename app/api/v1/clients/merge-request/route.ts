import { withCommand } from '@/lib/server/api/with-command'
import { requestMerge } from '@/lib/server/commands/client-lifecycle'
import { requestMergeSchema } from '@/types/clients/clients.schemas'

export const POST = withCommand(requestMergeSchema, requestMerge)
