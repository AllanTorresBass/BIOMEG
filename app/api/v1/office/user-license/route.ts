import { withCommand } from '@/lib/server/api/with-command'
import { grantBioanalista } from '@/lib/server/commands/users'
import { grantBioanalistaSchema } from '@/types/office/office.schemas'

export const POST = withCommand(grantBioanalistaSchema, grantBioanalista)
