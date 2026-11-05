import { z } from 'zod'
import { strings } from '@/lib/strings'

const id = z.string().min(1).max(100)
const shortText = z.string().max(200)
const required = strings.pendingReview.api.required

export const assignControlSchema = z.strictObject({ orderId: id, number: shortText.min(1, required) })
export const noteLineSchema = z.strictObject({ description: shortText.min(1, required), amount: shortText.min(1, required) })
export const noteFormSchema = z.strictObject({ lines: z.array(noteLineSchema).min(1).max(50) })
export const issueNoteSchema = noteFormSchema.extend({ orderId: id, kind: z.enum(['CREDITO', 'DEBITO']) })
export const reprintSchema = z.strictObject({
  kind: z.enum(['factura', 'orden-entrega', 'orden-empresa', 'nota-credito', 'nota-debito']),
  number: shortText,
})
export const findInvoiceSchema = z.strictObject({ number: shortText })

export type AssignControlInput = z.infer<typeof assignControlSchema>
export type NoteFormValues = z.infer<typeof noteFormSchema>
export type IssueNoteInput = z.infer<typeof issueNoteSchema>
export type ReprintInput = z.infer<typeof reprintSchema>
export type FindInvoiceInput = z.infer<typeof findInvoiceSchema>
