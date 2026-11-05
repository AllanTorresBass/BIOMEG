import 'server-only'

import { getOrder } from '@/lib/db/memory/order-store'
import { demoSeed } from '@/lib/db/memory/seed'
import { cashTotalsOf, totalsByWorkstation } from '@/lib/domain/cash'
import { centsToDecimal, parseCents } from '@/lib/domain/pricing'
import type { CashInvoice, CashSummary, PaymentEntry } from '@/types/orders/payment.types'

/** Total USD, Total Bs, the rate, and Resta still open, with open invoices apart from paid ones. Nothing else is known. */
export function summarizeEntries(entries: readonly PaymentEntry[]): CashSummary {
  const invoices: CashInvoice[] = []
  for (const orderId of new Set(entries.map((entry) => entry.orderId))) {
    const order = getOrder(orderId)
    if (!order || order.state === 'ANULADA') continue
    invoices.push({
      orderId,
      orderNumber: order.number,
      invoiceNumber: order.invoiceNumber,
      clientName: order.clientName,
      totalUsd: order.totals.totalUsd,
      resta: order.totals.resta,
    })
  }
  const openInvoices = invoices.filter((invoice) => parseCents(invoice.resta) > 0)
  return {
    ...cashTotalsOf(entries),
    rate: demoSeed.settings.rateBs,
    restaOpen: centsToDecimal(openInvoices.reduce((sum, invoice) => sum + parseCents(invoice.resta), 0)),
    openInvoices,
    paidInvoices: invoices.filter((invoice) => parseCents(invoice.resta) === 0),
    byWorkstation: totalsByWorkstation(entries),
    entryCount: entries.length,
  }
}
