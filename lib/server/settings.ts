import 'server-only'

import { demoSeed } from '@/lib/db/memory/seed'
import type { ShellSettings } from '@/types/shell/shell.types'

/** Laboratory-wide values shown in the shell bar. An empty rate means no rate has been set. */
export function getShellSettings(): ShellSettings {
  const { rateBs, rateDate, qrEnabled, saturdayPriceEnabled } = demoSeed.settings
  return { rateBs: rateBs === '' ? null : rateBs, rateDate, qrEnabled, saturdayPriceEnabled }
}

/** R-149 is a deployment setting on purpose, so nobody can switch it on from a screen. */
export function isValueCheckOn(): boolean {
  return process.env.BIOMEG_VALUE_CHECK === 'on'
}

/**
 * The seeded accounts share a password that is in a public repository, and the role switcher needs none.
 * So a built app refuses both unless a deployment opts in. next.config.mjs fails a production build that does.
 */
export function isDemoAccessOn(): boolean {
  return process.env.NODE_ENV !== 'production' || process.env.BIOMEG_DEMO === 'on'
}

/**
 * Staff passwords and sessions are read from Postgres.
 * Unit tests keep the memory store, because Vitest sets VITEST.
 */
export function databaseAuth(): boolean {
  if (process.env.VITEST === 'true' || process.env.BIOMEG_AUTH === 'memory') return false
  return Boolean(process.env.DATABASE_URL)
}
