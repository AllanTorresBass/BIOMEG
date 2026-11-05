import { beforeEach, describe, expect, it, vi } from 'vitest'

const session = vi.hoisted(() => ({ roles: ['ADMINISTRACION'] as string[], stepUp: false }))

vi.mock('server-only', () => ({}))
vi.mock('next/headers', () => ({ headers: async () => new Headers() }))
vi.mock('next/cache', () => ({ revalidatePath: () => undefined }))
vi.mock('@/lib/server/session/current', () => ({
  getStaffContext: async () => ({
    session: { id: 's', workstation: 'PC-1', stepUpAt: session.stepUp ? Date.now() : null },
    account: { id: 'u', displayName: 'Demo', roles: session.roles },
    locked: false,
  }),
  toDecisionSession: () => ({ valid: true, active: true, userId: 'u', roles: session.roles }),
}))
vi.mock('@/lib/server/session/store', () => ({ isStepUpFresh: () => session.stepUp, getAccount: () => null }))

import { listAudit, resetAuditForTests } from '@/lib/db/memory/audit-store'
import { findNote, resetFiscalStore } from '@/lib/db/memory/fiscal-store'
import { createOrder, getOrder, setControlNumber } from '@/lib/db/memory/order-store'
import { computeOrderTotals } from '@/lib/domain/order-totals'
import { assignControlNumber, issueNote, reprintDocument } from '@/lib/server/commands/fiscal'
import { voidOrder } from '@/lib/server/commands/order-actions'

let keys = 0
function newOrder(priceUsd: string | null = '100.00', payments: { method: string; amount: string; bank: string; reference: string }[] = []) {
  keys += 1
  const lines = [{ id: 'l', examId: 'e', examName: 'Examen', priceUsd }] as never
  return createOrder(
    `fiscal-${keys}`,
    {
      clientId: 'c-1', clientName: 'Paciente Demo', path: 'PARTICULAR', physicianId: null, physicianName: null, convenioId: null, convenioName: null,
      titular: '', billing: { cedula: '', razonSocial: '', direccion: '' }, costType: null, motivo: '', sampleDate: null, lines, payments,
      discountPct: '0', discountMotivo: '', rateBs: '100.00', rateDate: '2026-11-04', ivaRate: null, igtfRate: null,
      totals: computeOrderTotals({ rate: '100.00', ivaRate: null, igtfRate: null, discountPct: '0', lines, payments: payments as never }),
      savedById: 'u', savedByName: 'u', savedAt: new Date().toISOString(),
    } as never,
    ['e'],
  )
}
const as = (roles: string[], stepUp = false) => Object.assign(session, { roles, stepUp })
const line = { description: 'Ajuste', amount: '10.00' }

beforeEach(() => {
  resetFiscalStore()
  resetAuditForTests()
  as(['ADMINISTRACION'])
})

describe('Control N°', () => {
  it('lets Administración assign once, and audits it', async () => {
    const order = newOrder()
    expect((await assignControlNumber({ orderId: order.id, number: 'C-100' })).ok).toBe(true)
    expect(getOrder(order.id)?.controlNumber).toBe('C-100')
    expect(listAudit().at(-1)?.what.command).toBe('control.assign')
    expect((await assignControlNumber({ orderId: order.id, number: 'C-101' })).ok).toBe(false)
  })

  it('never reuses a number', async () => {
    await assignControlNumber({ orderId: newOrder().id, number: 'C-200' })
    expect((await assignControlNumber({ orderId: newOrder().id, number: 'C-200' })).ok).toBe(false)
  })

  it('refuses Recepción', async () => {
    as(['RECEPCION'])
    const order = newOrder()
    expect((await assignControlNumber({ orderId: order.id, number: 'C-300' })).ok).toBe(false)
    expect(getOrder(order.id)?.controlNumber).toBe('Pendiente')
  })
})

