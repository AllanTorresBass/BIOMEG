import { z } from 'zod'
import { strings } from '@/lib/strings'

const shortText = z.string().max(200)
const required = shortText.min(1, strings.pendingReview.api.required)

export const signInSchema = z.strictObject({ username: required, password: required })
export const changePasswordSchema = z.strictObject({ current: required, next: required })
export const stepUpSchema = z.strictObject({ password: shortText })
export const demoSwitchSchema = z.strictObject({ userId: shortText })
export const noInputSchema = z.strictObject({})

export type SignInInput = z.infer<typeof signInSchema>
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>
export type StepUpInput = z.infer<typeof stepUpSchema>
export type DemoSwitchInput = z.infer<typeof demoSwitchSchema>
