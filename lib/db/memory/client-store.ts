import 'server-only'

import { randomUUID } from 'node:crypto'
import { moveOrders, restoreOrders, syncIdentity } from '@/lib/db/memory/order-index'
import { demoSeed } from '@/lib/db/memory/seed'
import { normalizeName } from '@/lib/utils/format'
import type { CedulaType } from '@/lib/utils/format'
import type { MovedOrder } from '@/types/domain/order-stub.types'
import { nameSimilarity, SIMILAR_NAME_THRESHOLD } from '@/lib/utils/similarity'
import type {
  ClientRecord,
  ClientSummary,
  ConsentChannel,
  ValidClientInput,
} from '@/types/domain/client.types'

interface ClientState {
  clients: Map<string, ClientRecord>
}

function buildState(): ClientState {
  const clients = new Map<string, ClientRecord>()
  for (const seed of demoSeed.clients) {
    clients.set(seed.id, {
      id: seed.id,
      fullName: seed.fullName,
      nameKey: normalizeName(seed.fullName).key,
      cedulaType: seed.cedulaType,
      cedulaDigits: seed.cedulaDigits,
      birthDate: seed.birthDate,
      sex: seed.sex,
      phone: null,
      email: null,
      verified: seed.verified,
      active: seed.active,
      deletedAt: seed.deletedAt,
      version: seed.version,
      createdAt: '2026-10-01T12:00:00.000Z',
      lastSavedBy: 'Sistema',
      lastSavedAt: '2026-10-01T12:00:00.000Z',
      consents: [],
      similarConfirmedIds: [],
    })
  }
  return { clients }
}

const globalStore = globalThis as typeof globalThis & { __biomegClientState?: ClientState }
const state: ClientState = (globalStore.__biomegClientState ??= buildState())

export function summarize(record: ClientRecord): ClientSummary {
  return {
    id: record.id,
    fullName: record.fullName,
    cedulaType: record.cedulaType,
    cedulaDigits: record.cedulaDigits,
    birthDate: record.birthDate,
    active: record.active,
    verified: record.verified,
  }
}

export function getClient(id: string): ClientRecord | null {
  const record = state.clients.get(id)
  return record && record.deletedAt === null ? record : null
}

export interface ClientQuery {
  text: string
  includeInactive: boolean
}

/** Matches the name key, or the cédula digits typed with or without dots. Soft-deleted clients never appear. */
export function searchClients({ text, includeInactive }: ClientQuery): ClientRecord[] {
  const typed = text.trim()
  const key = normalizeName(typed).key
  const digits = typed.replace(/[.\-\sA-Za-z]/g, '')
  const found = [...state.clients.values()].filter((record) => {
    if (record.deletedAt !== null) return false
    if (!includeInactive && !record.active) return false
    if (typed === '') return true
    if (key !== '' && record.nameKey.includes(key)) return true
    return digits.length >= 3 && record.cedulaDigits !== null && record.cedulaDigits.includes(digits)
  })
  return found.sort((a, b) => a.nameKey.localeCompare(b.nameKey, 'es-VE'))
}

/** An active or inactive client with this cédula. A soft-deleted one does not count (P-01). */
export function findByCedula(type: string, digits: string, excludeId: string | null): ClientRecord | null {
  for (const record of state.clients.values()) {
    if (record.deletedAt !== null || record.id === excludeId) continue
    if (record.cedulaType === type && record.cedulaDigits === digits) return record
  }
  return null
}

/** Other clients whose normalized name scores at or above the threshold (P-03). */
export function findSimilar(nameKey: string, excludeId: string | null): ClientRecord[] {
  const found: ClientRecord[] = []
  for (const record of state.clients.values()) {
    if (record.deletedAt !== null || record.id === excludeId) continue
    if (nameSimilarity(nameKey, record.nameKey) >= SIMILAR_NAME_THRESHOLD) found.push(record)
  }
  return found
}

interface SaveContext {
  userName: string
  userId: string
  now: string
  consents: ConsentChannel[]
  confirmedSimilarIds: string[]
}

function applyConsents(record: ClientRecord, wanted: ConsentChannel[], userId: string, now: string): void {
  for (const channel of ['WHATSAPP', 'EMAIL'] as const) {
    const current = record.consents.find((entry) => entry.channel === channel && entry.withdrawnAt === null)
    const has = wanted.includes(channel)
    if (has && !current) {
      record.consents.push({ channel, grantedAt: now, grantedBy: userId, withdrawnAt: null })
    } else if (!has && current) {
      current.withdrawnAt = now
    }
  }
}

