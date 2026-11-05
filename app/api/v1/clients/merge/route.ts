import { withCommand } from '@/lib/server/api/with-command'
import { mergeClientRecords } from '@/lib/server/commands/client-lifecycle'
import { mergeSchema } from '@/types/clients/clients.schemas'

export const POST = withCommand(mergeSchema, mergeClientRecords)
