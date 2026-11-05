import { withCommand } from '@/lib/server/api/with-command'
import { findAbonoOrder } from '@/lib/server/queries/payments'
import { getStaffContext } from '@/lib/server/session/current'
import { findOrderSchema } from '@/types/orders/payments.schemas'

export const POST = withCommand(findOrderSchema, async ({ number }) => {
  const context = await getStaffContext()
  return { order: context ? findAbonoOrder(context, number) : null }
})
