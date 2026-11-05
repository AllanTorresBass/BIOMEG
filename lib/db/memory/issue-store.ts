import 'server-only'

import { createHash, randomBytes, randomInt, timingSafeEqual } from 'node:crypto'
import { resultsOf } from '@/lib/db/memory/result-store'
import { demoSeed } from '@/lib/db/memory/seed'
import type { IssuedLine, IssueRecord } from '@/types/orders/issue.types'

/** What the paper prints. Lookups use only the hashes on the issue. */
export interface IssuePrintSecrets {
  token: string
  consultCode: string
}

interface IssueStoreState {
  issues: Map<string, IssueRecord>
  /** Prototype only: lets the preview redraw the QR before a PDF is kept. Kept apart from issue records. */
  printSecrets: Map<string, IssuePrintSecrets>
  counter: number
}

const SEEDED_ORDER = 'o-1'

const TOKEN_BYTES = 32
const CONSULT_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'
const CONSULT_LENGTH = 12

function sha256(text: string): string {
  return createHash('sha256').update(text).digest('hex')
}

function normalizeConsultCode(raw: string): string {
  return raw.toUpperCase().replace(/[^A-Z0-9]/g, '')
}

function consultHashOf(issueId: string, code: string): string {
  return sha256(`${issueId}:${normalizeConsultCode(code)}`)
}

function newConsultCode(): string {
  const chars = Array.from({ length: CONSULT_LENGTH }, () => CONSULT_ALPHABET[randomInt(CONSULT_ALPHABET.length)])
  const code = chars.join('')
  return `${code.slice(0, 4)}-${code.slice(4, 8)}-${code.slice(8)}`
}

/** A new token and code for one issue. Neither comes from the order number or from each other. */
function mintSecrets(issueId: string): { secrets: IssuePrintSecrets; hashes: Pick<IssueRecord, 'tokenHash' | 'consultHash'> } {
  const secrets = { token: randomBytes(TOKEN_BYTES).toString('base64url'), consultCode: newConsultCode() }
  return { secrets, hashes: { tokenHash: sha256(secrets.token), consultHash: consultHashOf(issueId, secrets.consultCode) } }
}

/** The lines of an order as they stand right now. This is what an issue prints. */
export function printedLinesOf(orderId: string): IssuedLine[] {
  const sections = new Map(demoSeed.resultLines.map((line) => [line.id, line]))
  return resultsOf(orderId).flatMap((cell) => {
    const line = sections.get(cell.lineId)
    if (!line) return []
    return [{ lineId: cell.lineId, section: line.section, name: line.name, value: cell.value, mark: cell.mark, version: cell.version }]
  })
}

function buildState(): IssueStoreState {
  const issues = new Map<string, IssueRecord>()
  const seeded = mintSecrets('i-1')
  issues.set('i-1', {
    id: 'i-1',
    orderId: SEEDED_ORDER,
    ...seeded.hashes,
    status: 'VIGENTE',
    createdAt: new Date().toISOString(),
    replacedAt: null,
    lines: printedLinesOf(SEEDED_ORDER),
  })
  return { issues, printSecrets: new Map([['i-1', seeded.secrets]]), counter: 1 }
}

const globalStore = globalThis as typeof globalThis & { __biomegIssues?: IssueStoreState }
const state: IssueStoreState = (globalStore.__biomegIssues ??= buildState())

export function issuesOf(orderId: string): IssueRecord[] {
  return [...state.issues.values()].filter((issue) => issue.orderId === orderId)
}

export function vigenteIssueOf(orderId: string): IssueRecord | null {
  return issuesOf(orderId).find((issue) => issue.status === 'VIGENTE') ?? null
}

export function issueByToken(token: string): IssueRecord | null {
  const tokenHash = sha256(token)
  return [...state.issues.values()].find((issue) => issue.tokenHash === tokenHash) ?? null
}

export function printSecretsOf(issueId: string): IssuePrintSecrets | null {
  return state.printSecrets.get(issueId) ?? null
}

export function consultCodeMatches(issue: IssueRecord, code: string): boolean {
  const expected = Buffer.from(issue.consultHash, 'hex')
  const actual = Buffer.from(consultHashOf(issue.id, code), 'hex')
  return timingSafeEqual(expected, actual)
}

/** The current issue becomes REEMPLAZADO and a new one with a new token takes its place. */
export function replaceIssue(orderId: string, lines: IssuedLine[]): { issue: IssueRecord; replaced: IssueRecord | null } {
  const at = new Date().toISOString()
  const current = vigenteIssueOf(orderId)
  let replaced: IssueRecord | null = null
  if (current) {
    replaced = { ...current, status: 'REEMPLAZADO', replacedAt: at }
    state.issues.set(current.id, replaced)
  }
  state.counter += 1
  const id = `i-${state.counter}`
  const minted = mintSecrets(id)
  state.printSecrets.set(id, minted.secrets)
  const issue: IssueRecord = {
    id,
    orderId,
    ...minted.hashes,
    status: 'VIGENTE',
    createdAt: at,
    replacedAt: null,
    lines,
  }
  state.issues.set(issue.id, issue)
  return { issue, replaced }
}

export interface IssueStoreSnapshot {
  issues: [string, IssueRecord][]
  counter: number
}

export function snapshotIssues(): IssueStoreSnapshot {
  return { issues: [...state.issues.entries()], counter: state.counter }
}

export function restoreIssues(snapshot: IssueStoreSnapshot): void {
  state.issues = new Map(snapshot.issues)
  state.counter = snapshot.counter
}
