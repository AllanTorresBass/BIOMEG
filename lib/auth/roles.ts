import 'server-only'

import type { Role, StaffRole } from '@/types/auth/auth.types'

export const STAFF_ROLES: readonly StaffRole[] = [
  'RECEPCION',
  'AUXILIAR',
  'BIOANALISTA',
  'ADMINISTRACION',
]

export const ALL_ROLES: readonly Role[] = [
  ...STAFF_ROLES,
  'CLIENTE',
  'PUBLICO',
  'SISTEMA_ANALIZADOR',
  'SISTEMA_ENVIADOR',
  'SISTEMA_PROGRAMADOR',
]

export const ROLE_LABELS: Readonly<Record<StaffRole, string>> = {
  RECEPCION: 'Recepción',
  AUXILIAR: 'Auxiliar',
  BIOANALISTA: 'Bioanalista',
  ADMINISTRACION: 'Administración',
}

export function isStaffRole(role: Role): role is StaffRole {
  return (STAFF_ROLES as readonly Role[]).includes(role)
}
