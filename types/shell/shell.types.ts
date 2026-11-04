import type { PublicAccount } from '@/types/session/session.types'

export interface ShellSettings {
  rateBs: string | null
  rateDate: string
  qrEnabled: boolean
  saturdayPriceEnabled: boolean
}

export interface DemoAccountOption {
  id: string
  label: string
}

export interface ShellBarProps {
  account: PublicAccount
  roleLabel: string
  settings: ShellSettings
}
