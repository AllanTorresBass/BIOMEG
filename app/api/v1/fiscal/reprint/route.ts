import { withCommand } from '@/lib/server/api/with-command'
import { reprintDocument } from '@/lib/server/commands/fiscal'
import { reprintSchema } from '@/types/orders/fiscal.schemas'

export const POST = withCommand(reprintSchema, reprintDocument)
