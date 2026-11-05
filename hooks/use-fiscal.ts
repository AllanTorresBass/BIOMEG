'use client'

import { useMemo } from 'react'
import { useCommand } from '@/hooks/use-command'
import { container } from '@/lib/services'
import type { AssignControlInput, IssueNoteInput, ReprintInput } from '@/types/orders/fiscal.schemas'

export function useFiscalCommands() {
  const run = useCommand()
  return useMemo(() => {
    const service = () => container.fiscalService
    return {
      assignControl: (input: AssignControlInput) => run(() => service().assignControl(input)),
      findInvoice: (number: string) => run(() => service().findInvoice({ number }), { toasts: 'none', refresh: false }),
      issueNote: (input: IssueNoteInput) => run(() => service().issueNote(input), { refresh: false }),
      reprintDocument: (input: ReprintInput) => run(() => service().reprint(input), { toasts: 'failures', refresh: false }),
    }
  }, [run])
}
