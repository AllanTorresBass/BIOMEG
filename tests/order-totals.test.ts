import { describe, expect, it } from 'vitest'
import { computeOrderTotals, parseAmountCents, parsePercentBp } from '@/lib/domain/order-totals'

const base = {
  lines: [{ priceUsd: '100.00' }],
  rate: '40',
  ivaRate: '16',
  igtfRate: '3',
  discountPct: '0',
  payments: [],
}

describe('parseAmountCents', () => {
  it('reads Venezuelan and plain decimals', () => {
    expect(parseAmountCents('1.234,56')).toBe(123456)
    expect(parseAmountCents('12.50')).toBe(1250)
  })

  it('treats an empty field as zero and rejects text', () => {
    expect(parseAmountCents('')).toBe(0)
    expect(parseAmountCents('abc')).toBeNull()
  })
})

describe('parsePercentBp', () => {
  it('returns basis points', () => {
    expect(parsePercentBp('12,5')).toBe(1250)
    expect(parsePercentBp('100')).toBe(10_000)
    expect(parsePercentBp('')).toBe(0)
  })

  it('rejects values over 100 or not a number', () => {
    expect(parsePercentBp('101')).toBeNull()
    expect(parsePercentBp('x')).toBeNull()
  })
})

describe('computeOrderTotals', () => {
  it('applies the discount before IVA and leaves the balance open with no payments', () => {
    const totals = computeOrderTotals({ ...base, discountPct: '10' })
    expect(totals.subTotal).toBe('100.00')
    expect(totals.discount).toBe('10.00')
    expect(totals.base).toBe('90.00')
    expect(totals.iva).toBe('14.40')
    expect(totals.igtf).toBe('0.00')
    expect(totals.totalUsd).toBe('104.40')
    expect(totals.abono).toBe('0.00')
    expect(totals.resta).toBe('104.40')
  })

  it('charges IGTF only on the foreign-currency payments', () => {
    const totals = computeOrderTotals({
      ...base,
      discountPct: '10',
      payments: [{ method: 'ZELLE', amount: '50' }],
    })
    expect(totals.igtf).toBe('1.50')
    expect(totals.totalUsd).toBe('105.90')
    expect(totals.abono).toBe('50.00')
    expect(totals.resta).toBe('55.90')
  })

  it('converts bolivar payments to dollars at the rate', () => {
    const totals = computeOrderTotals({
      ...base,
      payments: [{ method: 'EFECTIVO_BS', amount: '400' }],
    })
    expect(totals.igtf).toBe('0.00')
    expect(totals.abono).toBe('10.00')
  })

  it('never shows a negative balance when paid over the total', () => {
    const totals = computeOrderTotals({
      ...base,
      payments: [{ method: 'ZELLE', amount: '500' }],
    })
    expect(totals.resta).toBe('0.00')
  })

  it('calculates 0,00 tax and flags it when IVA or IGTF is not configured', () => {
    const totals = computeOrderTotals({ ...base, ivaRate: null, igtfRate: null })
    expect(totals.iva).toBe('0.00')
    expect(totals.totalUsd).toBe('100.00')
    expect(totals.ivaConfigured).toBe(false)
    expect(totals.igtfConfigured).toBe(false)
  })

  it('has no bolivar total without a rate', () => {
    expect(computeOrderTotals({ ...base, rate: null }).totalBs).toBeNull()
    expect(computeOrderTotals(base).totalBs).not.toBeNull()
  })

  it('counts an unpriced line as zero', () => {
    const totals = computeOrderTotals({ ...base, lines: [{ priceUsd: null }, { priceUsd: '20.00' }] })
    expect(totals.subTotal).toBe('20.00')
  })
})
