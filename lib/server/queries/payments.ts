import 'server-only'

import { decide } from '@/lib/auth/decide'
import { PAYMENT_METHODS } from '@/lib/config/payment-methods'
import { findOrderByNumber, getOrder } from '@/lib/db/memory/order-store'
import { allCloses, allEntries, allMonthCloses, getEntry, monthCloseOf, openEntriesOf } from '@/lib/db/memory/payment-store'
import { currencyOf } from '@/lib/domain/cash'
import { summarizeEntries } from '@/lib/server/domain/cash-summary'
import { todayInLab } from '@/lib/server/domain/client-rules'
import { guardRoute } from '@/lib/server/guard'
import { getAccount } from '@/lib/server/session/accounts'
import { isStepUpFresh } from '@/lib/server/session/store'
import { toDecisionSession } from '@/lib/server/session/current'
import { formatDate, formatMoney, formatTime } from '@/lib/utils/format'
import type { DecisionReason, DecisionSession } from '@/types/auth/auth.types'
import type { SavedOrder } from '@/types/orders/order.types'
import type { AbonoOrderView, CloseRow, DrawerOption, PaymentEntry, PaymentRow, SelfReversalRow } from '@/types/orders/payment.types'
import type { StaffContext } from '@/types/session/session.types'

// A missing gesture still shows the button; the command asks for it.
const ASKS_FOR_GESTURE: readonly DecisionReason[] = ['CONFIRM', 'STEP_UP', 'MOTIVO_REQUIRED']

function atText(iso: string): string {
  return `${formatDate(iso)} ${formatTime(iso)}`
}

function methodLabel(entry: PaymentEntry): string {
  return PAYMENT_METHODS.find((method) => method.id === entry.method)?.label ?? entry.method
}

function toOrderView(order: SavedOrder): AbonoOrderView {
  return {
    orderId: order.id,
    number: order.number,
    invoiceNumber: order.invoiceNumber,
    clientName: order.clientName,
    totalUsd: order.totals.totalUsd,
    abono: order.totals.abono,
    resta: order.totals.resta,
    rate: order.rateBs,
    voided: order.state === 'ANULADA',
  }
}

export async function getAbonoScreen(context: StaffContext, orderId: string) {
  if (!(await guardRoute(context, ['payment.abono'], '/pagos/abono'))) return { kind: 'BLOCKED' } as const
  const order = orderId ? getOrder(orderId) : null
  return { kind: 'READY', order: order ? toOrderView(order) : null } as const
}

/** The number typed at the desk. Same rule as the screen: only those who may record a payment. */
export function findAbonoOrder(context: StaffContext, number: string): AbonoOrderView | null {
  if (context.locked) return null
  if (!decide({ session: toDecisionSession(context), command: 'payment.abono' }).allowed) return null
  const order = findOrderByNumber(number.trim())
  return order ? toOrderView(order) : null
}

function canReverse(session: DecisionSession, entry: PaymentEntry, voided: boolean): boolean {
  if (entry.reversesId || entry.reversedById || voided) return false
  const decision = decide({
    session,
    command: 'payment.reverse',
    facts: { same_day: todayInLab(new Date(entry.at)) === todayInLab() },
    record: { ownerUserId: entry.byId },
    gestures: { confirmVerified: true, stepUpVerified: true, motivo: 'consulta' },
  })
  return decision.allowed || ASKS_FOR_GESTURE.includes(decision.reason)
}

