import { describe, expect, it } from 'vitest'
import { discardDraft, getDraft, nextLineId, startDraft } from '@/lib/db/memory/draft-store'
import { needsColumnOverride, repeatedExamIds } from '@/lib/server/domain/order-draft-rules'
import { bsFromUsdCents, centsToDecimal, parseCents, priceFor, pricingBasis, totalsOf } from '@/lib/domain/pricing'
import type { DemoPriceRow } from '@/types/domain/demo.types'
import type { OrderStub } from '@/types/domain/order-stub.types'

function stub(overrides: Partial<OrderStub>): OrderStub {
  return {
    id: 'o-test',
    clientId: 'c-1',
    clientName: 'Test',
    cedulaType: null,
    cedulaDigits: null,
    createdAt: new Date().toISOString(),
    voided: false,
    hasResult: false,
    released: false,
    issued: false,
    needsReview: false,
    examIds: [],
    ...overrides,
  }
}

describe('money in cents', () => {
  it('parses and prints without drift', () => {
    expect(parseCents('8.00')).toBe(800)
    expect(parseCents('0.1')).toBe(10)
    expect(parseCents('7114.08')).toBe(711408)
    expect(centsToDecimal(711408)).toBe('7114.08')
    expect(centsToDecimal(5)).toBe('0.05')
  })

  it('sums priced lines and counts the ones without a price apart', () => {
    const totals = totalsOf([{ priceUsd: '8.00' }, { priceUsd: '3.50' }, { priceUsd: null }, { priceUsd: '0.00' }], '88.926')
    expect(totals.usd).toBe('11.50')
    expect(totals.pricedCount).toBe(3)
    expect(totals.sinPrecioCount).toBe(1)
    expect(totals.bs).toBe(bsFromUsdCents(1150, '88.926'))
  })

  it('gives no bolivar total without a rate', () => {
    expect(totalsOf([{ priceUsd: '8.00' }], '').bs).toBeNull()
    expect(totalsOf([{ priceUsd: '8.00' }], null).bs).toBeNull()
  })
})

describe('price read from the catalog', () => {
  const prices = {
    PARTICULAR: { usd: '8.00', bs: '1' },
    ALIADOS: { usd: '0.00', bs: '0' },
    HOSPITALIZADO: { usd: null, bs: null },
    EMERGENCIA: { usd: null, bs: null },
    ESTATAL: { usd: null, bs: null },
  }
  const row = { id: 'p-x', name: 'X', status: 'DISPONIBLE', prices } as unknown as DemoPriceRow

  it('keeps a stored zero and treats a blank or missing column as no price', () => {
    expect(priceFor(row, 'PARTICULAR')).toBe('8.00')
    expect(priceFor(row, 'ALIADOS')).toBe('0.00')
    expect(priceFor(row, 'ESTATAL')).toBeNull()
    expect(priceFor(row, null)).toBeNull()
  })
})

describe('Saturday pricing', () => {
  const saturday = new Date('2026-04-11T16:00:00Z')
  const monday = new Date('2026-04-13T16:00:00Z')

  it('applies only when enabled and the day is a Saturday in Caracas', () => {
    expect(pricingBasis(true, saturday)).toBe('SABADO')
    expect(pricingBasis(false, saturday)).toBe('ORDINARIO')
    expect(pricingBasis(true, monday)).toBe('ORDINARIO')
  })

  it('uses the Caracas calendar day, not UTC', () => {
    expect(pricingBasis(true, new Date('2026-04-12T02:00:00Z'))).toBe('SABADO')
  })
})

describe('same exam on the same day', () => {
  const now = new Date('2026-04-13T16:00:00Z')

  it('flags an exam already ordered today for that client', () => {
    const orders = [stub({ createdAt: '2026-04-13T14:00:00Z', examIds: ['p-1', 'p-2'] })]
    expect(repeatedExamIds(orders, 'c-1', ['p-2', 'p-3'], now)).toEqual(['p-2'])
  })

  it('ignores voided orders, other clients and other days', () => {
    const orders = [
      stub({ createdAt: '2026-04-13T14:00:00Z', examIds: ['p-1'], voided: true }),
      stub({ createdAt: '2026-04-13T14:00:00Z', examIds: ['p-1'], clientId: 'c-2' }),
      stub({ createdAt: '2026-04-12T14:00:00Z', examIds: ['p-1'] }),
    ]
    expect(repeatedExamIds(orders, 'c-1', ['p-1'], now)).toEqual([])
  })
})

describe('saved tipo de costo pair', () => {
  it('asks to override only when a pair is saved and another column is chosen', () => {
    const saved = { EMERGENCIA: 'EMERGENCIA' } as const
    expect(needsColumnOverride(saved, 'EMERGENCIA', 'PARTICULAR')).toBe(true)
    expect(needsColumnOverride(saved, 'EMERGENCIA', 'EMERGENCIA')).toBe(false)
    expect(needsColumnOverride({}, 'EMERGENCIA', 'PARTICULAR')).toBe(false)
    expect(needsColumnOverride(saved, null, 'PARTICULAR')).toBe(false)
    expect(needsColumnOverride(saved, 'EMERGENCIA', null)).toBe(false)
  })
})

describe('draft store', () => {
  it('opens in BORRADOR and is private to its owner', () => {
    const draft = startDraft('owner-a', 'PARTICULAR')
    expect(draft.state).toBe('BORRADOR')
    expect(getDraft(draft.id, 'owner-a')).toBe(draft)
    expect(getDraft(draft.id, 'owner-b')).toBeNull()
  })

  it('reuses an untouched draft instead of leaving a second empty one', () => {
    const first = startDraft('owner-c', 'EMPRESA')
    expect(startDraft('owner-c', 'EMPRESA')).toBe(first)
    expect(startDraft('owner-c', 'PARTICULAR')).not.toBe(first)
  })

  it('starts a new draft once the first one has a client', () => {
    const first = startDraft('owner-d', 'PARTICULAR')
    first.clientId = 'c-1'
    expect(startDraft('owner-d', 'PARTICULAR')).not.toBe(first)
  })

  it('numbers new lines after the highest one and discards on cancel', () => {
    const draft = startDraft('owner-e', 'PARTICULAR')
    expect(nextLineId(draft)).toBe(`${draft.id}-l-1`)
    expect(discardDraft(draft.id, 'owner-x')).toBe(false)
    expect(discardDraft(draft.id, 'owner-e')).toBe(true)
    expect(getDraft(draft.id, 'owner-e')).toBeNull()
  })
})
