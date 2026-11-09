import 'server-only'

import { getOrder } from '@/lib/db/memory/order-store'
import { getQuote } from '@/lib/db/memory/quote-store'
import { guardRoute } from '@/lib/server/guard'
import type { StaffContext } from '@/types/session/session.types'

export async function getOrderScreen(context: StaffContext, id: string) {
  if (!(await guardRoute(context, ['order.open'], `/ordenes/${id}`))) return { kind: 'BLOCKED' } as const
  const order = getOrder(id)
  return order ? ({ kind: 'READY', order } as const) : ({ kind: 'MISSING' } as const)
}

export async function getQuoteScreen(context: StaffContext, id: string) {
  if (!(await guardRoute(context, ['quote.create'], `/ordenes/presupuesto/${id}`))) return { kind: 'BLOCKED' } as const
  const quote = getQuote(id)
  return quote ? ({ kind: 'READY', quote } as const) : ({ kind: 'MISSING' } as const)
}
