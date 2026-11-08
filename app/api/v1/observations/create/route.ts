import { withCommand } from '@/lib/server/api/with-command'
import { createObservation } from '@/lib/server/commands/observations'
import { createObservationSchema } from '@/types/observations/observation.schemas'

export const POST = withCommand(createObservationSchema, createObservation)
