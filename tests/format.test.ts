import fc from 'fast-check'
import { describe, expect, it } from 'vitest'
import {
  computeAge,
  formatAge,
  formatCedula,
  formatDate,
  formatMoney,
  formatOrderNumber,
  formatPrice,
  formatRate,
  formatResultNumber,
  normalizeName,
  parseCedulaPaste,
} from '@/lib/utils/format'

describe('formatDate', () => {
  it('formats a date-only string without shifting it', () => {
    expect(formatDate('2026-11-04')).toBe('04/11/2026')
  })
  it('uses America/Caracas for instants', () => {
    expect(formatDate(new Date('2026-11-05T02:00:00.000Z'))).toBe('04/11/2026')
  })
  it('shows an em dash for a missing or invalid value', () => {
    expect(formatDate(null)).toBe('—')
    expect(formatDate('')).toBe('—')
    expect(formatDate('not a date')).toBe('—')
  })
})

describe('formatMoney, formatRate, formatPrice', () => {
  it('uses a decimal comma and thousands periods', () => {
    expect(formatMoney('13100')).toBe('13.100,00')
    expect(formatMoney(13100.5)).toBe('13.100,50')
    expect(formatRate('889.26')).toBe('889,26')
  })
  it('rounds half up on the third decimal without a float', () => {
    expect(formatMoney('0.005')).toBe('0,01')
    expect(formatMoney('0.994')).toBe('0,99')
    expect(formatMoney('999.995')).toBe('1.000,00')
  })
  it('reads a stored zero as 0,00 and a blank price as SIN PRECIO', () => {
    expect(formatMoney('0')).toBe('0,00')
    expect(formatPrice('0.00')).toBe('0,00')
    expect(formatPrice(null)).toBe('SIN PRECIO')
    expect(formatPrice('')).toBe('SIN PRECIO')
  })
  it('shows an em dash for a missing amount', () => {
    expect(formatMoney(null)).toBe('—')
  })
  it('never prints a negative zero', () => {
    expect(formatMoney('-0.001')).toBe('0,00')
  })
})

describe('formatResultNumber', () => {
  it('uses a decimal comma and groups thousands', () => {
    expect(formatResultNumber('12.7')).toBe('12,7')
    expect(formatResultNumber('13100')).toBe('13.100')
  })
  it('keeps text results untouched', () => {
    expect(formatResultNumber('NEGATIVO')).toBe('NEGATIVO')
    expect(formatResultNumber('1-3 XC')).toBe('1-3 XC')
    expect(formatResultNumber('POSITIVO (+++)')).toBe('POSITIVO (+++)')
  })
  it('keeps the digits the laboratory stored, including a trailing zero', () => {
    expect(formatResultNumber('33.0')).toBe('33,0')
  })
})

describe('formatOrderNumber', () => {
  it('pads to four digits', () => {
    expect(formatOrderNumber(1)).toBe('0001')
    expect(formatOrderNumber(12345)).toBe('12345')
  })
  it('refuses a negative or fractional number', () => {
    expect(formatOrderNumber(-1)).toBe('—')
    expect(formatOrderNumber(1.5)).toBe('—')
  })
})

describe('formatCedula and parseCedulaPaste', () => {
  it('formats V-12.345.678', () => {
    expect(formatCedula('V', '12345678')).toBe('V-12.345.678')
    expect(formatCedula('E', '82000003')).toBe('E-82.000.003')
  })
  it('reads a pasted formatted cédula', () => {
    expect(parseCedulaPaste('V-12.345.678')).toEqual({ type: 'V', digits: '12345678' })
    expect(parseCedulaPaste('e 12345678')).toEqual({ type: 'E', digits: '12345678' })
  })
  it('reads a bare digit string as V only in the paste parser', () => {
    expect(parseCedulaPaste('12.345.678')).toEqual({ type: 'V', digits: '12345678' })
    expect(parseCedulaPaste('12345678')).toEqual({ type: 'V', digits: '12345678' })
  })
  it('rejects text that is not a cédula', () => {
    expect(parseCedulaPaste('')).toBeNull()
    expect(parseCedulaPaste('abc')).toBeNull()
    expect(parseCedulaPaste('V-')).toBeNull()
    expect(parseCedulaPaste('12345678901')).toBeNull()
  })
  it('round-trips format and parse for any digit string', () => {
    fc.assert(
      fc.property(fc.stringMatching(/^[1-9]\d{4,8}$/), (digits) => {
        expect(parseCedulaPaste(formatCedula('V', digits))).toEqual({ type: 'V', digits })
      }),
    )
  })
})

describe('computeAge', () => {
  it('returns years from two years of age', () => {
    expect(computeAge('1985-03-14', '2026-11-04')).toEqual({ value: 41, unit: 'years' })
    expect(computeAge('2024-11-04', '2026-11-04')).toEqual({ value: 2, unit: 'years' })
  })
  it('returns months under two years', () => {
    expect(computeAge('2025-02-20', '2026-11-04')).toEqual({ value: 20, unit: 'months' })
    expect(computeAge('2024-11-05', '2026-11-04')).toEqual({ value: 23, unit: 'months' })
  })
  it('does not count a birthday that has not come yet', () => {
    expect(computeAge('1985-11-05', '2026-11-04')).toEqual({ value: 40, unit: 'years' })
  })
  it('refuses a birth date after the sample date or a malformed date', () => {
    expect(computeAge('2027-01-01', '2026-11-04')).toBeNull()
    expect(computeAge('01/01/1990', '2026-11-04')).toBeNull()
  })
  it('formats age in Spanish', () => {
    expect(formatAge({ value: 1, unit: 'months' })).toBe('1 mes')
    expect(formatAge({ value: 41, unit: 'years' })).toBe('41 años')
    expect(formatAge(null)).toBe('—')
  })
  it('is never negative for any ordered pair of dates', () => {
    const date = fc
      .date({ min: new Date('1900-01-01'), max: new Date('2100-01-01'), noInvalidDate: true })
      .map((d) => d.toISOString().slice(0, 10))
    fc.assert(
      fc.property(date, date, (a, b) => {
        const [birth, sample] = a <= b ? [a, b] : [b, a]
        const age = computeAge(birth, sample)
        expect(age).not.toBeNull()
        expect(age?.value ?? -1).toBeGreaterThanOrEqual(0)
      }),
    )
  })
})

describe('normalizeName', () => {
  it('trims, collapses spaces, and title-cases for es-VE', () => {
    expect(normalizeName('  maría   DE los ángeles  ').display).toBe('María de los Ángeles')
  })
  it('builds a key without accents in capitals', () => {
    expect(normalizeName('José Núñez').key).toBe('JOSE NUNEZ')
  })
  it('capitalizes each part of a hyphenated name', () => {
    expect(normalizeName('ana-lucía pérez').display).toBe('Ana-Lucía Pérez')
  })
  it('is idempotent', () => {
    fc.assert(
      fc.property(fc.string({ maxLength: 40 }), (raw) => {
        const once = normalizeName(raw)
        expect(normalizeName(once.display).display).toBe(once.display)
      }),
    )
  })
})
