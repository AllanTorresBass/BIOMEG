import 'server-only'

import { decide } from '@/lib/auth/decide'
import { allSavedOrders, findOrderByNumber } from '@/lib/db/memory/order-store'
import { guardRoute } from '@/lib/server/guard'
import { toDecisionSession } from '@/lib/server/session/current'
import { strings } from '@/lib/strings'
import type { InvoiceLookup, NoteKind, PendingControlRow, ReprintKind } from '@/types/orders/fiscal.types'
import type { StaffContext } from '@/types/session/session.types'

const NOTE_COMMANDS: Record<NoteKind, string> = { CREDITO: 'note.credit', DEBITO: 'note.debit' }

export const REPRINT_ROUTE_COMMANDS: Record<ReprintKind, string> = {
  factura: 'reprint.invoice',
  'orden-entrega': 'reprint.delivery_order',
  'orden-empresa': 'reprint.company_order',
  'nota-credito': 'reprint.notes',
  'nota-debito': 'reprint.notes',
}

export async function getControlScreen(context: StaffContext) {
  if (!(await guardRoute(context, ['control.assign'], '/documentos/control'))) return { kind: 'BLOCKED' } as const
  const rows: PendingControlRow[] = allSavedOrders()
    .filter((order) => order.state !== 'ANULADA' && order.controlNumber === strings.orders.controlPending)
    .map((order) => ({
      orderId: order.id,
      number: order.number,
      invoiceNumber: order.invoiceNumber,
      clientName: order.clientName,
      totalUsd: order.totals.totalUsd,
      hasSinPrecio: order.lines.some((line) => line.priceUsd === null),
    }))
  return { kind: 'READY', rows } as const
}

export async function canIssueNote(context: StaffContext, kind: NoteKind): Promise<boolean> {
  return guardRoute(context, [NOTE_COMMANDS[kind]], '/documentos/nota')
}

export async function canReprint(context: StaffContext, kind: ReprintKind): Promise<boolean> {
  return guardRoute(context, [REPRINT_ROUTE_COMMANDS[kind]], `/documentos/reimprimir/${kind}`)
}

/** For the note form. Same people as the note, checked with the gesture set aside: the note itself asks for it. */
export function findInvoice(context: StaffContext, number: string): InvoiceLookup | null {
  if (context.locked) return null
  const decision = decide({ session: toDecisionSession(context), command: 'note.credit', gestures: { stepUpVerified: true } })
  if (!decision.allowed) return null
  const order = findOrderByNumber(number.trim())
  return order
    ? { orderId: order.id, invoiceNumber: order.invoiceNumber, clientName: order.clientName, totalUsd: order.totals.totalUsd }
    : null
}
