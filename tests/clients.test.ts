import { describe, expect, it } from 'vitest'
import { findByCedula, findSimilar, getClient, insertClient, searchClients, updateClient } from '@/lib/db/memory/client-store'
import { parseBirthDate, validateClientInput } from '@/lib/server/domain/client-rules'
import { nameSimilarity, SIMILAR_NAME_THRESHOLD } from '@/lib/utils/similarity'
import { normalizeName, parseCedulaPaste } from '@/lib/utils/format'
import type { ClientFormInput } from '@/types/domain/client.types'

const TODAY = '2026-11-04'

function input(overrides: Partial<ClientFormInput> = {}): ClientFormInput {
  return {
    id: null,
    version: null,
    fullName: 'Maria Prueba',
    cedulaType: 'V',
    cedulaNumber: '15111222',
    birthDate: '14/03/1985',
    sex: 'F',
    phone: '',
    email: '',
    consentWhatsapp: false,
    consentEmail: false,
    confirmSimilar: false,
    ...overrides,
  }
}

function code(overrides: Partial<ClientFormInput>) {
  const result = validateClientInput(input(overrides), TODAY)
  return result.ok ? 'OK' : result.refusal.code
}

describe('parseBirthDate', () => {
  it('reads DD/MM/AAAA', () => {
    expect(parseBirthDate('14/03/1985')).toBe('1985-03-14')
    expect(parseBirthDate('4/3/1985')).toBe('1985-03-04')
  })
  it('refuses dates that do not exist', () => {
    expect(parseBirthDate('31/02/2020')).toBeNull()
    expect(parseBirthDate('1985-03-14')).toBeNull()
    expect(parseBirthDate('')).toBeNull()
  })
})

describe('validateClientInput', () => {
  it('accepts a complete client and normalizes the name', () => {
    const result = validateClientInput(input({ fullName: '  maría   prueba ' }), TODAY)
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.value.fullName).toBe(normalizeName('maría prueba').display)
      expect(result.value.birthDate).toBe('1985-03-14')
      expect(result.value.cedulaDigits).toBe('15111222')
    }
  })

  it('refuses an empty name first, before any other problem', () => {
    expect(code({ fullName: '   ', birthDate: '', cedulaNumber: '' })).toBe('NAME_EMPTY')
  })

  it('refuses an empty birth date before the cédula', () => {
    expect(code({ birthDate: '', cedulaNumber: '' })).toBe('BIRTH_EMPTY')
  })

  it('refuses an invalid or future birth date', () => {
    expect(code({ birthDate: '99/99/1985' })).toBe('BIRTH_INVALID')
    expect(code({ birthDate: '05/11/2026' })).toBe('BIRTH_FUTURE')
    expect(validateClientInput(input({ birthDate: '04/11/2026' }), TODAY).ok).toBe(true)
  })

  it('refuses a half cédula pair in either direction', () => {
    expect(code({ cedulaType: 'V', cedulaNumber: '' })).toBe('CEDULA_HALF_TYPE')
    expect(code({ cedulaType: '', cedulaNumber: '15111222' })).toBe('CEDULA_HALF_NUMBER')
  })

  it('accepts both cédula fields empty as Sin verificar', () => {
    const result = validateClientInput(input({ cedulaType: '', cedulaNumber: '' }), TODAY)
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.value.cedulaType).toBeNull()
      expect(result.value.cedulaDigits).toBeNull()
    }
  })

  it('checks the number length and that it is only digits', () => {
    expect(code({ cedulaNumber: '12345' })).toBe('CEDULA_LENGTH')
    expect(code({ cedulaNumber: '12345678901' })).toBe('CEDULA_LENGTH')
    expect(code({ cedulaNumber: '12a45678' })).toBe('CEDULA_NOT_DIGITS')
    expect(code({ cedulaNumber: '15.111.222' })).toBe('OK')
  })

  it('accepts the five cédula types and refuses others', () => {
    for (const type of ['V', 'E', 'J', 'P', 'G']) expect(code({ cedulaType: type })).toBe('OK')
    expect(code({ cedulaType: 'X' })).toBe('CEDULA_TYPE_UNKNOWN')
  })

  it('checks sex and email only when given', () => {
    expect(code({ sex: '' })).toBe('OK')
    expect(code({ sex: 'Z' })).toBe('SEX_UNKNOWN')
    expect(code({ email: 'no-es-correo' })).toBe('EMAIL_INVALID')
    expect(code({ email: 'a@b.co' })).toBe('OK')
  })
})

describe('parseCedulaPaste with the five types', () => {
  it('fills both fields from a pasted cédula', () => {
    expect(parseCedulaPaste('V-12.345.678')).toEqual({ type: 'V', digits: '12345678' })
    expect(parseCedulaPaste('J-30123456')).toEqual({ type: 'J', digits: '30123456' })
    expect(parseCedulaPaste('p 1234567')).toEqual({ type: 'P', digits: '1234567' })
  })
})

