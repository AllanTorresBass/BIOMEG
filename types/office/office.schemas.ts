import { z } from 'zod'

const priceColumn = z.enum(['PARTICULAR', 'ALIADOS', 'HOSPITALIZADO', 'EMERGENCIA', 'ESTATAL'])
const staffRole = z.enum(['RECEPCION', 'AUXILIAR', 'BIOANALISTA', 'ADMINISTRACION'])

const gesture = {
  confirmed: z.boolean().optional(),
  motivo: z.string().optional(),
}

export const setRateSchema = z.strictObject({
  rate: z.string(),
  ...gesture,
})

export const switchSchema = z.strictObject({
  enabled: z.boolean(),
  ...gesture,
})

export const editPriceSchema = z.strictObject({
  examId: z.string(),
  currency: z.enum(['USD', 'BS']),
  column: priceColumn,
  amount: z.string(),
  ...gesture,
})

export const increaseSchema = z.strictObject({
  percent: z.string(),
  currency: z.enum(['USD', 'BS']),
  columns: z.array(priceColumn).min(1),
  ...gesture,
})

export const registrySaveSchema = z.strictObject({
  kind: z.enum([
    'physicians',
    'companies',
    'suppliers',
    'reagents',
    'equipment',
    'parasites',
    'antibiotics',
    'organisms',
    'bacteriology_samples',
    'bacteriology_observations',
    'profiles',
    'retentions',
  ]),
  id: z.string().nullable(),
  name: z.string(),
  active: z.boolean(),
  requiresTitular: z.boolean(),
})

export const inventorySchema = z.strictObject({
  reagentId: z.string(),
  quantity: z.string(),
  ...gesture,
})

export const createUserSchema = z.strictObject({
  displayName: z.string(),
  roles: z.array(staffRole).min(1),
  ...gesture,
})

export const userIdSchema = z.strictObject({
  userId: z.string(),
  ...gesture,
})

export const replaceRolesSchema = z.strictObject({
  userId: z.string(),
  roles: z.array(staffRole).min(1),
  ...gesture,
})

export const coverSchema = z.strictObject({
  userId: z.string(),
  roles: z.array(staffRole).min(1),
  until: z.string(),
  ...gesture,
})

export const grantBioanalistaSchema = z.strictObject({
  userId: z.string(),
  license: z.string(),
  ...gesture,
})

export const mailSchema = z.strictObject({
  account: z.string(),
  secret: z.string(),
  ...gesture,
})

export type SetRateInput = z.infer<typeof setRateSchema>
export type SwitchInput = z.infer<typeof switchSchema>
export type EditPriceInput = z.infer<typeof editPriceSchema>
export type IncreaseInput = z.infer<typeof increaseSchema>
export type RegistrySaveInput = z.infer<typeof registrySaveSchema>
export type InventoryInput = z.infer<typeof inventorySchema>
export type CreateUserInput = z.infer<typeof createUserSchema>
export type UserIdInput = z.infer<typeof userIdSchema>
export type ReplaceRolesInput = z.infer<typeof replaceRolesSchema>
export type CoverInput = z.infer<typeof coverSchema>
export type GrantBioanalistaInput = z.infer<typeof grantBioanalistaSchema>
export type MailInput = z.infer<typeof mailSchema>
