import { describe, expect, it } from 'vitest'
import { computeOrderTotals } from '@/lib/domain/order-totals'
import { createOrder, getOrder, removeSavedLine, voidSavedOrder } from '@/lib/db/memory/order-store'
import type { NewOrder } from '@/types/stores/order-store.types'
import { createQuote } from '@/lib/db/memory/quote-store'
import { orderActionFacts } from '@/lib/server/domain/order-facts'
import type { DraftLine, DraftPayment } from '@/types/orders/draft.types'

function line(id: string, price: string): DraftLine {
  return {
    id,
    examId: `exam-${id}`,
    examName: `Examen ${id}`,
    costType: null,
    column: null,
    priceUsd: price,
    basis: 'ORDINARIO',
    status: 'DISPONIBLE',
    repeatMotivo: null,
    addedAt: '2026-01-01T00:00:00.000Z',
  }
}

function payment(amount: string): DraftPayment {
  return { method: 'EFECTIVO_USD', amount, bank: '', reference: '' }
}

function newOrder(lines: DraftLine[], payments: DraftPayment[]): NewOrder {
  return {
    clientId: 'c-1',
    clientName: 'Paciente Prueba',
    path: 'PARTICULAR',
    physicianId: null,
    physicianName: null,
    convenioId: null,
    convenioName: null,
    titular: '',
    billing: { cedula: '', razonSocial: '', direccion: '' },
    costType: null,
    motivo: '',
    sampleDate: null,
    lines,
    payments,
    discountPct: '0',
    discountMotivo: '',
    rateBs: '40',
    rateDate: '2026-01-01',
    ivaRate: '16',
    igtfRate: '3',
    totals: computeOrderTotals({ lines, rate: '40', ivaRate: '16', igtfRate: '3', discountPct: '0', payments }),
    savedById: 'u-1',
    savedByName: 'Operador',
    savedAt: '2026-01-01T10:00:00.000Z',
  }
}

describe('voidSavedOrder', () => {
  it('keeps the order and its numbers, marks it ANULADA and takes a credit note when asked', () => {
    const created = createOrder('void-1', newOrder([line('a', '10.00')], [payment('10')]), ['exam-a'])
    const voided = voidSavedOrder(created.id, { motivo: 'Error', byId: 'u-2', byName: 'Jefe', withCreditNote: true })
    expect(voided?.state).toBe('ANULADA')
    expect(voided?.invoiceNumber).toBe(created.invoiceNumber)
    expect(voided?.voided?.creditNote).toMatch(/^NC-\d{6}$/)
    expect(getOrder(created.id)?.state).toBe('ANULADA')
  })

  it('skips the credit note when nothing was paid and refuses a second void', () => {
    const created = createOrder('void-2', newOrder([line('a', '10.00')], []), ['exam-a'])
    const voided = voidSavedOrder(created.id, { motivo: 'Error', byId: 'u-2', byName: 'Jefe', withCreditNote: false })
    expect(voided?.voided?.creditNote).toBeNull()
    expect(voidSavedOrder(created.id, { motivo: 'Otra', byId: 'u-2', byName: 'Jefe', withCreditNote: false })).toBeNull()
  })

  it('gives each credit note its own number', () => {
    const first = createOrder('void-3', newOrder([line('a', '10.00')], [payment('10')]), ['exam-a'])
    const second = createOrder('void-4', newOrder([line('a', '10.00')], [payment('10')]), ['exam-a'])
    const one = voidSavedOrder(first.id, { motivo: 'x', byId: 'u', byName: 'J', withCreditNote: true })
    const two = voidSavedOrder(second.id, { motivo: 'x', byId: 'u', byName: 'J', withCreditNote: true })
    expect(one?.voided?.creditNote).not.toBe(two?.voided?.creditNote)
  })
})

describe('removeSavedLine', () => {
  it('drops the line and recomputes the totals', () => {
    const created = createOrder('rm-1', newOrder([line('a', '10.00'), line('b', '30.00')], []), ['exam-a', 'exam-b'])
    const outcome = removeSavedLine(created.id, 'b')
    expect(outcome.ok).toBe(true)
    if (outcome.ok) {
      expect(outcome.order.lines).toHaveLength(1)
      expect(Number(outcome.order.totals.totalUsd)).toBeLessThan(Number(created.totals.totalUsd))
      expect(outcome.removedName).toBe('Examen b')
    }
  })

  it('refuses to remove the last line, an unknown line or a line of a voided order', () => {
    const created = createOrder('rm-2', newOrder([line('a', '10.00')], []), ['exam-a'])
    expect(removeSavedLine(created.id, 'a')).toEqual({ ok: false, reason: 'LAST_LINE' })
    expect(removeSavedLine(created.id, 'zzz')).toEqual({ ok: false, reason: 'NOT_FOUND' })
    voidSavedOrder(created.id, { motivo: 'x', byId: 'u', byName: 'J', withCreditNote: false })
    expect(removeSavedLine(created.id, 'a')).toEqual({ ok: false, reason: 'NOT_FOUND' })
  })
})

describe('createQuote', () => {
  it('numbers quotes on their own and never touches the order counter', () => {
    const before = createOrder('q-order', newOrder([line('a', '10.00')], []), ['exam-a'])
    const quote = createQuote({
      clientId: 'c-1',
      clientName: 'Paciente Prueba',
      billing: { cedula: '', razonSocial: '', direccion: '' },
      lines: [line('a', '10.00')],
      discountPct: '0',
      rateBs: '40',
      totals: before.totals,
      createdAt: '2026-01-01T10:00:00.000Z',
    } as Parameters<typeof createQuote>[0])
    expect(quote.number).not.toBe(before.invoiceNumber)
    const after = createOrder('q-order-2', newOrder([line('a', '10.00')], []), ['exam-a'])
    expect(Number(after.number)).toBe(Number(before.number) + 1)
  })
})

describe('orderActionFacts', () => {
  it('reports payment taken and a result in progress', () => {
    const facts = orderActionFacts({ payments: [payment('5')] }, { hasResult: true, released: false })
    expect(JSON.stringify(facts)).toBeTruthy()
    const empty = orderActionFacts({ payments: [payment('')] }, { hasResult: false, released: false })
    expect(JSON.stringify(empty)).not.toBe(JSON.stringify(facts))
  })
})
