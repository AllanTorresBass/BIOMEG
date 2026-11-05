import type { AbonoOrderView, CashSummary, CloseRow, DrawerOption, PaymentResult, PaymentRow, SelfReversalRow } from '@/types/orders/payment.types'

export interface GesturePresented {
  confirmed?: boolean
  motivo?: string
}

export type GestureCommand = (presented: GesturePresented) => Promise<PaymentResult>

export interface GestureRequest {
  title: string
  body: string
  confirmLabel: string
  motivoRequired: boolean
  command: GestureCommand
}

export interface AbonoPanelProps {
  order: AbonoOrderView | null
}

export interface PaymentRegistryProps {
  rows: readonly PaymentRow[]
  selfReversals: readonly SelfReversalRow[]
  seesAll: boolean
}

export interface CashClosePanelProps {
  userId: string
  isOwn: boolean
  drawers: readonly DrawerOption[]
  summary: CashSummary
  closes: readonly CloseRow[]
}

export interface MonthClosePanelProps {
  currentMonth: string
  closes: readonly { month: string; byName: string; atText: string }[]
}

export interface GestureDialogsProps {
  gesture: {
    request: GestureRequest | null
    stepUpOpen: boolean
    answer: (motivo: string | null) => void
    stepUpVerified: () => void
    cancel: () => void
  }
}
