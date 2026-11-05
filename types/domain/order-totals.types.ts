import type { DraftLine, DraftPayment } from '@/types/orders/draft.types'

export interface TotalsInput {
  lines: readonly Pick<DraftLine, 'priceUsd'>[]
  rate: string | null
  ivaRate: string | null
  igtfRate: string | null
  discountPct: string
  payments: readonly Pick<DraftPayment, 'method' | 'amount'>[]
}

export interface OrderTotals {
  subTotal: string
  exento: string
  base: string
  iva: string
  igtf: string
  discount: string
  discountPct: string
  totalUsd: string
  totalBs: string | null
  abono: string
  resta: string
  ivaConfigured: boolean
  igtfConfigured: boolean
}
