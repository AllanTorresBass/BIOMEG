import { z } from 'zod'
import { strings } from '@/lib/strings'
import type { PaymentMethodId } from '@/types/orders/draft.types'

const id = z.string().min(1).max(100)
const shortText = z.string().max(200)
const motivo = z.string().max(2000).optional()
const required = strings.pendingReview.api.required

const METHODS = ['EFECTIVO_USD', 'ZELLE', 'EFECTIVO_BS', 'TDEBITO', 'TCREDITO', 'PAGO_MOVIL', 'TRANSFERENCIA'] as const satisfies readonly PaymentMethodId[]

export const abonoFormSchema = z.strictObject({
  method: z.enum(METHODS),
  amount: shortText.min(1, required),
  bank: shortText,
  reference: shortText,
})
export const abonoSchema = abonoFormSchema.extend({ orderId: id })
export const findOrderSchema = z.strictObject({ number: shortText })
export const reversePaymentSchema = z.strictObject({ paymentId: id, confirmed: z.boolean().optional(), motivo })
export const cashCloseSchema = z.strictObject({ userId: id, motivo })
export const cashReopenSchema = z.strictObject({ closeId: id, motivo })
export const monthCloseSchema = z.strictObject({ month: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/) })

export type AbonoFormValues = z.infer<typeof abonoFormSchema>
export type AbonoInput = z.infer<typeof abonoSchema>
export type FindOrderInput = z.infer<typeof findOrderSchema>
export type ReversePaymentInput = z.infer<typeof reversePaymentSchema>
export type CashCloseInput = z.infer<typeof cashCloseSchema>
export type CashReopenInput = z.infer<typeof cashReopenSchema>
export type MonthCloseInput = z.infer<typeof monthCloseSchema>