export function insertClient(value: ValidClientInput, context: SaveContext): ClientRecord {
  const record: ClientRecord = {
    id: `c-${randomUUID().slice(0, 8)}`,
    ...value,
    verified: value.cedulaType !== null,
    active: true,
    deletedAt: null,
    version: 1,
    createdAt: context.now,
    lastSavedBy: context.userName,
    lastSavedAt: context.now,
    consents: [],
    similarConfirmedIds: context.confirmedSimilarIds,
  }
  applyConsents(record, context.consents, context.userId, context.now)
  state.clients.set(record.id, record)
  return record
}

export type UpdateResult =
  | { ok: true; before: ClientRecord; after: ClientRecord }
  | { ok: false; reason: 'NOT_FOUND' }
  | { ok: false; reason: 'CONFLICT'; current: ClientRecord }

/** Saves only when the caller still holds the current version. Two savers cannot overwrite each other. */
export function updateClient(
  id: string,
  expectedVersion: number,
  value: ValidClientInput,
  context: SaveContext,
): UpdateResult {
  const current = getClient(id)
  if (!current) return { ok: false, reason: 'NOT_FOUND' }
  if (current.version !== expectedVersion) return { ok: false, reason: 'CONFLICT', current }

  const before: ClientRecord = structuredClone(current)
  Object.assign(current, value, {
    verified: value.cedulaType !== null,
    version: current.version + 1,
    lastSavedBy: context.userName,
    lastSavedAt: context.now,
    similarConfirmedIds: [...new Set([...current.similarConfirmedIds, ...context.confirmedSimilarIds])],
  })
  applyConsents(current, context.consents, context.userId, context.now)
  syncIdentity(id, { clientName: current.fullName, cedulaType: current.cedulaType, cedulaDigits: current.cedulaDigits })
  return { ok: true, before, after: structuredClone(current) }
}

export interface Actor {
  userId: string
  userName: string
  now: string
}

interface LifecycleState {
  merges: MergeRecord[]
  requests: MergeRequest[]
}

export interface MergeRecord {
  id: string
  survivorId: string
  sourceId: string
  survivorName: string
  sourceName: string
  sourceWasActive: boolean
  movedOrders: MovedOrder[]
  mergedAt: string
  mergedBy: string
  undoneAt: string | null
}

export interface MergeRequest {
  clientId: string
  note: string
  requestedBy: string
  requestedAt: string
}

const lifecycleStore = globalThis as typeof globalThis & { __biomegClientLifecycle?: LifecycleState }
const lifecycle: LifecycleState = (lifecycleStore.__biomegClientLifecycle ??= { merges: [], requests: [] })

function touch(record: ClientRecord, actor: Actor): void {
  record.version += 1
  record.lastSavedBy = actor.userName
  record.lastSavedAt = actor.now
}

export type ActiveResult =
  | { ok: true; changed: boolean; before: ClientRecord; after: ClientRecord }
  | { ok: false; reason: 'NOT_FOUND' }

/** Running it twice changes nothing the second time. */
export function setClientActive(id: string, active: boolean, actor: Actor): ActiveResult {
  const record = getClient(id)
  if (!record) return { ok: false, reason: 'NOT_FOUND' }
  const before = structuredClone(record)
  if (record.active === active) return { ok: true, changed: false, before, after: before }
  record.active = active
  touch(record, actor)
  return { ok: true, changed: true, before, after: structuredClone(record) }
}

/** Never a hard delete. The record stays, out of search, out of Incluir inactivos, and out of the portal. */
export function softDeleteClient(id: string, actor: Actor): ActiveResult {
  const record = getClient(id)
  if (!record) return { ok: false, reason: 'NOT_FOUND' }
  const before = structuredClone(record)
  record.deletedAt = actor.now
  record.active = false
  touch(record, actor)
  return { ok: true, changed: true, before, after: structuredClone(record) }
}

export type CorrectResult =
  | { ok: true; before: ClientRecord; after: ClientRecord; ordersUpdated: string[] }
  | { ok: false; reason: 'NOT_FOUND' | 'CEDULA_TAKEN' }

