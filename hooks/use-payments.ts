'use client'

import { useMemo } from 'react'
import { useCommand } from '@/hooks/use-command'
import { container } from '@/lib/services'
import type { AbonoInput, CashCloseInput, CashReopenInput, MonthCloseInput, ReversePaymentInput } from '@/types/orders/payments.schemas'

export function usePaymentCommands() {
  const run = useCommand()
  return useMemo(() => {
    const service = () => container.paymentService
    return {
      findOrder: (number: string) => run(() => service().findOrder({ number }), { toasts: 'none', refresh: false }),
      addAbono: (input: AbonoInput) => run(() => service().addAbono(input)),
      reversePayment: (input: ReversePaymentInput) => run(() => service().reverse(input)),
      closeCash: (input: CashCloseInput) => run(() => service().closeCash(input)),
      reopenCash: (input: CashReopenInput) => run(() => service().reopenCash(input)),
      closeMonth: (input: MonthCloseInput) => run(() => service().closeMonth(input)),
    }
  }, [run])
}
