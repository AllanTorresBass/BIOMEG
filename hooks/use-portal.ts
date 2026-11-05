'use client'

import { useMemo } from 'react'
import { useCommand } from '@/hooks/use-command'
import { container } from '@/lib/services'
import type { PortalCodeRequestInput } from '@/types/portal/portal.schemas'

/** Portal errors stay inline, and sign-in never toasts (rule 9). */
export function usePortalCommands() {
  const run = useCommand()
  return useMemo(() => {
    const service = () => container.portalService
    return {
      requestPortalCode: (input: PortalCodeRequestInput) => run(() => service().requestCode(input), { toasts: 'none', refresh: false }),
      verifyPortalCode: (code: string) => run(() => service().verifyCode({ code }), { toasts: 'none', refresh: false }),
      leavePortal: () => run(() => service().leave(), { toasts: 'none' }),
    }
  }, [run])
}
