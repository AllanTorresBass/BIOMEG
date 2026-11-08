import { OrderRecord } from '@/components/orders/OrderRecord'
import { BlockedNotice } from '@/components/shared/BlockedNotice'
import { mayReach } from '@/lib/server/guard'
import { getOrderScreen } from '@/lib/server/queries/orders'
import { requireReadyStaff } from '@/lib/server/session/require'
import { strings } from '@/lib/strings'
import { LAB_TIME_ZONE } from '@/lib/utils/format'
import type { SearchParams } from '@/types/app/page.types'

const text = strings.pendingReview.orders

function timeText(iso: string): string {
  return new Intl.DateTimeFormat('es-VE', { timeZone: LAB_TIME_ZONE, dateStyle: 'short', timeStyle: 'short' }).format(new Date(iso))
}

function one(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? '') : (value ?? '')
}

export default async function OrderPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: SearchParams
}) {
  const context = await requireReadyStaff()
  if (context.locked) return null
  const { id } = await params
  const query = await searchParams
  const fromWorklist = one(query.desde) === 'hoja'
  const screen = await getOrderScreen(context, id)
  if (screen.kind === 'BLOCKED') return <BlockedNotice />
  if (screen.kind === 'MISSING') return <p className="text-muted-foreground">{text.orderMissing}</p>
  const { order } = screen
  const voidBanner =
    order.voided ? text.voidBanner(order.voided.byName, timeText(order.voided.at), order.voided.motivo) : null

  return (
    <OrderRecord
      order={order}
      voidBanner={voidBanner}
      fromWorklist={fromWorklist}
      canEnterResults={mayReach(context, ['result.read', 'result.enter'])}
      canOpenReport={mayReach(context, ['report.print.patient', 'report.print.single'])}
    />
  )
}
