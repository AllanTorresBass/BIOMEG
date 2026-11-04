import 'server-only'

import { randomBytes } from 'node:crypto'
import { resultsOf } from '@/lib/db/memory/result-store'
import { demoSeed } from '@/lib/db/memory/seed'
import type { IssuedLine, IssueRecord } from '@/types/orders/issue.types'

interface IssueStoreState {
  issues: Map<string, IssueRecord>
  counter: number
}

const SEEDED_ORDER = 'o-1'

function newToken(): string {
  return randomBytes(9).toString('base64url')
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
  issues.set('i-1', {
    id: 'i-1',
    orderId: SEEDED_ORDER,
    token: newToken(),
    status: 'VIGENTE',
    createdAt: new Date().toISOString(),
    replacedAt: null,
    lines: printedLinesOf(SEEDED_ORDER),
  })
  return { issues, counter: 1 }
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
  return [...state.issues.values()].find((issue) => issue.token === token) ?? null
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
  const issue: IssueRecord = {
    id: `i-${state.counter}`,
    orderId,
    token: newToken(),
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