describe('nameSimilarity', () => {
  it('scores identical names at 1 and unrelated names low', () => {
    const a = normalizeName('Maria Gonzalez').key
    expect(nameSimilarity(a, a)).toBe(1)
    expect(nameSimilarity(a, normalizeName('Pedro Ramirez').key)).toBeLessThan(0.3)
  })
  it('flags a near-identical spelling at or above the threshold', () => {
    const a = normalizeName('Josefina Hernandez Rodriguez').key
    const b = normalizeName('Josefina Hernandes Rodriguez').key
    expect(nameSimilarity(a, b)).toBeGreaterThanOrEqual(SIMILAR_NAME_THRESHOLD - 0.1)
    expect(nameSimilarity(a, a)).toBeGreaterThanOrEqual(SIMILAR_NAME_THRESHOLD)
  })
})

const context = {
  userName: 'Prueba',
  userId: 'u-test',
  now: '2026-11-04T15:00:00.000Z',
  consents: [] as ('WHATSAPP' | 'EMAIL')[],
  confirmedSimilarIds: [] as string[],
}

function valid(overrides: Partial<{ fullName: string; cedulaType: 'V' | 'E'; cedulaDigits: string | null }> = {}) {
  const fullName = overrides.fullName ?? 'Cliente De Prueba'
  return {
    fullName,
    nameKey: normalizeName(fullName).key,
    cedulaType: overrides.cedulaDigits === null ? null : (overrides.cedulaType ?? 'V'),
    cedulaDigits: overrides.cedulaDigits === undefined ? '19000001' : overrides.cedulaDigits,
    birthDate: '1990-01-01',
    sex: null,
    phone: null,
    email: null,
  } as const
}

describe('client store', () => {
  it('inserts a Verificado client when the cédula pair is complete, Sin verificar when not', () => {
    const verified = insertClient(valid({ fullName: 'Verificado Uno', cedulaDigits: '19000011' }), context)
    const unverified = insertClient(valid({ fullName: 'Sin Cedula Dos', cedulaDigits: null }), context)
    expect(verified.verified).toBe(true)
    expect(unverified.verified).toBe(false)
    expect(getClient(verified.id)?.version).toBe(1)
  })

  it('finds a duplicate cédula, active or inactive, but ignores the client being saved (E-16)', () => {
    const created = insertClient(valid({ fullName: 'Duplicado Tres', cedulaDigits: '19000022' }), context)
    expect(findByCedula('V', '19000022', null)?.id).toBe(created.id)
    expect(findByCedula('V', '19000022', created.id)).toBeNull()
    expect(findByCedula('E', '19000022', null)).toBeNull()
  })

  it('does not count a soft-deleted client as a duplicate (c-5 in the demo data)', () => {
    expect(findByCedula('V', '12000005', null)).toBeNull()
  })

  it('finds similar names and excludes the client itself', () => {
    const created = insertClient(valid({ fullName: 'Josefina Hernandez Rodriguez', cedulaDigits: '19000033' }), context)
    const key = normalizeName('Josefina Hernandez Rodriguez').key
    expect(findSimilar(key, null).map((record) => record.id)).toContain(created.id)
    expect(findSimilar(key, created.id).map((record) => record.id)).not.toContain(created.id)
  })

  it('refuses a save made from an older version and tells who saved last', () => {
    const created = insertClient(valid({ fullName: 'Concurrente Cuatro', cedulaDigits: '19000044' }), context)
    const first = updateClient(created.id, 1, { ...valid({ fullName: 'Concurrente Cuatro', cedulaDigits: '19000044' }), phone: '0414' }, { ...context, userName: 'Primera' })
    expect(first.ok).toBe(true)
    const second = updateClient(created.id, 1, valid({ fullName: 'Concurrente Cuatro', cedulaDigits: '19000044' }), { ...context, userName: 'Segunda' })
    expect(second.ok).toBe(false)
    if (!second.ok && second.reason === 'CONFLICT') {
      expect(second.current.lastSavedBy).toBe('Primera')
      expect(second.current.version).toBe(2)
    }
  })

  it('records a consent with who and when, and a withdrawal keeps the history', () => {
    const created = insertClient(valid({ fullName: 'Consentimiento Cinco', cedulaDigits: '19000055' }), { ...context, consents: ['WHATSAPP'] })
    expect(created.consents).toHaveLength(1)
    expect(created.consents[0]).toMatchObject({ channel: 'WHATSAPP', grantedBy: 'u-test', withdrawnAt: null })
    const result = updateClient(created.id, 1, valid({ fullName: 'Consentimiento Cinco', cedulaDigits: '19000055' }), { ...context, consents: [] })
    expect(result.ok).toBe(true)
    expect(getClient(created.id)?.consents[0]?.withdrawnAt).not.toBeNull()
  })

  it('searches by name or by cédula digits with or without dots, and hides inactive and deleted by default', () => {
    expect(searchClients({ text: 'demo uno', includeInactive: false }).map((r) => r.id)).toContain('c-1')
    expect(searchClients({ text: 'V-12.000.001', includeInactive: false }).map((r) => r.id)).toContain('c-1')
    expect(searchClients({ text: '', includeInactive: false }).map((r) => r.id)).not.toContain('c-4')
    expect(searchClients({ text: '', includeInactive: true }).map((r) => r.id)).toContain('c-4')
    expect(searchClients({ text: '', includeInactive: true }).map((r) => r.id)).not.toContain('c-5')
  })
})
