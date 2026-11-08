import type { DecisionReason } from '@/types/auth/auth.types'

export type ApiErrorCode = Exclude<DecisionReason, 'OK'> | 'VALIDATION' | 'CONFLICT' | 'NOT_FOUND' | 'RATE_LIMIT' | 'ORIGIN' | 'INTERNAL'

/** The one error shape. `message` is Spanish and safe to display. */
export interface ApiErrorBody {
  error: {
    code: ApiErrorCode
    message: string
    rowId?: string | null
    details?: Readonly<Record<string, unknown>>
  }
}

/** A command that answered "no" keeps its full result here, so the screen can ask for what is missing. */
export const REFUSAL_RESULT_KEY = 'result'

export function isApiErrorBody(value: unknown): value is ApiErrorBody {
  if (typeof value !== 'object' || value === null || !('error' in value)) return false
  const { error } = value as { error: unknown }
  return typeof error === 'object' && error !== null && 'code' in error && 'message' in error
}

export interface CommandFeedback {
  /** 'failures' keeps a result cell quiet on success. 'successes' is for a form that shows its errors inline. 'none' is for the portal, whose errors stay inline. */
  toasts?: 'all' | 'failures' | 'successes' | 'none'
  /** False for a read, or a save that shows its own state. */
  refresh?: boolean
  /** A full page load. Sign-in needs it so the new cookie is sent on the next screen. */
  document?: boolean
}
