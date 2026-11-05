import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('server-only', () => ({}))
vi.mock('next/headers', () => ({
  headers: async () => new Headers({ 'x-forwarded-for': '203.0.113.7' }),
  cookies: async () => ({ get: () => undefined, set: () => undefined, delete: () => undefined }),
}))

import { requestPortalCode } from '@/lib/server/commands/portal'
import { listAudit, resetAuditForTests } from '@/lib/db/memory/audit-store'
import { getClient } from '@/lib/db/memory/client-store'
import { getStub } from '@/lib/db/memory/order-index'
import { resetPortalStore } from '@/lib/db/memory/portal-store'
import { isDemoAccessOn } from '@/lib/server/settings'

const owner = getClient(getStub('o-1')!.clientId)!
const birth = owner.birthDate!.split('-').reverse().join('/')
const right = { type: owner.cedulaType!, digits: owner.cedulaDigits!, birth }

beforeEach(() => {
  resetPortalStore()
  resetAuditForTests()
})

describe('one generic answer', () => {
  it.each([
    ['an incomplete cédula', { ...right, digits: '12' }],
    ['an unknown cédula', { ...right, digits: '99999998' }],
    ['a wrong birth date', { ...right, birth: '01/01/1900' }],
    ['a wrong type on a right number', { ...right, type: right.type === 'V' ? 'E' : 'V' }],
    ['a malformed birth date', { ...right, birth: 'ayer' }],
  ])('gives the same response for %s', async (_name, input) => {
    expect(await requestPortalCode(input)).toEqual({ kind: 'ANSWERED', demoCode: null })
  })

  it('logs a hash prefix and never the digits', async () => {
    await requestPortalCode({ ...right, birth: '01/01/1900' })
    const row = listAudit().at(-1)!
    expect(row.what.command).toBe('portal.login.failed')
    expect(row.what.recordId).toHaveLength(12)
    expect(JSON.stringify(listAudit())).not.toContain(right.digits)
  })

  it('pauses a cédula after repeated failures, and pauses an address across cédulas (E-41)', async () => {
    for (let i = 0; i < 5; i += 1) await requestPortalCode({ ...right, birth: '01/01/1900' })
    expect(await requestPortalCode(right)).toEqual({ kind: 'PAUSED' })

    resetPortalStore()
    for (let i = 0; i < 20; i += 1) await requestPortalCode({ ...right, digits: `${10_000_000 + i}` })
    expect(await requestPortalCode(right)).toEqual({ kind: 'PAUSED' })
  })

  it('sends the code on a full match and records it', async () => {
    const answer = await requestPortalCode(right)
    expect(answer.kind).toBe('ANSWERED')
    expect(listAudit().at(-1)?.what.command).toBe('portal.code.sent')
  })
})

describe('demo access', () => {
  it('is off in a built app unless the deployment opts in', () => {
    expect(isDemoAccessOn()).toBe(true)
    vi.stubEnv('NODE_ENV', 'production')
    expect(isDemoAccessOn()).toBe(false)
    vi.stubEnv('BIOMEG_DEMO', 'on')
    expect(isDemoAccessOn()).toBe(true)
    vi.unstubAllEnvs()
  })
})
