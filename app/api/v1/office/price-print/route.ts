import { z } from 'zod'
import { withCommand } from '@/lib/server/api/with-command'
import { printPrices } from '@/lib/server/commands/prices'

export const POST = withCommand(z.strictObject({}), () => printPrices())
