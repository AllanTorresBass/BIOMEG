import { z } from 'zod'

const shortText = z.string().max(200)

export const signInSchema = z.strictObject({ username: shortText, password: shortText })
export const changePasswordSchema = z.strictObject({ current: shortText, next: shortText })
export const stepUpSchema = z.strictObject({ password: shortText })
export const demoSwitchSchema = z.strictObject({ userId: shortText })
export const noInputSchema = z.strictObject({})

export type SignInInput = z.infer<typeof signInSchema>
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>
export type StepUpInput = z.infer<typeof stepUpSchema>
export type DemoSwitchInput = z.infer<typeof demoSwitchSchema>