export function correctClientCedula(id: string, type: CedulaType, digits: string, actor: Actor): CorrectResult {
  const record = getClient(id)
  if (!record) return { ok: false, reason: 'NOT_FOUND' }
  if (findByCedula(type, digits, id)) return { ok: false, reason: 'CEDULA_TAKEN' }
  const before = structuredClone(record)
  record.cedulaType = type
  record.cedulaDigits = digits
  record.verified = true
  touch(record, actor)
  const ordersUpdated = syncIdentity(id, { clientName: record.fullName, cedulaType: type, cedulaDigits: digits })
  return { ok: true, before, after: structuredClone(record), ordersUpdated }
}

export type MergeResult =
  | { ok: true; merge: MergeRecord; survivorBefore: ClientRecord }
  | { ok: false; reason: 'NOT_FOUND' | 'SELF' }

/** Orders move to the survivor with its name and cédula. The source is soft-deleted in the same step. */
export function mergeClients(sourceId: string, survivorId: string, actor: Actor): MergeResult {
  if (sourceId === survivorId) return { ok: false, reason: 'SELF' }
  const source = getClient(sourceId)
  const survivor = getClient(survivorId)
  if (!source || !survivor) return { ok: false, reason: 'NOT_FOUND' }

  const survivorBefore = structuredClone(survivor)
  const movedOrders = moveOrders(source.id, {
    clientId: survivor.id,
    clientName: survivor.fullName,
    cedulaType: survivor.cedulaType,
    cedulaDigits: survivor.cedulaDigits,
  })
  const merge: MergeRecord = {
    id: `m-${randomUUID().slice(0, 8)}`,
    survivorId: survivor.id,
    sourceId: source.id,
    survivorName: survivor.fullName,
    sourceName: source.fullName,
    sourceWasActive: source.active,
    movedOrders,
    mergedAt: actor.now,
    mergedBy: actor.userName,
    undoneAt: null,
  }
  source.deletedAt = actor.now
  source.active = false
  touch(source, actor)
  lifecycle.merges.push(merge)
  lifecycle.requests = lifecycle.requests.filter((request) => request.clientId !== source.id && request.clientId !== survivor.id)
  return { ok: true, merge, survivorBefore }
}

export type UnmergeResult =
  | { ok: true; merge: MergeRecord; restoredOrders: number }
  | { ok: false; reason: 'NOT_FOUND' | 'ALREADY_UNDONE' | 'CEDULA_TAKEN' }

/** Restores the orders from the stored map and brings the absorbed client back. */
export function unmergeClients(mergeId: string, actor: Actor): UnmergeResult {
  const merge = lifecycle.merges.find((entry) => entry.id === mergeId)
  if (!merge) return { ok: false, reason: 'NOT_FOUND' }
  if (merge.undoneAt !== null) return { ok: false, reason: 'ALREADY_UNDONE' }
  const source = state.clients.get(merge.sourceId)
  if (!source) return { ok: false, reason: 'NOT_FOUND' }
  // A deleted cédula never blocked a new client, so another record may hold it by now.
  if (source.cedulaType && source.cedulaDigits && findByCedula(source.cedulaType, source.cedulaDigits, source.id)) {
    return { ok: false, reason: 'CEDULA_TAKEN' }
  }
  const restoredOrders = restoreOrders(merge.movedOrders)
  source.deletedAt = null
  source.active = merge.sourceWasActive
  touch(source, actor)
  merge.undoneAt = actor.now
  return { ok: true, merge, restoredOrders }
}

export function listOpenMerges(): MergeRecord[] {
  return lifecycle.merges.filter((entry) => entry.undoneAt === null).sort((a, b) => b.mergedAt.localeCompare(a.mergedAt))
}

export function addMergeRequest(request: MergeRequest): void {
  lifecycle.requests.push(request)
}

export function listMergeRequests(clientId: string): MergeRequest[] {
  return lifecycle.requests.filter((request) => request.clientId === clientId)
}

/** Clients an administrator may absorb into another: anyone still in the registry. */
export function listMergeCandidates(excludeId: string): ClientSummary[] {
  return [...state.clients.values()]
    .filter((record) => record.deletedAt === null && record.id !== excludeId)
    .sort((a, b) => a.nameKey.localeCompare(b.nameKey, 'es-VE'))
    .map(summarize)
}
