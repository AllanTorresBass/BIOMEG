import 'server-only'

import { demoSeed } from '@/lib/db/memory/seed'
import type { RegistryKind, RegistryRow } from '@/types/office/office.types'

const SEEDED_AT = '2026-11-04T12:00:00.000Z'

function seedRows(): RegistryRow[] {
  const physicians: RegistryRow[] = demoSeed.physicians.map((row) => ({
    id: row.id,
    kind: 'physicians',
    name: row.name,
    active: true,
    requiresTitular: false,
    updatedAt: SEEDED_AT,
  }))
  const companies: RegistryRow[] = demoSeed.companies.map((row) => ({
    id: row.id,
    kind: 'companies',
    name: row.name,
    active: row.active,
    requiresTitular: row.requiresTitular,
    updatedAt: SEEDED_AT,
  }))
  return [...physicians, ...companies]
}

const globalStore = globalThis as typeof globalThis & { __biomegRegistries?: RegistryRow[] }

function rows(): RegistryRow[] {
  return (globalStore.__biomegRegistries ??= seedRows())
}

export function listRegistry(kind: RegistryKind, includeInactive: boolean): RegistryRow[] {
  return rows()
    .filter((row) => row.kind === kind && (includeInactive || row.active))
    .sort((left, right) => left.name.localeCompare(right.name, 'es'))
}

export function activePhysicians(): { id: string; name: string }[] {
  return listRegistry('physicians', false).map((row) => ({ id: row.id, name: row.name }))
}

export function activeCompanies(): { id: string; name: string; active: boolean; requiresTitular: boolean }[] {
  return listRegistry('companies', false).map((row) => ({
    id: row.id,
    name: row.name,
    active: true,
    requiresTitular: row.requiresTitular,
  }))
}

export function findRegistry(kind: RegistryKind, id: string): RegistryRow | null {
  return rows().find((row) => row.kind === kind && row.id === id) ?? null
}

export function saveRegistry(input: {
  kind: RegistryKind
  id: string | null
  name: string
  active: boolean
  requiresTitular: boolean
  now: string
}): { ok: true; row: RegistryRow; created: boolean } | { ok: false; reason: 'DUPLICATE' | 'MISSING' } {
  const name = input.name.trim().slice(0, 120)
  const duplicate = rows().some(
    (row) => row.kind === input.kind && row.name.localeCompare(name, 'es', { sensitivity: 'accent' }) === 0 && row.id !== input.id,
  )
  if (duplicate) return { ok: false, reason: 'DUPLICATE' }

  if (input.id) {
    const current = findRegistry(input.kind, input.id)
    if (!current) return { ok: false, reason: 'MISSING' }
    current.name = name
    current.active = input.active
    current.requiresTitular = input.kind === 'companies' ? input.requiresTitular : false
    current.updatedAt = input.now
    return { ok: true, row: current, created: false }
  }

  const row: RegistryRow = {
    id: `reg-${rows().length + 1}`,
    kind: input.kind,
    name,
    active: input.active,
    requiresTitular: input.kind === 'companies' ? input.requiresTitular : false,
    updatedAt: input.now,
  }
  rows().push(row)
  return { ok: true, row, created: true }
}

type Movement = { id: string; reagentId: string; quantity: string; at: string; byName: string }

const movementStore = globalThis as typeof globalThis & { __biomegInventory?: Movement[] }

function movements(): Movement[] {
  return (movementStore.__biomegInventory ??= [])
}

export function listInventoryMovements(): readonly { id: string; reagentId: string; reagentName: string; quantity: string; at: string; byName: string }[] {
  return movements().map((movement) => ({
    ...movement,
    reagentName: findRegistry('reagents', movement.reagentId)?.name ?? movement.reagentId,
  }))
}

export function addInventoryMovement(reagentId: string, quantity: string, at: string, byName: string): void {
  const current = movements()
  current.push({ id: `inv-${current.length + 1}`, reagentId, quantity, at, byName })
}

export function resetRegistriesForTests(): void {
  globalStore.__biomegRegistries = seedRows()
  movements().length = 0
}
