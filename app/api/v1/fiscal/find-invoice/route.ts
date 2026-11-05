import { withCommand } from '@/lib/server/api/with-command'
import { findInvoice } from '@/lib/server/queries/fiscal'
import { getStaffContext } from '@/lib/server/session/current'
import { findInvoiceSchema } from '@/types/orders/fiscal.schemas'

export const POST = withCommand(findInvoiceSchema, async ({ number }) => {
  const context = await getStaffContext()
  return { invoice: context ? findInvoice(context, number) : null }
})
