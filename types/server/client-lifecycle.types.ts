import type { LifecycleResult } from '@/types/clients/lifecycle.types'
import type { StaffContext } from '@/types/session/session.types'

export interface Gate {
  context: StaffContext
  allowed: boolean
  rowId: string | null
  result: LifecycleResult | null
}
