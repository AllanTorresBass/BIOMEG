import { strings } from '@/lib/strings'

export const LAB_TIME_ZONE = 'America/Caracas'

const DASH = strings.empty.dash
const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/

export const CEDULA_TYPES = ['V', 'E', 'J', 'P', 'G'] as const
export type CedulaType = (typeof CEDULA_TYPES)[number]

export interface ParsedCedula {
  type: CedulaType
  digits: string
}

export interface Age {
  value: number
  unit: 'years' | 'months'
}

export interface NormalizedName {
  display: string
  key: string
}

function groupThousands(integerDigits: string): string {
  return integerDigits.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

/** DD/MM/YYYY. A date-only string is never shifted by a time zone. */
export function formatDate(value: Date | string | null | undefined): string {
  if (value === null || value === undefined || value === '') return DASH
  if (typeof value === 'string') {
    const match = ISO_DATE.exec(value)
    if (match) return `${match[3]}/${match[2]}/${match[1]}`
  }
  const date = typeof value === 'string' ? new Date(value) : value
  if (Number.isNaN(date.getTime())) return DASH
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: LAB_TIME_ZONE,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).formatToParts(date)
  const pick = (type: string) => parts.find((part) => part.type === type)?.value ?? ''
  return `${pick('day')}/${pick('month')}/${pick('year')}`
}

/** Splits a decimal into sign, integer digits, and fraction digits without using a float. */
function splitDecimal(raw: string | number): { negative: boolean; integer: string; fraction: string } | null {
  const text = typeof raw === 'number' ? (Number.isFinite(raw) ? String(raw) : '') : raw.trim()
  const match = /^(-?)(\d+)(?:\.(\d+))?$/.exec(text)
  if (!match) return null
  return { negative: match[1] === '-', integer: match[2] ?? '0', fraction: match[3] ?? '' }
}

function roundFraction(integer: string, fraction: string, places: number): { integer: string; fraction: string } {
  if (fraction.length <= places) return { integer, fraction: fraction.padEnd(places, '0') }
  const kept = fraction.slice(0, places)
  const roundUp = Number(fraction[places]) >= 5
  if (!roundUp) return { integer, fraction: kept }
  const scaled = BigInt(integer + kept) + 1n
  const digits = scaled.toString().padStart(places + 1, '0')
  return { integer: digits.slice(0, digits.length - places), fraction: digits.slice(digits.length - places) }
}

/** 13100 becomes 13.100,00. A stored zero reads 0,00. A missing value reads an em dash. */
export function formatMoney(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === '') return DASH
  const parts = splitDecimal(value)
  if (!parts) return DASH
  const { integer, fraction } = roundFraction(parts.integer, parts.fraction, 2)
  const body = `${groupThousands(String(BigInt(integer)))},${fraction}`
  const isZero = BigInt(integer) === 0n && /^0*$/.test(fraction)
  return parts.negative && !isZero ? `-${body}` : body
}

/** A blank price reads SIN PRECIO. A stored zero is a price and reads 0,00. */
export function formatPrice(value: string | null | undefined): string {
  if (value === null || value === undefined || value.trim() === '') return strings.empty.noPrice
  return formatMoney(value)
}

/** A result is stored as text. A numeric result shows a decimal comma: 12.7 becomes 12,7. */
export function formatResultNumber(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === '') return DASH
  const parts = splitDecimal(value)
  if (!parts) return String(value)
  const integer = groupThousands(String(BigInt(parts.integer)))
  const sign = parts.negative ? '-' : ''
  return parts.fraction ? `${sign}${integer},${parts.fraction}` : `${sign}${integer}`
}

export function formatRate(value: string | number | null | undefined): string {
  return formatMoney(value)
}

export function formatOrderNumber(value: number | null | undefined): string {
  if (value === null || value === undefined || !Number.isInteger(value) || value < 0) return DASH
  return String(value).padStart(4, '0')
}

export function formatCedula(type: CedulaType, digits: string): string {
  const clean = digits.replace(/\D/g, '')
  if (!clean) return DASH
  return `${type}-${groupThousands(clean)}`
}

/**
 * Only this paste parser reads a bare digit string as type V.
 * "V-12.345.678", "e 12345678", and "12.345.678" are accepted.
 */
export function parseCedulaPaste(text: string): ParsedCedula | null {
  const match = /^\s*([VvEeJjPpGg])?\s*[-.\s]?\s*([\d.\s]+?)\s*$/.exec(text)
  if (!match) return null
  const digits = (match[2] ?? '').replace(/[.\s]/g, '')
  if (digits.length < 1 || digits.length > 10 || !/^\d+$/.test(digits)) return null
  const letter = match[1]?.toUpperCase() as CedulaType | undefined
  return { type: letter ?? 'V', digits }
}

function parseIsoDate(value: string): { y: number; m: number; d: number } | null {
  const match = ISO_DATE.exec(value)
  if (!match) return null
  return { y: Number(match[1]), m: Number(match[2]), d: Number(match[3]) }
}

/** Age from Fecha de nac. and Fecha muestra. Years, or months when under two years. */
export function computeAge(birthDate: string, sampleDate: string): Age | null {
  const birth = parseIsoDate(birthDate)
  const sample = parseIsoDate(sampleDate)
  if (!birth || !sample) return null
  let months = (sample.y - birth.y) * 12 + (sample.m - birth.m)
  if (sample.d < birth.d) months -= 1
  if (months < 0) return null
  if (months < 24) return { value: months, unit: 'months' }
  return { value: Math.floor(months / 12), unit: 'years' }
}

export function formatAge(age: Age | null): string {
  if (!age) return DASH
  return age.unit === 'years' ? strings.age.years(age.value) : strings.age.months(age.value)
}

const LOWERCASE_PARTICLES = new Set(['de', 'del', 'la', 'las', 'los', 'y', 'e'])

function capitalize(word: string): string {
  const first = word.charAt(0).toLocaleUpperCase('es-VE')
  return first + word.slice(1)
}

/** Trim, collapse spaces, title case for es-VE, and a search key without accents in capitals. */
export function normalizeName(raw: string): NormalizedName {
  const collapsed = raw.trim().replace(/\s+/g, ' ')
  const display = collapsed
    .toLocaleLowerCase('es-VE')
    .split(' ')
    .map((word, index) => {
      if (index > 0 && LOWERCASE_PARTICLES.has(word)) return word
      return word.split('-').map(capitalize).join('-')
    })
    .join(' ')
  const key = collapsed
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLocaleUpperCase('es-VE')
  return { display, key }
}
