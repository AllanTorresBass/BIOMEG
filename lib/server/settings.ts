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
