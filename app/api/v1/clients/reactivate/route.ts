import { withCommand } from '@/lib/server/api/with-command'
import { reactivateClient } from '@/lib/server/commands/client-lifecycle'
import { lifecycleSchema } from '@/types/clients/clients.schemas'

export const POST = withCommand(lifecycleSchema, reactivateClient)
