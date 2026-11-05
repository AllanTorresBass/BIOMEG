import { withCommand } from '@/lib/server/api/with-command'
import { editPrice } from '@/lib/server/commands/prices'
import { editPriceSchema } from '@/types/office/office.schemas'

export const POST = withCommand(editPriceSchema, editPrice)
