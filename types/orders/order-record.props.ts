import type { SavedOrder } from '@/types/orders/order.types'

export interface OrderRecordProps {
  order: SavedOrder
  voidBanner: string | null
  fromWorklist: boolean
  canEnterResults: boolean
  canOpenReport: boolean
}
