import type { DecisionReason } from '@/types/auth/auth.types'

export interface RefusalDetail {
  command: 'verify.read' | 'verify.file.read'
  token: string
  reason: DecisionReason
  state: string | null
  rowId?: string | null
}
