'use client'

import { useMemo } from 'react'
import { useCommand } from '@/hooks/use-command'
import { container } from '@/lib/services'
import type {
  AddLineInput,
  BillingInput,
  PaymentInput,
  PersonalInput,
  RemoveLineInput,
  SaveInput,
  VisitInput,
  VoidOrderInput,
} from '@/types/orders/draft.types'

export function useOrderCommands() {
  const run = useCommand()
  return useMemo(() => {
    const service = () => container.orderService
    return {
      selectClient: (draftId: string, clientId: string) => run(() => service().selectClient({ draftId, clientId })),
      saveVisit: (input: VisitInput) => run(() => service().saveVisit(input)),
      saveBilling: (input: BillingInput) => run(() => service().saveBilling(input)),
      addLine: (input: AddLineInput) => run(() => service().addLine(input)),
      removeLine: (draftId: string, lineId: string) => run(() => service().removeDraftLine({ draftId, lineId })),
      goToStep: (draftId: string, step: 1 | 2 | 3 | 4) => run(() => service().goToStep({ draftId, step })),
      cancelDraft: (draftId: string) => run(() => service().cancelDraft({ draftId })),
      savePersonal: (input: PersonalInput) => run(() => service().savePersonal(input)),
      savePayment: (input: PaymentInput) => run(() => service().savePayment(input)),
      saveOrder: (input: SaveInput) => run(() => service().save(input)),
      voidOrder: (input: VoidOrderInput) => run(() => service().voidOrder(input)),
      removeOrderLine: (input: RemoveLineInput) => run(() => service().removeLine(input)),
      generateQuote: (draftId: string) => run(() => service().generateQuote({ draftId })),
    }
  }, [run])
}
