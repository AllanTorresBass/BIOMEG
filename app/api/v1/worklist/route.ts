import { withQuery } from '@/lib/server/api/with-command'
import { fetchWorklist } from '@/lib/server/commands/worklist'
import { worklistQuerySchema } from '@/types/orders/orders.schemas'

export const GET = withQuery(worklistQuerySchema, ({ date, reviewOnly }) => fetchWorklist(date, reviewOnly === '1'))
