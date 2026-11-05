import type { LifecycleResult } from '@/types/clients/lifecycle.types'

export interface Extra {
  confirmed?: boolean
  motivo?: string
}

export type Call = (extra: Extra) => Promise<LifecycleResult>

export interface Copy {
  title: string
  body: string
  confirmLabel: string
  motivoRequired: boolean
}

export interface Pending {
  call: Call
  copy: Copy
  extra: Extra
}
