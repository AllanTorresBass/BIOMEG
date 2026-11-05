import { withCommand } from '@/lib/server/api/with-command'
import { searchClientRows } from '@/lib/server/commands/clients'
import { clientSearchSchema } from '@/types/clients/clients.schemas'

export const POST = withCommand(clientSearchSchema, searchClientRows)
