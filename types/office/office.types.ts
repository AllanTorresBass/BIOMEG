import type { StaffRole } from '@/types/auth/auth.types'
import type { PriceColumn } from '@/types/domain/demo.types'

export type RegistryKind =
  | 'physicians'
  | 'companies'
  | 'suppliers'
  | 'reagents'
  | 'equipment'
  | 'parasites'
  | 'antibiotics'
  | 'organisms'
  | 'bacteriology_samples'
  | 'bacteriology_observations'
  | 'profiles'
  | 'retentions'

export interface RegistryRow {
  id: string
  kind: RegistryKind
  name: string
  active: boolean
  requiresTitular: boolean
  updatedAt: string
}

export type OfficeNeed = 'CONFIRM_OVERRIDE' | 'STEP_UP' | 'MOTIVO' | null

export interface OfficeResult {
  ok: boolean
  message: string
  need: OfficeNeed
}

export interface PriceCellView {
  usd: string | null
  bs: string | null
}

export interface PriceMatrixRow {
  id: string
  name: string
  status: 'DISPONIBLE' | 'NO_DISP'
  prices: Record<PriceColumn, PriceCellView>
  /** Shown when a No disp. row stays inside the Disponible filter. */
  exception: boolean
}

export interface AuditListRow {
  id: string
  sequence: number
  atText: string
  event: string
  user: string
  record: string
  outcome: string
  motivo: string
  severity: string
  detail: string
}

export const REGISTRY_COMMAND: Record<RegistryKind, string> = {
  physicians: 'registry.physicians',
  companies: 'registry.companies',
  suppliers: 'registry.suppliers',
  reagents: 'registry.reagents',
  equipment: 'registry.equipment',
  parasites: 'registry.parasites',
  antibiotics: 'registry.antibiotics',
  organisms: 'registry.organisms',
  bacteriology_samples: 'registry.bacteriology_samples',
  bacteriology_observations: 'registry.bacteriology_observations',
  profiles: 'profiles.create',
  retentions: 'retention.types',
}

export const STAFF_ROLES: readonly StaffRole[] = ['RECEPCION', 'AUXILIAR', 'BIOANALISTA', 'ADMINISTRACION']
