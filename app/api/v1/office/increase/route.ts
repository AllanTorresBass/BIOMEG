import { withCommand } from '@/lib/server/api/with-command'
import { increasePrices } from '@/lib/server/commands/prices'
import { increaseSchema } from '@/types/office/office.schemas'

export const POST = withCommand(increaseSchema, increasePrices)
