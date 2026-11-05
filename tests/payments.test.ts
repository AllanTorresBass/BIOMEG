import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const session = vi.hoisted(() => ({ userId: 'u-recepcion', roles: ['RECEPCION'] as string[], stepUp: false }))

vi.mock('server-only', () => ({}))
vi.mock('next/headers', () => ({ headers: async () => new Headers() }))
vi.mock('next/cache', () => ({ revalidatePath: () => undefined }))
vi.mock('@/lib/server/session/current', () => ({
  getStaffContext: async () => ({
    session: { id: 's', workstation: session.userId === 'u-recepcion' ? 'PC-1' : 'PC-9', stepUpAt: session.stepUp ? Date.now() : null },
    account: { id: session.userId, displayName: session.userId, roles: session.roles },
    locked: false,
  }),
  toDecisionSession: () => ({ valid: true, active: true, userId: session.userId, roles: session.roles }),
}))
vi.mock('@/lib/server/session/store', () => ({
  isStepUpFresh: () => session.stepUp,
  getAccount: (id: string) => ({ id, displayName: id }),
}))

import { listAudit, resetAuditForTests } from '@/lib/db/memory/audit-store'
import { createOrder, getOrder, voidSavedOrder } from '@/lib/db/memory/order-store'
import { allCloses, allEntries, getEntry, openEntriesOf, resetPaymentStore } from '@/lib/db/memory/payment-store'
import { cashTotalsOf, totalsByWorkstation } from '@/lib/domain/cash'
import { computeOrderTotals } from '@/lib/domain/order-totals'
import { addAbono, closeCash, closeMonth, reopenCash, reversePayment } from '@/lib/server/commands/payments'
import { getRegistryScreen } from '@/lib/server/queries/payments'
import type { PaymentEntry } from '@/types/orders/payment.types'

let keyCounter = 0
function newOrder(priceUsd = '100.00') {
  keyCounter += 1
  const lines = [{ id: 'l', examId: 'e', examName: 'Examen', priceUsd }] as never
  const base = { rate: '100.00', ivaRate: null, igtfRate: null, discountPct: '0' }
  return createOrder(
    `k-${keyCounter}`,
    {
      clientId: 'c-1', clientName: 'Paciente Demo', path: 'PARTICULAR', physicianId: null, physicianName: null, convenioId: null, convenioName: null,
      titular: '', billing: { cedula: '', razonSocial: '', direccion: '' }, costType: null, motivo: '', sampleDate: null, lines, payments: [],
      discountPct: '0', discountMotivo: '', rateBs: '100.00', rateDate: '2026-11-04', ivaRate: null, igtfRate: null,
      totals: computeOrderTotals({ ...base, lines, payments: [] }),
      savedById: 'u', savedByName: 'u', savedAt: new Date().toISOString(),
    } as never,
    ['e'],
  )
}
const asRecepcion = (userId = 'u-recepcion') => Object.assign(session, { userId, roles: ['RECEPCION'], stepUp: false })
const asAdmin = (stepUp = false) => Object.assign(session, { userId: 'u-administracion', roles: ['ADMINISTRACION'], stepUp })
const abono = (orderId: string, amount = '40.00', method: PaymentEntry['method'] = 'EFECTIVO_USD') =>
  addAbono({ orderId, method, amount, bank: '', reference: '' })

beforeEach(() => {
  resetPaymentStore()
  resetAuditForTests()
  asRecepcion()
})
afterEach(() => vi.useRealTimers())

describe('Agregar abono', () => {
  it('raises Abono, lowers Resta, leaves the invoice open, and audits', async () => {
    const order = newOrder()
    expect((await abono(order.id)).ok).toBe(true)
    expect(getOrder(order.id)?.totals).toMatchObject({ abono: '40.00', resta: '60.00' })
    expect(getOrder(order.id)?.state).toBe('ABIERTA')
    expect(listAudit().some((row) => row.what.command === 'payment.record' && row.result.outcome === 'ALLOWED')).toBe(true)
  })

  it('converts bolívares at the rate saved on the invoice', async () => {
    const order = newOrder()
    await abono(order.id, '1000.00', 'EFECTIVO_BS')
    expect(getOrder(order.id)?.totals.abono).toBe('10.00')
  })

  it.each([['0'], ['abc'], ['-5']])('refuses the amount %s', async (amount) => {
    expect((await abono(newOrder().id, amount)).ok).toBe(false)
  })

  it('refuses more than Resta', async () => {
    const order = newOrder()
    expect((await abono(order.id, '100.01')).ok).toBe(false)
    expect(allEntries()).toHaveLength(0)
  })

  it('refuses a voided order, and audits it', async () => {
    const order = newOrder()
    voidSavedOrder(order.id, { motivo: 'x', byId: 'u', byName: 'u', withCreditNote: false })
    expect((await abono(order.id)).ok).toBe(false)
    expect(allEntries()).toHaveLength(0)
    expect(listAudit().at(-1)).toMatchObject({ what: { command: 'payment.record' }, result: { outcome: 'REFUSED' } })
  })

  it('refuses roles with no row', async () => {
    Object.assign(session, { userId: 'u-auxiliar', roles: ['AUXILIAR'] })
    expect((await abono(newOrder().id)).ok).toBe(false)
    expect(allEntries()).toHaveLength(0)
  })
})

