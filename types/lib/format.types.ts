import type { CEDULA_TYPES } from '@/lib/utils/format'

export type CedulaType = (typeof CEDULA_TYPES)[number]

export interface ParsedCedula {
  type: CedulaType
  digits: string
}

export interface Age {
  value: number
  unit: 'years' | 'months'
}

export interface NormalizedName {
  display: string
  key: string
}
