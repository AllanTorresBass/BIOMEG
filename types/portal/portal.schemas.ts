import { z } from 'zod'

// Loose on purpose: a malformed cédula must get the same answer as a wrong one, so the command judges it.
export const portalCodeRequestSchema = z.strictObject({
  type: z.string().max(10),
  digits: z.string().max(40),
  birth: z.string().max(40),
})
export const portalCodeCheckSchema = z.strictObject({ code: z.string().max(20) })

export type PortalCodeRequestInput = z.infer<typeof portalCodeRequestSchema>
export type PortalCodeCheckInput = z.infer<typeof portalCodeCheckSchema>
