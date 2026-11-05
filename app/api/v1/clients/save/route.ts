import { withCommand } from '@/lib/server/api/with-command'
import { saveClient } from '@/lib/server/commands/clients'
import { saveClientSchema } from '@/types/clients/clients.schemas'

export const POST = withCommand(saveClientSchema, saveClient)
