import { CEDULA_TYPES, LAB_TIME_ZONE, normalizeName } from '@/lib/utils/format'
import type { CedulaType } from '@/lib/utils/format'
import type { ClientFormInput, ClientRefusal, Sex, ValidClientInput } from '@/types/domain/client.types'

const EMAIL_SHAPE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MIN_DIGITS = 6
const MAX_DIGITS = 10

export type ClientValidation = { ok: true; value: ValidClientInput } | { ok: false; refusal: ClientRefusal }

/** Today in the laboratory's time zone, as YYYY-MM-DD. */
export function todayInLab(now: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: LAB_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now)
}

/** DD/MM/AAAA to an ISO date, or null when it is not a real calendar date. */
export function parseBirthDate(text: string): string | null {
  const match = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(text.trim())
  if (!match) return null
  const day = Number(match[1])
  const month = Number(match[2])
  const year = Number(match[3])
  const probe = new Date(Date.UTC(year, month - 1, day))
  if (probe.getUTCFullYear() !== year || probe.getUTCMonth() !== month - 1 || probe.getUTCDate() !== day) return null
  return `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

export type CedulaPairValidation =
  | { ok: true; type: CedulaType | null; digits: string | null }
  | { ok: false; refusal: ClientRefusal }

/** Both empty is valid (a client without a cédula). One without the other, or a malformed pair, is not. */
export function validateCedulaPair(typeRaw: string, numberRaw: string): CedulaPairValidation {
  const refuse = (refusal: ClientRefusal): CedulaPairValidation => ({ ok: false, refusal })
  const typeText = typeRaw.trim().toUpperCase()
  const numberText = numberRaw.replace(/[.\-\s]/g, '')
  if (typeText === '' && numberText === '') return { ok: true, type: null, digits: null }
  if (typeText !== '' && numberText === '') return refuse({ code: 'CEDULA_HALF_TYPE', field: 'cedulaNumber' })
  if (typeText === '' && numberText !== '') return refuse({ code: 'CEDULA_HALF_NUMBER', field: 'cedulaType' })
  if (!(CEDULA_TYPES as readonly string[]).includes(typeText)) return refuse({ code: 'CEDULA_TYPE_UNKNOWN', field: 'cedulaType' })
  if (!/^\d+$/.test(numberText)) return refuse({ code: 'CEDULA_NOT_DIGITS', field: 'cedulaNumber' })
  if (numberText.length < MIN_DIGITS || numberText.length > MAX_DIGITS) return refuse({ code: 'CEDULA_LENGTH', field: 'cedulaNumber' })
  return { ok: true, type: typeText as CedulaType, digits: numberText }
}

/**
 * Checks run in the order of docs/product/04-edges.md and stop at the first refusal:
 * name, birth date, cédula pair, then the optional fields. The store checks
 * the unique cédula and the similar name after this passes.
 */
export function validateClientInput(input: ClientFormInput, today: string = todayInLab()): ClientValidation {
  const refuse = (refusal: ClientRefusal): ClientValidation => ({ ok: false, refusal })

  const name = normalizeName(input.fullName)
  if (name.key === '') return refuse({ code: 'NAME_EMPTY', field: 'fullName' })

  const birthText = input.birthDate.trim()
  if (birthText === '') return refuse({ code: 'BIRTH_EMPTY', field: 'birthDate' })
  const birthDate = parseBirthDate(birthText)
  if (!birthDate) return refuse({ code: 'BIRTH_INVALID', field: 'birthDate' })
  if (birthDate > today) return refuse({ code: 'BIRTH_FUTURE', field: 'birthDate' })

  const cedula = validateCedulaPair(input.cedulaType, input.cedulaNumber)
  if (!cedula.ok) return refuse(cedula.refusal)
  const { type: cedulaType, digits: cedulaDigits } = cedula

  const sexText = input.sex.trim().toUpperCase()
  if (sexText !== '' && sexText !== 'F' && sexText !== 'M') return refuse({ code: 'SEX_UNKNOWN', field: 'sex' })
  const sex: Sex | null = sexText === '' ? null : (sexText as Sex)

  const email = input.email.trim()
  if (email !== '' && !EMAIL_SHAPE.test(email)) return refuse({ code: 'EMAIL_INVALID', field: 'email' })

  const phone = input.phone.trim().replace(/\s+/g, ' ')

  return {
    ok: true,
    value: {
      fullName: name.display,
      nameKey: name.key,
      cedulaType,
      cedulaDigits,
      birthDate,
      sex,
      phone: phone === '' ? null : phone,
      email: email === '' ? null : email.toLowerCase(),
    },
  }
}
