import { withCommand } from '@/lib/server/api/with-command'
import { setQr } from '@/lib/server/commands/prices'
import { switchSchema } from '@/types/office/office.schemas'

export const POST = withCommand(switchSchema, setQr)
