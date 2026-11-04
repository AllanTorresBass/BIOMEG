import 'server-only'

import { demoSeed } from '@/lib/db/memory/seed'
import type { ShellSettings } from '@/types/shell/shell.types'

/** Laboratory-wide values shown in the shell bar. An empty rate means no rate has been set. */
export function getShellSettings(): ShellSettings {
  const { rateBs, rateDate, qrEnabled, saturdayPriceEnabled } = demoSeed.settings
  return { rateBs: rateBs === '' ? null : rateBs, rateDate, qrEnabled, saturdayPriceEnabled }
}