describe('reversing a payment', () => {
  it('asks Recepción for a confirm, then a motivo, on its own same-day payment', async () => {
    const order = newOrder()
    await abono(order.id)
    const id = allEntries()[0]!.id
    expect((await reversePayment({ paymentId: id })).need).toBe('CONFIRM_OVERRIDE')
    expect((await reversePayment({ paymentId: id, confirmed: true })).need).toBe('MOTIVO')
    const done = await reversePayment({ paymentId: id, confirmed: true, motivo: 'Error de monto' })
    expect(done.ok).toBe(true)
  })

  it('keeps the original row, adds a reversal, and restores the totals', async () => {
    const order = newOrder()
    await abono(order.id)
    const id = allEntries()[0]!.id
    await reversePayment({ paymentId: id, confirmed: true, motivo: 'Error' })
    expect(allEntries()).toHaveLength(2)
    expect(getEntry(id)?.reversedById).toBe(allEntries()[1]!.id)
    expect(getOrder(order.id)?.totals).toMatchObject({ abono: '0.00', resta: '100.00' })
    expect((await reversePayment({ paymentId: id, confirmed: true, motivo: 'Otra vez' })).ok).toBe(false)
  })

  it("refuses Recepción someone else's payment", async () => {
    const order = newOrder()
    await abono(order.id)
    asRecepcion('u-otra')
    const answer = await reversePayment({ paymentId: allEntries()[0]!.id, confirmed: true, motivo: 'x' })
    expect(answer).toMatchObject({ ok: false, need: null })
    expect(listAudit().at(-1)?.result.reason).toBe('OWNERSHIP')
  })

  it("refuses Recepción its own payment from another day", async () => {
    const order = newOrder()
    await abono(order.id)
    allEntries()[0]!.at = new Date(Date.now() - 3 * 86_400_000).toISOString()
    expect((await reversePayment({ paymentId: allEntries()[0]!.id, confirmed: true, motivo: 'x' })).ok).toBe(false)
  })

  it('makes Administración re-enter the password, with a motivo', async () => {
    const order = newOrder()
    await abono(order.id)
    const id = allEntries()[0]!.id
    asAdmin(false)
    expect((await reversePayment({ paymentId: id, motivo: 'x' })).need).toBe('STEP_UP')
    asAdmin(true)
    expect((await reversePayment({ paymentId: id })).need).toBe('MOTIVO')
    expect((await reversePayment({ paymentId: id, motivo: 'Ajuste' })).ok).toBe(true)
  })
})

describe('Registro de pagos', () => {
  it('shows Recepción only its own rows, and Administración all of them', async () => {
    const order = newOrder()
    await abono(order.id, '10.00')
    asRecepcion('u-otra')
    await abono(order.id, '20.00')
    const own = await getRegistryScreen((await (await import('@/lib/server/session/current')).getStaffContext())!)
    expect(own.kind === 'READY' && own.rows.map((row) => row.byName)).toEqual(['u-otra'])
    asAdmin()
    const all = await getRegistryScreen((await (await import('@/lib/server/session/current')).getStaffContext())!)
    expect(all.kind === 'READY' && all.rows).toHaveLength(2)
  })

  it('lists same-user reversals for review, for Administración only (E-47)', async () => {
    const order = newOrder()
    await abono(order.id)
    await reversePayment({ paymentId: allEntries()[0]!.id, confirmed: true, motivo: 'Error' })
    const context = (await import('@/lib/server/session/current')).getStaffContext
    const rec = await getRegistryScreen((await context())!)
    expect(rec.kind === 'READY' && rec.selfReversals).toHaveLength(0)
    asAdmin()
    const admin = await getRegistryScreen((await context())!)
    expect(admin.kind === 'READY' && admin.selfReversals).toHaveLength(1)
  })
})

