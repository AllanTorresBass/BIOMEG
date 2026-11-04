import 'server-only'

import { randomUUID } from 'node:crypto'
import { demoSeed } from '@/lib/db/memory/seed'
import { normalizeName } from '@/lib/utils/format'
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
  return { ok: true, before, after: structuredClone(current) }
}
