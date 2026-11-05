import { withCommand } from '@/lib/server/api/with-command'
import { correctCedula } from '@/lib/server/commands/client-lifecycle'
import { correctCedulaSchema } from '@/types/clients/clients.schemas'

export const POST = withCommand(correctCedulaSchema, correctCedula)
