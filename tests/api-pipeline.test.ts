import { readdirSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { z } from 'zod'

vi.mock('server-only', () => ({}))
vi.mock('next/headers', () => ({
  headers: async () => new Headers({ 'x-forwarded-for': '203.0.113.20' }),
  cookies: async () => ({ get: () => undefined }),
}))

import { API_LIMITS } from '@/lib/config/api'
import { resetRateLimits } from '@/lib/db/memory/rate-limit-store'
import { withCommand, withQuery } from '@/lib/server/api/with-command'
import { redact } from '@/lib/logger'

const schema = z.strictObject({ name: z.string() })
const open = { audience: 'public' } as const

function post(body: unknown, origin: string | null = 'https://lab.example') {
  return new Request('https://lab.example/api/v1/x', {
    method: 'POST',
    headers: { host: 'lab.example', 'content-type': 'application/json', ...(origin ? { origin } : {}) },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  })
}

beforeEach(() => resetRateLimits())

describe('withCommand', () => {
  const echo = withCommand(schema, async (input) => ({ ok: true, name: input.name }), open)

  it('runs the command on a valid same-origin request', async () => {
    const response = await echo(post({ name: 'a' }))
    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ ok: true, name: 'a' })
  })

  it.each([[null], ['https://otro.example']])('refuses the origin %s', async (origin) => {
    const run = vi.fn(async () => ({ ok: true }))
    const response = await withCommand(schema, run, open)(post({ name: 'a' }, origin))
    expect(response.status).toBe(403)
    expect(run).not.toHaveBeenCalled()
  })

  it.each([['not json'], [{ name: 1 }], [{ name: 'a', extra: true }]])('answers 400 for %j', async (body) => {
    const response = await echo(post(body))
    expect(response.status).toBe(400)
    expect((await response.json()).error.code).toBe('VALIDATION')
  })

  it('keeps a refused result in the one error shape', async () => {
    const refused = withCommand(schema, async () => ({ ok: false, message: 'No.', need: null }), open)
    const response = await refused(post({ name: 'a' }))
    expect(response.status).toBe(409)
    expect((await response.json()).error).toMatchObject({ code: 'STATE', message: 'No.', details: { result: { ok: false } } })
  })

  it('answers 428 when the screen must collect a gesture', async () => {
    const response = await withCommand(schema, async () => ({ ok: false, message: 'Confirme.', need: 'CONFIRM' }), open)(post({ name: 'a' }))
    expect(response.status).toBe(428)
  })

  it('hides an unexpected failure', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const response = await withCommand(schema, async () => {
      throw new Error('V-12345678 falló')
    }, open)(post({ name: 'a' }))
    expect(response.status).toBe(500)
    expect(JSON.stringify(await response.json())).not.toContain('12345678')
  })

  it('answers 401 with no staff session, before running the command', async () => {
    const run = vi.fn(async () => ({ ok: true }))
    const response = await withCommand(schema, run)(post({ name: 'a' }))
    expect(response.status).toBe(401)
    expect((await response.json()).error.code).toBe('SESSION')
    expect(run).not.toHaveBeenCalled()
  })

  it('rate limits by address', async () => {
    const limited = withCommand(schema, async () => ({ ok: true }), { perMinute: 2, ...open })
    await limited(post({ name: 'a' }))
    await limited(post({ name: 'a' }))
    expect((await limited(post({ name: 'a' }))).status).toBe(429)
    expect(API_LIMITS.portalPerMinute).toBeLessThan(API_LIMITS.staffPerMinute)
  })
})

describe('withQuery', () => {
  it('answers 404 when the read returns nothing', async () => {
    const read = withQuery(z.strictObject({ date: z.string() }), async () => null, open)
    expect((await read(new Request('https://lab.example/x?date=2026-11-04'))).status).toBe(404)
  })
})

describe('logger', () => {
  it('redacts personal data by field and by shape', () => {
    const output = JSON.stringify(redact({ fullName: 'Ana', note: 'V-12.345.678 ana@example.com 04141234567 01/02/1990', count: 3 }))
    for (const value of ['Ana', '12.345.678', 'ana@example.com', '04141234567', '01/02/1990']) expect(output).not.toContain(value)
    expect(output).toContain('"count":3')
  })
})

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const full = path.join(dir, entry)
    return statSync(full).isDirectory() ? walk(full) : [full]
  })
}

describe('route scan', () => {
  const routes = walk('app/api/v1').filter((file) => file.endsWith('route.ts'))
  // A native form post that returns a PDF. It has its own rate limit and wrong-code pause, tested in verification.test.ts.
  const ownPipeline = new Set([path.join('app/api/v1/verificar/[token]/informe/route.ts')])

  it('finds the endpoints', () => {
    expect(routes.length).toBeGreaterThan(40)
  })

  it.each(routes.filter((file) => !ownPipeline.has(file)))('%s goes through the pipeline', (file) => {
    expect(readFileSync(file, 'utf8')).toMatch(/= with(Command|Query)\(/)
  })

  it('leaves no Server Actions in the application', () => {
    const code = ['app', 'components', 'lib', 'hooks'].flatMap(walk).filter((file) => /\.tsx?$/.test(file))
    expect(code.filter((file) => /^\s*['"]use server['"]/m.test(readFileSync(file, 'utf8')))).toEqual([])
  })
})
