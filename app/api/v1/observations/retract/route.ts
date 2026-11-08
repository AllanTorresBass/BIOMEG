import { withCommand } from '@/lib/server/api/with-command'
import { retractObservation } from '@/lib/server/commands/observations'
import { retractObservationSchema } from '@/types/observations/observation.schemas'

export const POST = withCommand(retractObservationSchema, retractObservation)
