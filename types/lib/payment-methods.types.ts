import type { PaymentMethodId } from '@/types/orders/draft.types'

export interface PaymentMethodConfig {
  id: PaymentMethodId
  label: string
  /** The amount is typed in US dollars. Every other method is typed in bolívares. */
  currency: 'USD' | 'BS'
  /** Banco and Referencia apply. */
  electronic: boolean
}
