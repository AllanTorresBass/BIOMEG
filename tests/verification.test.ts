import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('server-only', () => ({}))
vi.mock('next/headers', () => ({ headers: async () => new Headers({ 'x-forwarded-for': '203.0.113.9', host: 'lab.example' }) }))

import { VERIFICATION_SETTINGS } from '@/lib/config/verification'
import { listAudit } from '@/lib/db/memory/audit-store'
import { getClient } from '@/lib/db/memory/client-store'
import { issuesOf, printSecretsOf, replaceIssue, snapshotIssues, restoreIssues, vigenteIssueOf, printedLinesOf } from '@/lib/db/memory/issue-store'
import { getStub, updateStub } from '@/lib/db/memory/order-index'
import { resetVerificationStore } from '@/lib/db/memory/verification-store'
import { buildReport } from '@/lib/server/domain/report'
import { openOriginalReport, readVerification } from '@/lib/server/domain/verification'
import { demoSeed } from '@/lib/db/memory/seed'

const ORDER = 'o-1'
const DAY = 86_400_000
const original = { ...getStub(ORDER)!, correctionOpen: false }
let snapshot: ReturnType<typeof snapshotIssues>

function secrets() {
  const issue = vigenteIssueOf(ORDER)!
  return { issue, ...printSecretsOf(issue.id)! }
}

beforeEach(() => {
  snapshot = snapshotIssues()
  resetVerificationStore()
})

afterEach(() => {
  restoreIssues(snapshot)
  updateStub(ORDER, original)
  demoSeed.settings.qrEnabled = true
  vi.unstubAllEnvs()
})

describe('verification page answers', () => {
  it('reads Liberado for the current issue of a released order', async () => {
    const view = await readVerification(secrets().token)
    expect(view).toMatchObject({ kind: 'ESTADO', state: 'LIBERADO', orderNumber: '000001', labName: 'BIOMEG', valueCheck: false })
  })

  it('reads Incompleto and En revisión from the order state', async () => {
    const { token } = secrets()
    updateStub(ORDER, { released: false, hasResult: true })
    expect(await readVerification(token)).toMatchObject({ kind: 'ESTADO', state: 'INCOMPLETO' })
    updateStub(ORDER, { released: true, correctionOpen: true })
    expect(await readVerification(token)).toMatchObject({ kind: 'ESTADO', state: 'EN_CORRECCION' })
  })

  it('says a replaced issue was replaced, with the date', async () => {
    const { token } = secrets()
    replaceIssue(ORDER, printedLinesOf(ORDER))
    expect(await readVerification(token)).toMatchObject({ kind: 'REEMPLAZADO', orderNumber: '000001' })
  })

  it.each([
    ['voided', { voided: true }],
    ['open', { released: false, hasResult: false }],
  ])('answers No disponible for a %s order', async (_name, patch) => {
    const { token } = secrets()
    updateStub(ORDER, patch)
    expect(await readVerification(token)).toEqual({ kind: 'NO_DISPONIBLE' })
  })

  it.each(['desconocido', '000001', 'o-1', 'i-1'])('answers No disponible for %s in place of a token', async (guess) => {
    expect(await readVerification(guess)).toEqual({ kind: 'NO_DISPONIBLE' })
  })

  it('carries no name, cédula, phone, exam, or value', async () => {
    const stub = getStub(ORDER)!
    const { token, issue } = secrets()
    const json = JSON.stringify(await readVerification(token))
    const client = getClient(stub.clientId)!
    const forbidden = [stub.clientName, stub.cedulaDigits, client.phone, ...issue.lines.map((line) => line.name)]
    for (const value of forbidden) {
      if (value) expect(json).not.toContain(value)
    }
    expect(Object.keys(await readVerification(token)).sort()).toEqual(
      ['kind', 'labName', 'orderNumber', 'reportDateText', 'state', 'valueCheck'].sort(),
    )
  })

  it('rate limits guessing by address, even for a real token', async () => {
    const { token } = secrets()
    for (let i = 0; i < VERIFICATION_SETTINGS.requestsPerMinute; i += 1) await readVerification(`adivina-${i}`)
    expect(await readVerification(token)).toEqual({ kind: 'NO_DISPONIBLE' })
  })

  it('logs each answer with a hash prefix and never the full token', async () => {
    const { token } = secrets()
    await readVerification(token)
    await readVerification('desconocido')
    const rows = listAudit().filter((row) => row.what.command === 'verify.read')
    expect(rows.some((row) => row.result.outcome === 'ALLOWED' && row.where.channel === 'verify')).toBe(true)
    expect(rows.some((row) => row.result.outcome === 'REFUSED' && row.what.recordId?.length === 12)).toBe(true)
    expect(JSON.stringify(rows)).not.toContain(token)
  })
})

