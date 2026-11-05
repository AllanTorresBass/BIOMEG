import { z } from 'zod'
import type {
  AddLineInput,
  BillingInput,
  PaymentInput,
  PersonalInput,
  RemoveLineInput,
  SaveInput,
  VisitInput,
  VoidOrderInput,
} from '@/types/orders/draft.types'
import type { SaveResultInput } from '@/types/orders/result.types'

const id = z.string().min(1).max(100)
const shortText = z.string().max(200)
const longText = z.string().max(2000)
const confirmed = z.boolean().optional()
const motivo = longText.optional()

export const draftIdSchema = z.strictObject({ draftId: id })
export const selectClientSchema = z.strictObject({ draftId: id, clientId: id })
export const removeDraftLineSchema = z.strictObject({ draftId: id, lineId: id })
export const goToStepSchema = z.strictObject({
  draftId: id,
  step: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
})
export const visitSchema: z.ZodType<VisitInput> = z.strictObject({ draftId: id, motivo: longText, sampleDate: shortText })
export const billingSchema: z.ZodType<BillingInput> = z.strictObject({
  draftId: id,
  costType: z.enum(['RUTINA', 'SEGURO_EMPRESA', 'EMERGENCIA', 'HOSPITALIZADO']).nullable(),
  cedula: shortText,
  razonSocial: shortText,
  direccion: shortText,
})
export const addLineSchema: z.ZodType<AddLineInput> = z.strictObject({
  draftId: id,
  examId: id,
  column: z.enum(['PARTICULAR', 'ALIADOS', 'HOSPITALIZADO', 'EMERGENCIA', 'ESTATAL']).nullable(),
  confirmNoDisp: confirmed,
  confirmOverride: confirmed,
  overrideMotivo: motivo,
  repeatMotivo: motivo,
})
export const personalSchema: z.ZodType<PersonalInput> = z.strictObject({ draftId: id, physicianId: id.nullable() })
export const paymentSchema: z.ZodType<PaymentInput> = z.strictObject({
  draftId: id,
  convenioId: id.nullable(),
  titular: shortText,
  razonSocial: shortText,
  payments: z
    .array(
      z.strictObject({
        method: z.enum(['EFECTIVO_USD', 'ZELLE', 'EFECTIVO_BS', 'TDEBITO', 'TCREDITO', 'PAGO_MOVIL', 'TRANSFERENCIA']),
        amount: shortText,
        bank: shortText,
        reference: shortText,
      }),
    )
    .max(20),
  discountPct: shortText,
  discountMotivo: longText,
})
export const saveOrderSchema: z.ZodType<SaveInput> = z.strictObject({
  draftId: id,
  key: id,
  rateSeen: shortText,
  confirmRate: confirmed,
})
export const voidOrderSchema: z.ZodType<VoidOrderInput> = z.strictObject({ orderId: id, confirmed, motivo })
export const removeOrderLineSchema: z.ZodType<RemoveLineInput> = z.strictObject({ orderId: id, lineId: id, confirmed })

export const saveResultSchema: z.ZodType<SaveResultInput> = z.strictObject({
  orderId: id,
  lineId: id,
  value: longText,
  expectedVersion: z.number().int().nonnegative(),
  manualMark: z.enum(['ALTO', 'BAJO', '']).optional(),
  motivo,
})
export const resolveIncomingSchema = z.strictObject({ orderId: id, lineId: id, choice: z.enum(['use', 'keep']), motivo })
export const simulateAnalyzerSchema = z.strictObject({ orderId: id, lineId: id, value: longText })
export const sectionNoteSchema = z.strictObject({ orderId: id, section: shortText, text: longText })
export const orderIdSchema = z.strictObject({ orderId: id })
export const releaseResultsSchema = z.strictObject({ orderId: id, sections: z.array(shortText).max(100) })
export const rowHistorySchema = z.strictObject({ orderId: id, lineId: id })
export const openCorrectionSchema = z.strictObject({ orderId: id, section: shortText, motivo })
export const correctionSchema = z.strictObject({ orderId: id, section: shortText })

export const reportPdfSchema = z.strictObject({
  orderId: id,
  mode: z.enum(['PACIENTE', 'PRUEBA']),
  lineId: id.nullable().optional(),
})
export const deliverySchema = z.strictObject({ orderId: id, channel: shortText, confirmed })

export const worklistQuerySchema = z.strictObject({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  reviewOnly: z.enum(['0', '1']),
})

export type DraftIdInput = z.infer<typeof draftIdSchema>
export type SelectClientInput = z.infer<typeof selectClientSchema>
export type RemoveDraftLineInput = z.infer<typeof removeDraftLineSchema>
export type GoToStepInput = z.infer<typeof goToStepSchema>
export type ResolveIncomingInput = z.infer<typeof resolveIncomingSchema>
export type SimulateAnalyzerInput = z.infer<typeof simulateAnalyzerSchema>
export type SectionNoteInput = z.infer<typeof sectionNoteSchema>
export type OrderIdInput = z.infer<typeof orderIdSchema>
export type ReleaseResultsInput = z.infer<typeof releaseResultsSchema>
export type RowHistoryInput = z.infer<typeof rowHistorySchema>
export type OpenCorrectionInput = z.infer<typeof openCorrectionSchema>
export type CorrectionInput = z.infer<typeof correctionSchema>
export type ReportPdfInput = z.infer<typeof reportPdfSchema>
export type DeliveryInput = z.infer<typeof deliverySchema>
