import 'server-only'

import { allOrders } from '@/lib/db/memory/order-index'
import { worklistState } from '@/lib/server/domain/worklist'
import { guardRoute } from '@/lib/server/guard'
import { LAB_TIME_ZONE } from '@/lib/utils/format'
import type { OrderStub } from '@/types/domain/order-stub.types'
import type { StaffContext } from '@/types/session/session.types'
import type { WorklistState } from '@/types/orders/worklist.types'

export type OrderListState = WorklistState | 'ANULADA'

export interface OrderListRow {
  id: string
  number: string
  patient: string
  convenio: string | null
  sampleDate: string
  state: OrderListState
}

export interface OrderListView {
  kind: 'READY' | 'BLOCKED'
  rows: OrderListRow[]
  date: string
  stateFilter: string
}

const DAY_FORMAT = new Intl.DateTimeFormat('en-CA', {
  timeZone: LAB_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

function sampleDay(stub: OrderStub): string {
  return stub.sampleDate ?? DAY_FORMAT.format(new Date(stub.createdAt))
}

function listState(stub: OrderStub): OrderListState {
  if (stub.voided) return 'ANULADA'
  return worklistState(stub)
}

export async function getOrderList(
  context: StaffContext,
  filters: { date: string; state: string },
): Promise<OrderListView> {
  if (!(await guardRoute(context, ['order.open'], '/ordenes'))) {
    return { kind: 'BLOCKED', rows: [], date: filters.date, stateFilter: filters.state }
  }
  const rows = allOrders()
    .filter((stub) => {
      if (filters.date && sampleDay(stub) !== filters.date) return false
      const state = listState(stub)
      if (filters.state && filters.state !== 'TODOS' && state !== filters.state) return false
      return true
    })
    .map((stub) => ({
      id: stub.id,
      number: stub.number ?? stub.id,
      patient: stub.clientName,
      convenio: stub.convenioName ?? null,
      sampleDate: sampleDay(stub),
      state: listState(stub),
    }))
    .sort((a, b) => b.number.localeCompare(a.number))
  return { kind: 'READY', rows, date: filters.date, stateFilter: filters.state }
}
