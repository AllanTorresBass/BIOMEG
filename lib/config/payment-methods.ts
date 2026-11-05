import type { PaymentMethodId } from '@/types/orders/draft.types'
import type { PaymentMethodConfig } from '@/types/lib/payment-methods.types'

/** The fixed order of the payment table. No Forma de pago dropdown and no Cashea row: neither was ever captured. */
export const PAYMENT_METHODS: readonly PaymentMethodConfig[] = [
  { id: 'EFECTIVO_USD', label: 'Efectivo USD', currency: 'USD', electronic: false },
  { id: 'ZELLE', label: 'Zelle', currency: 'USD', electronic: true },
  { id: 'EFECTIVO_BS', label: 'Efectivo Bs', currency: 'BS', electronic: false },
  { id: 'TDEBITO', label: 'T. débito', currency: 'BS', electronic: true },
  { id: 'TCREDITO', label: 'T. crédito', currency: 'BS', electronic: true },
  { id: 'PAGO_MOVIL', label: 'Pago móvil', currency: 'BS', electronic: true },
  { id: 'TRANSFERENCIA', label: 'Transferencia', currency: 'BS', electronic: true },
]

export const PAYMENT_METHOD_IDS: readonly PaymentMethodId[] = PAYMENT_METHODS.map((method) => method.id)

export function methodOf(id: PaymentMethodId): PaymentMethodConfig {
  const found = PAYMENT_METHODS.find((method) => method.id === id)
  if (!found) throw new Error(`Unknown payment method ${id}`)
  return found
}

export function emptyPayments() {
  return PAYMENT_METHODS.map((method) => ({ method: method.id, amount: '', bank: '', reference: '' }))
}
