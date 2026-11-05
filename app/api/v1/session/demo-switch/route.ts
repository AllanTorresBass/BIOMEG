import { withCommand } from '@/lib/server/api/with-command'
import { switchDemoUser } from '@/lib/server/commands/demo'
import { demoSwitchSchema } from '@/types/session/session.schemas'

export const POST = withCommand(demoSwitchSchema, switchDemoUser, { audience: 'public' })