describe('tokens', () => {
  it('holds at least 128 random bits, hashed on the record', () => {
    const { token, issue } = secrets()
    expect(Buffer.from(token, 'base64url').length).toBeGreaterThanOrEqual(16)
    expect(JSON.stringify(issue)).not.toContain(token)
  })

  it('gives a replacement issue a new token and code', () => {
    const before = secrets()
    const { issue } = replaceIssue(ORDER, printedLinesOf(ORDER))
    const after = printSecretsOf(issue.id)!
    expect(after.token).not.toBe(before.token)
    expect(after.consultCode).not.toBe(before.consultCode)
    expect(issuesOf(ORDER).filter((entry) => entry.status === 'VIGENTE')).toHaveLength(1)
  })
})

describe('the printed report', () => {
  const build = () => buildReport({ stub: getStub(ORDER)!, mode: 'PACIENTE', lineId: null, origin: 'https://lab.example' })

  it('points the QR at the verification page', () => {
    const built = build()
    if (built.kind !== 'READY') throw new Error('not ready')
    expect(built.document.verifyUrl).toBe(`https://lab.example/verificar/${secrets().token}`)
    expect(built.document.consultCode).toBeNull()
  })

  it('leaves the code off when the QR switch is off', () => {
    demoSeed.settings.qrEnabled = false
    const built = build()
    if (built.kind !== 'READY') throw new Error('not ready')
    expect(built.document.verifyUrl).toBeNull()
  })

  it('prints a code of at least 10 random characters, never in the QR', () => {
    vi.stubEnv('BIOMEG_VALUE_CHECK', 'on')
    const built = build()
    if (built.kind !== 'READY') throw new Error('not ready')
    const code = built.document.consultCode!
    expect(code.replace(/-/g, '').length).toBeGreaterThanOrEqual(10)
    expect(built.document.verifyUrl).not.toContain(code)
    expect(secrets().token.toUpperCase()).not.toContain(code.replace(/-/g, ''))
  })
})

describe('value check, R-149', () => {
  it('refuses while the setting is off, with the right code', async () => {
    const { token, consultCode } = secrets()
    expect(await openOriginalReport(token, consultCode)).toBeNull()
  })

  it('opens the original PDF with the printed code, and logs it', async () => {
    vi.stubEnv('BIOMEG_VALUE_CHECK', 'on')
    const { token, consultCode } = secrets()
    expect(await readVerification(token)).toMatchObject({ valueCheck: true })
    const file = await openOriginalReport(token, consultCode.toLowerCase())
    expect(file?.pdf.subarray(0, 5).toString()).toBe('%PDF-')
    expect(listAudit().some((row) => row.what.command === 'verify.file.read' && row.result.outcome === 'ALLOWED')).toBe(true)
  })

  it('refuses a replaced issue, an unreleased order, and more than 90 days', async () => {
    vi.stubEnv('BIOMEG_VALUE_CHECK', 'on')
    const first = secrets()
    expect(await openOriginalReport(first.token, first.consultCode, Date.parse(first.issue.createdAt) + 91 * DAY)).toBeNull()

    updateStub(ORDER, { correctionOpen: true })
    expect(await openOriginalReport(first.token, first.consultCode)).toBeNull()
    updateStub(ORDER, { correctionOpen: false })

    replaceIssue(ORDER, printedLinesOf(ORDER))
    expect(await openOriginalReport(first.token, first.consultCode)).toBeNull()
  })

  it('pauses the token after five wrong codes, while the state page still works', async () => {
    vi.stubEnv('BIOMEG_VALUE_CHECK', 'on')
    const { token, consultCode } = secrets()
    const now = Date.now()
    for (let i = 0; i < VERIFICATION_SETTINGS.maxWrongCodes; i += 1) {
      expect(await openOriginalReport(token, 'MAL-CODIGO', now)).toBeNull()
    }
    expect(await openOriginalReport(token, consultCode, now + 1000)).toBeNull()
    expect(await readVerification(token)).toMatchObject({ kind: 'ESTADO', state: 'LIBERADO' })

    expect(await openOriginalReport(token, consultCode, now + 16 * 60_000)).not.toBeNull()
  })
})