describe('Notes', () => {
  it('needs a password re-entry', async () => {
    expect((await issueNote({ orderId: newOrder().id, kind: 'CREDITO', lines: [line] })).need).toBe('STEP_UP')
  })

  it('issues a new document with its own number, leaving the factura alone', async () => {
    as(['ADMINISTRACION'], true)
    const order = newOrder()
    const before = structuredClone(getOrder(order.id))
    const result = await issueNote({ orderId: order.id, kind: 'DEBITO', lines: [line, { description: 'Otro', amount: '5,50' }] })
    expect(result.ok).toBe(true)
    expect(getOrder(order.id)).toEqual(before)
    expect(findNote('DEBITO', 'ND-000001')).toMatchObject({ total: '15.50', invoiceNumber: order.invoiceNumber, rateBs: '100.00' })
    expect(listAudit().at(-1)?.what.command).toBe('note.issue')
  })

  it.each([['0'], ['abc']])('refuses the amount %s', async (amount) => {
    as(['ADMINISTRACION'], true)
    expect((await issueNote({ orderId: newOrder().id, kind: 'CREDITO', lines: [{ description: 'x', amount }] })).ok).toBe(false)
  })

  it('refuses Recepción', async () => {
    as(['RECEPCION'], true)
    expect((await issueNote({ orderId: newOrder().id, kind: 'CREDITO', lines: [line] })).ok).toBe(false)
  })

  it('shares one credit sequence with voids, so a number is never reused (E-50)', async () => {
    as(['ADMINISTRACION'], true)
    const paid = newOrder('100.00', [{ method: 'EFECTIVO_USD', amount: '10.00', bank: '', reference: '' }])
    const voided = await voidOrder({ orderId: paid.id, confirmed: true, motivo: 'Error' })
    expect(voided.ok).toBe(true)
    const credit = getOrder(paid.id)?.voided?.creditNote
    expect(credit).toBeTruthy()
    expect(findNote('CREDITO', credit!)).toMatchObject({ total: '10.00' })
    await issueNote({ orderId: newOrder().id, kind: 'CREDITO', lines: [line] })
    const next = Number(credit!.slice(3)) + 1
    expect(findNote('CREDITO', `NC-${String(next).padStart(6, '0')}`)).not.toBeNull()
  })
})

describe('Reprints', () => {
  it('refuses a factura with no Control N°', async () => {
    const order = newOrder()
    expect(await reprintDocument({ kind: 'factura', number: order.invoiceNumber })).toMatchObject({ ok: false, message: 'Falta el número de control.' })
  })

  it('refuses a factura with a SIN PRECIO line', async () => {
    const order = newOrder(null)
    setControlNumber(order.id, 'C-400')
    expect((await reprintDocument({ kind: 'factura', number: order.number })).ok).toBe(false)
  })

  it('opens the stored factura, keeps its number and rate, and allocates nothing', async () => {
    as(['RECEPCION'])
    const order = newOrder()
    setControlNumber(order.id, 'C-500')
    const before = structuredClone(getOrder(order.id))
    const first = await reprintDocument({ kind: 'factura', number: order.invoiceNumber })
    const second = await reprintDocument({ kind: 'factura', number: order.invoiceNumber })
    expect(first.ok && first.document.number).toBe(order.invoiceNumber)
    expect(second.ok && second.document.number).toBe(order.invoiceNumber)
    expect(first.ok && first.document.rows.some((row) => row.value === '100,00')).toBe(true)
    expect(getOrder(order.id)).toEqual(before)
    const rows = listAudit().filter((row) => row.what.command === 'document.reprint')
    expect(rows).toHaveLength(2)
    expect(rows[0]?.who.displayName).toBe('Demo')
  })

  it('invents no fiscal fields', async () => {
    const order = newOrder()
    setControlNumber(order.id, 'C-600')
    const result = await reprintDocument({ kind: 'factura', number: order.number })
    expect(JSON.stringify(result)).not.toMatch(/SENIAT|Providencia|Imprenta|Domicilio fiscal/i)
  })

  it('orders need no Control N°, and carry no prices', async () => {
    as(['RECEPCION'])
    const result = await reprintDocument({ kind: 'orden-entrega', number: newOrder().number })
    expect(result.ok && result.document.lines[0]?.amount).toBeNull()
  })

  it('keeps notes from Recepción', async () => {
    as(['ADMINISTRACION'], true)
    await issueNote({ orderId: newOrder().id, kind: 'CREDITO', lines: [line] })
    as(['RECEPCION'])
    expect((await reprintDocument({ kind: 'nota-credito', number: 'NC-000001' })).ok).toBe(false)
    expect(listAudit().at(-1)?.result.outcome).toBe('REFUSED')
  })

  it('answers not found for a wrong number', async () => {
    expect((await reprintDocument({ kind: 'factura', number: 'nada' })).ok).toBe(false)
  })
})
