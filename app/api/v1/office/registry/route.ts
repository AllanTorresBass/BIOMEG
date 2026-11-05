import { withCommand } from '@/lib/server/api/with-command'
import { saveRegistryRow } from '@/lib/server/commands/registries'
import { registrySaveSchema } from '@/types/office/office.schemas'

export const POST = withCommand(registrySaveSchema, saveRegistryRow)
