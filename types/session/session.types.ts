import type { StaffRole } from '@/types/auth/auth.types'

export interface PublicAccount {
  id: string
  username: string
  displayName: string
  roles: StaffRole[]
  mustChangePassword: boolean
}

export interface StaffSession {
  id: string
  userId: string
  workstation: string
  startedAt: number
  lastSeenAt: number
  locked: boolean
  ended: boolean
  /** Server time of the last verified password re-entry, or null. */
  stepUpAt: number | null
}

export interface StaffContext {
  session: StaffSession
  account: PublicAccount
  locked: boolean
}

export type SignInResult = 'OK' | 'FAILED' | 'PAUSED'

export type PasswordChangeResult = 'OK' | 'WRONG_CURRENT' | 'TOO_SHORT' | 'SAME'

export interface ChangePasswordFormProps {
  /** The signed-in person still has the temporary clave from installation or a reset. */
  replaceFirst: boolean
}

export interface FormState {
  error: string | null
  done?: boolean
  redirectTo?: string
}
