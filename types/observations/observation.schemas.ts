import { z } from 'zod'

const dateDay = z.string().regex(/^\d{4}-\d{2}-\d{2}$/)

export const createObservationSchema = z.strictObject({
  date: dateDay,
  text: z.string(),
})

export const retractObservationSchema = z.strictObject({
  id: z.string().min(1),
  confirmed: z.boolean().optional(),
})

export const listObservationsSchema = z.strictObject({
  date: dateDay,
})

export type CreateObservationInput = z.infer<typeof createObservationSchema>
export type RetractObservationInput = z.infer<typeof retractObservationSchema>
export type ListObservationsInput = z.infer<typeof listObservationsSchema>
