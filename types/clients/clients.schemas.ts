import { z } from 'zod'
import type { LifecycleInput } from '@/types/clients/lifecycle.types'
import type { ClientFormInput } from '@/types/domain/client.types'

const id = z.string().min(1).max(100)
const shortText = z.string().max(200)
const longText = z.string().max(2000)

const lifecycleFields = { clientId: id, confirmed: z.boolean().optional(), motivo: longText.optional() }

export const lifecycleSchema: z.ZodType<LifecycleInput> = z.strictObject(lifecycleFields)
export const correctCedulaSchema = z.strictObject({ ...lifecycleFields, cedulaType: shortText, cedulaNumber: shortText })
export const requestMergeSchema = z.strictObject({ ...lifecycleFields, note: longText })
export const mergeSchema = z.strictObject({ ...lifecycleFields, sourceId: id, retypedName: shortText })
export const undoMergeSchema = z.strictObject({ mergeId: id, clientId: id, motivo: longText })

export const clientSearchSchema = z.strictObject({ text: shortText, includeInactive: z.boolean() })

const clientFormFields = {
  id: id.nullable(),
  version: z.number().int().positive().nullable(),
  fullName: shortText,
  cedulaType: shortText,
  cedulaNumber: shortText,
  birthDate: shortText,
  sex: shortText,
  phone: shortText,
  email: shortText,
  consentWhatsapp: z.boolean(),
  consentEmail: z.boolean(),
  confirmSimilar: z.boolean(),
}

export const clientCardSchema = z.strictObject({
  fullName: shortText,
  cedulaType: shortText,
  cedulaNumber: shortText,
  birthDate: shortText,
  sex: shortText,
  phone: shortText,
  email: shortText,
  consentWhatsapp: z.boolean(),
  consentEmail: z.boolean(),
})

export const saveClientSchema: z.ZodType<ClientFormInput & { confirmGesture: boolean }> = z.strictObject({
  ...clientFormFields,
  confirmGesture: z.boolean(),
})

export type CorrectCedulaInput = z.infer<typeof correctCedulaSchema>
export type RequestMergeInput = z.infer<typeof requestMergeSchema>
export type MergeInput = z.infer<typeof mergeSchema>
export type UndoMergeInput = z.infer<typeof undoMergeSchema>
export type ClientSearchInput = z.infer<typeof clientSearchSchema>
export type SaveClientInput = z.infer<typeof saveClientSchema>
export type ClientCardValues = z.infer<typeof clientCardSchema>