/** R-072, per row. Recepción reads only its own rows, enforced here and not on screen. */
export async function getRegistryScreen(context: StaffContext) {
  if (!(await guardRoute(context, ['payments.registry'], '/pagos/registro'))) return { kind: 'BLOCKED' } as const
  const session = toDecisionSession(context)
  const readable = allEntries().filter(
    (entry) => decide({ session, command: 'payments.registry', record: { ownerUserId: entry.byId }, mode: 'read' }).allowed,
  )
  const rows: PaymentRow[] = [...readable]
    .sort((a, b) => b.at.localeCompare(a.at) || b.id.localeCompare(a.id))
    .map((entry) => ({
      id: entry.id,
      atText: atText(entry.at),
      invoiceNumber: entry.invoiceNumber,
      methodLabel: methodLabel(entry),
      bank: entry.bank,
      reference: entry.reference,
      amountText: `${entry.reversesId ? '-' : ''}${formatMoney(entry.amount.replace(',', '.'))}`,
      currency: currencyOf(entry.method),
      byName: entry.byName,
      workstation: entry.workstation,
      status: entry.reversesId ? 'REVERSO' : entry.reversedById ? 'REVERSADO' : 'VIGENTE',
      canReverse: canReverse(session, entry, getOrder(entry.orderId)?.state === 'ANULADA'),
    }))

  const seesAll = context.account.roles.includes('ADMINISTRACION')
  const selfReversals: SelfReversalRow[] = seesAll
    ? allEntries()
        .filter((entry) => entry.reversesId && getEntry(entry.reversesId)?.byId === entry.byId)
        .map((entry) => ({
          id: entry.id,
          atText: atText(entry.at),
          invoiceNumber: entry.invoiceNumber,
          byName: entry.byName,
          amountText: formatMoney(entry.amount.replace(',', '.')),
          currency: currencyOf(entry.method),
          motivo: entry.motivo ?? '',
        }))
    : []
  return { kind: 'READY', rows, selfReversals, seesAll } as const
}

function mayCloseFor(session: DecisionSession, ownerId: string): boolean {
  const decision = decide({ session, command: 'cash.close', record: { ownerUserId: ownerId }, gestures: { stepUpVerified: true, motivo: 'consulta' } })
  return decision.allowed || ASKS_FOR_GESTURE.includes(decision.reason)
}

export async function getCashScreen(context: StaffContext, requestedUserId: string) {
  if (!(await guardRoute(context, ['cash.close'], '/pagos/cierre'))) return { kind: 'BLOCKED' } as const
  const session = toDecisionSession(context)
  const self = context.account

  const ownerIds = new Set([self.id, ...allEntries().filter((entry) => entry.closeId === null).map((entry) => entry.byId)])
  const drawers: DrawerOption[] = []
  for (const id of ownerIds) {
    if (!mayCloseFor(session, id)) continue
    const account = await getAccount(id)
    drawers.push({ id, name: account?.displayName ?? id })
  }

  const userId = drawers.some((drawer) => drawer.id === requestedUserId) ? requestedUserId : self.id
  const mayReopen = decide({ session, command: 'cash.reopen', gestures: { stepUpVerified: true, motivo: 'consulta' } }).allowed
  const closes: CloseRow[] = allCloses()
    .filter((close) => mayReopen || close.userId === self.id)
    .map((close) => ({
      id: close.id,
      atText: atText(close.at),
      userName: close.userName,
      closedByName: close.closedByName,
      totalUsd: close.summary.totalUsd,
      totalBs: close.summary.totalBs,
      restaOpen: close.summary.restaOpen,
      reopened: close.reopenedAt !== null,
      canReopen: mayReopen && close.reopenedAt === null,
    }))
    .reverse()

  return {
    kind: 'READY',
    userId,
    isOwn: userId === self.id,
    drawers,
    summary: summarizeEntries(openEntriesOf(userId)),
    closes,
  } as const
}

export async function getMonthScreen(context: StaffContext) {
  if (!(await guardRoute(context, ['month.close'], '/pagos/cierre-mensual'))) return { kind: 'BLOCKED' } as const
  const currentMonth = todayInLab().slice(0, 7)
  return {
    kind: 'READY',
    currentMonth,
    currentClosed: monthCloseOf(currentMonth) !== null,
    closes: allMonthCloses().map((close) => ({ month: close.month, byName: close.byName, atText: atText(close.at) })),
    stepUpFresh: isStepUpFresh(context.session),
  } as const
}
