import type { ResultMark, ResultOrderState } from '@/types/orders/result.types'

/**
 * Reads a number the way the laboratory writes it: 12,7 or 12.7, and 13.100 as thousands.
 * Returns null for anything that is not one plain number.
 */
export function parseLabNumber(raw: string): number | null {
  const text = raw.trim()
  if (!/^-?\d[\d.,]*$/.test(text)) return null
  const hasDot = text.includes('.')
  const hasComma = text.includes(',')
  let normalised: string
  if (hasDot && hasComma) {
    normalised = text.replace(/\./g, '').replace(',', '.')
  } else if (hasComma) {
    if (text.split(',').length > 2) return null
    normalised = text.replace(',', '.')
  } else if (hasDot) {
    normalised = /^-?\d{1,3}(\.\d{3})+$/.test(text) ? text.replace(/\./g, '') : text
  } else {
    normalised = text
  }
  const value = Number(normalised)
  return Number.isFinite(value) ? value : null
}

const RANGE = /^\s*(-?\d[\d.,]*)\s*-\s*(-?\d[\d.,]*)\s*([^\d\s-].*)?$/

/** A reference that is one closed numeric range, with at most a unit after it. Anything else is manual. */
export function closedRange(reference: string): { low: number; high: number } | null {
  if (/HOMBRE|MUJER/i.test(reference)) return null
  const match = RANGE.exec(reference)
  if (!match) return null
  const low = parseLabNumber(match[1] ?? '')
  const high = parseLabNumber(match[2] ?? '')
  if (low === null || high === null || low > high) return null
  return { low, high }
}

/**
 * Marca fills itself only when the reference is one closed range, the result parses as a number
 * and the client's sex is not blank. In range stays blank. Everything else is left to the bioanalyst.
 */
export function autoMark(reference: string, value: string, sex: 'F' | 'M' | null): ResultMark | null {
  if (sex === null) return null
  const range = closedRange(reference)
  if (!range) return null
  const parsed = parseLabNumber(value)
  if (parsed === null) return null
  if (parsed > range.high) return 'ALTO'
  if (parsed < range.low) return 'BAJO'
  return null
}

/** An analyte is numeric when its stored value reads as one plain number. */
export function isNumericValue(value: string): boolean {
  return parseLabNumber(value) !== null
}

export function resultOrderState(stub: { hasResult: boolean; released: boolean; correctionOpen?: boolean }): ResultOrderState {
  if (stub.correctionOpen) return 'EN_CORRECCION'
  if (stub.released) return 'LIBERADO'
  if (stub.hasResult) return 'CARGADO'
  return 'PENDIENTE'
}
