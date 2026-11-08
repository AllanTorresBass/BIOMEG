import type { StaffRole } from '@/types/auth/auth.types'

const DB_ROLE: Record<StaffRole, string> = {
  RECEPCION: 'recepcion',
  AUXILIAR: 'auxiliar',
  BIOANALISTA: 'bioanalista',
  ADMINISTRACION: 'administracion',
}

const APP_ROLE: Record<string, StaffRole> = {
  recepcion: 'RECEPCION',
  auxiliar: 'AUXILIAR',
  bioanalista: 'BIOANALISTA',
  administracion: 'ADMINISTRACION',
}

export function toDbRole(role: StaffRole): string {
  return DB_ROLE[role]
}

export function toAppRoles(roles: readonly string[]): StaffRole[] {
  const out: StaffRole[] = []
  for (const role of roles) {
    const mapped = APP_ROLE[role]
    if (mapped && !out.includes(mapped)) out.push(mapped)
  }
  return out
}
