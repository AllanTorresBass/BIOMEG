import 'server-only'

import { envSchema, type Env } from '@/types/config/env.schemas'

/** Read on each call, so a wrong value fails loudly at the first use and tests can change it. */
export function getEnv(): Env {
  return envSchema.parse({
    NODE_ENV: process.env.NODE_ENV,
    BIOMEG_DEMO: process.env.BIOMEG_DEMO || undefined,
    BIOMEG_VALUE_CHECK: process.env.BIOMEG_VALUE_CHECK || undefined,
    PORTAL_HASH_SECRET: process.env.PORTAL_HASH_SECRET || undefined,
  })
}
