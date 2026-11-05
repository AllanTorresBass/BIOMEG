import type { Grant, Role } from '@/types/auth/auth.types'

export type Grants = Partial<Record<Role, Grant>>

export interface RowOptions {
  kind?: 'read' | 'action'
  ownDependent?: boolean
}
