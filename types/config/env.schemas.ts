import { z } from 'zod'

export const envSchema = z.object({
  NODE_ENV: z.string().optional(),
  BIOMEG_DEMO: z.enum(['on', 'off']).optional(),
  BIOMEG_VALUE_CHECK: z.enum(['on', 'off']).optional(),
  PORTAL_HASH_SECRET: z.string().min(32).optional(),
})

export type Env = z.infer<typeof envSchema>
