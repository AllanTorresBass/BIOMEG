import { withCommand } from '@/lib/server/api/with-command'
import { setRate } from '@/lib/server/commands/prices'
import { setRateSchema } from '@/types/office/office.schemas'

export const POST = withCommand(setRateSchema, setRate)
