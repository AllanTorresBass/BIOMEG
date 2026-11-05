import { z } from 'zod'
import { withCommand } from '@/lib/server/api/with-command'
import { runBackup } from '@/lib/server/commands/maintenance'

export const POST = withCommand(z.strictObject({ confirmed: z.boolean().optional() }), runBackup)