describe('Cierre de caja', () => {
  it('closes without deleting payments, and lists open apart from paid', async () => {
    const open = newOrder()
    const paid = newOrder('40.00')
    await abono(open.id)
    await abono(paid.id)
    expect((await closeCash({ userId: 'u-recepcion' })).ok).toBe(true)
    expect(allEntries()).toHaveLength(2)
    const { summary } = allCloses()[0]!
    expect(summary).toMatchObject({ totalUsd: '80.00', restaOpen: '60.00', entryCount: 2 })
    expect(summary.openInvoices.map((row) => row.orderId)).toEqual([open.id])
    expect(summary.paidInvoices.map((row) => row.orderId)).toEqual([paid.id])
  })

  it('sends a payment after the close to the next period, keeping its real time (E-48)', async () => {
    const order = newOrder()
    await abono(order.id)
    await closeCash({ userId: 'u-recepcion' })
    await abono(order.id, '5.00')
    const open = openEntriesOf('u-recepcion')
    expect(open).toHaveLength(1)
    expect(open[0]!.amount).toBe('5.00')
    expect(allCloses()[0]!.entryIds).toHaveLength(1)
  })

  it('refuses an empty close', async () => {
    expect((await closeCash({ userId: 'u-recepcion' })).ok).toBe(false)
  })

  it("refuses Recepción another user's drawer", async () => {
    await abono(newOrder().id)
    asRecepcion('u-otra')
    expect((await closeCash({ userId: 'u-recepcion' })).ok).toBe(false)
    expect(allCloses()).toHaveLength(0)
  })

  it("makes Administración re-enter and give a motivo for another's drawer (E-49)", async () => {
    await abono(newOrder().id)
    asAdmin(false)
    expect((await closeCash({ userId: 'u-recepcion' })).need).toBe('STEP_UP')
    asAdmin(true)
    expect((await closeCash({ userId: 'u-recepcion' })).need).toBe('MOTIVO')
    expect((await closeCash({ userId: 'u-recepcion', motivo: 'Ausente' })).ok).toBe(true)
    expect(allCloses()[0]).toMatchObject({ userId: 'u-recepcion', closedById: 'u-administracion', motivo: 'Ausente' })
  })

  it('reopens with a re-entry and motivo, keeping the close and freeing its rows', async () => {
    await abono(newOrder().id)
    await closeCash({ userId: 'u-recepcion' })
    const id = allCloses()[0]!.id
    expect((await reopenCash({ closeId: id, motivo: 'x' })).ok).toBe(false)
    asAdmin(true)
    expect((await reopenCash({ closeId: id })).need).toBe('MOTIVO')
    expect((await reopenCash({ closeId: id, motivo: 'Faltó un pago' })).ok).toBe(true)
    expect(allCloses()).toHaveLength(1)
    expect(openEntriesOf('u-recepcion')).toHaveLength(1)
    expect((await reopenCash({ closeId: id, motivo: 'Otra vez' })).ok).toBe(false)
  })

  it('counts both workstations for one person (E-13)', () => {
    const entry = (workstation: string, amount: string): PaymentEntry => ({ workstation, amount, method: 'EFECTIVO_USD', reversesId: null } as PaymentEntry)
    const entries = [entry('PC-1', '10.00'), entry('PC-2', '5.00')]
    expect(cashTotalsOf(entries).totalUsd).toBe('15.00')
    expect(totalsByWorkstation(entries).map((row) => row.workstation)).toEqual(['PC-1', 'PC-2'])
  })

  it('subtracts a reversal in the period it was made', () => {
    const entries = [
      { amount: '10.00', method: 'EFECTIVO_USD', reversesId: null },
      { amount: '4.00', method: 'EFECTIVO_USD', reversesId: 'pay-1' },
    ] as PaymentEntry[]
    expect(cashTotalsOf(entries).totalUsd).toBe('6.00')
  })
})

describe('Cierre mensual', () => {
  it('needs a re-entry, and does not run the daily close', async () => {
    await abono(newOrder().id)
    asAdmin(false)
    expect((await closeMonth({ month: '2026-11' })).need).toBe('STEP_UP')
    asAdmin(true)
    expect((await closeMonth({ month: '2026-11' })).ok).toBe(true)
    expect(allCloses()).toHaveLength(0)
    expect(openEntriesOf('u-recepcion')).toHaveLength(1)
    expect((await closeMonth({ month: '2026-11' })).ok).toBe(false)
  })

  it('refuses Recepción', async () => {
    expect((await closeMonth({ month: '2026-11' })).ok).toBe(false)
  })
})
