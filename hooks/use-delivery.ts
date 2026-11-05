'use client'

import { useMemo } from 'react'
import { useCommand } from '@/hooks/use-command'
import { container } from '@/lib/services'
import type { DeliveryInput, OrderIdInput, ReportPdfInput } from '@/types/orders/orders.schemas'

export function useDeliveryCommands() {
  const run = useCommand()
  return useMemo(() => {
    const service = () => container.deliveryService
    return {
      generateReportPdf: (input: ReportPdfInput) => run(() => service().generatePdf(input)),
      approveIncompleteSend: (input: OrderIdInput) => run(() => service().approveIncomplete(input)),
      sendDelivery: (input: DeliveryInput) => run(() => service().send(input)),
      resendDelivery: (input: DeliveryInput) => run(() => service().resend(input)),
    }
  }, [run])
}
