import { withCommand } from '@/lib/server/api/with-command'
import { searchPatients } from '@/lib/server/commands/order-draft'
import { draftPatientSearchSchema } from '@/types/orders/orders.schemas'

export const POST = withCommand(draftPatientSearchSchema, searchPatients)
