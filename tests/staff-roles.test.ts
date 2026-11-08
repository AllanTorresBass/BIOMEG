import { describe, expect, it } from 'vitest'
import { databaseAuth } from '@/lib/server/settings'
import { toAppRoles, toDbRole } from '@/lib/server/session/roles'

describe('staff role names', () => {
  it('maps the database role ids to the permission matrix', () => {
    expect(toDbRole('ADMINISTRACION')).toBe('administracion')
    expect(toAppRoles(['administracion', 'recepcion', 'unknown'])).toEqual(['ADMINISTRACION', 'RECEPCION'])
  })

  it('keeps unit tests on the memory accounts', () => {
    expect(databaseAuth()).toBe(false)
  })
})
