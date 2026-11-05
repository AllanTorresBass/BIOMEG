import 'server-only'

import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z.string().optional(),
  BIOMEG_DEMO: z.enum(['on', 'off']).optional(),
  BIOMEG_VALUE_CHECK: z.enum(['on', 'off']).optional(),
  PORTAL_HASH_SECRET: z.string().min(32).optional(),
})

export type Env = z.infer<typeof envSchema>

/** Read on each call, so a wrong value fails loudly at the first use and tests can change it. */
export function getEnv(): Env {
  return envSchema.parse({
    NODE_ENV: process.env.NODE_ENV,
    BIOMEG_DEMO: process.env.BIOMEG_DEMO || undefined,
    BIOMEG_VALUE_CHECK: process.env.BIOMEG_VALUE_CHECK || undefined,
    PORTAL_HASH_SECRET: process.env.PORTAL_HASH_SECRET || undefined,
  })
}
