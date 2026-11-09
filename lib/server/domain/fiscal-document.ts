import 'server-only'

import { strings } from '@/lib/strings'
import { formatBillingCedula, formatDate, formatMoney, formatRate } from '@/lib/utils/format'
import type { FiscalDocumentView, FiscalNote } from '@/types/orders/fiscal.types'
import type { SavedOrder } from '@/types/orders/order.types'

const text = strings.pendingReview.fiscal

/** Fields the laboratory's documents already show. Anything a fiscal layout would add stays out until it is captured. */
export function invoiceDocument(order: SavedOrder): FiscalDocumentView {
  const { totals } = order
  return {
    title: text.kinds.factura,
    number: order.invoiceNumber,
    rows: [
      { label: text.controlNumber, value: order.controlNumber },
      { label: text.order, value: order.number },
      { label: text.date, value: formatDate(order.savedAt) },
      { label: text.patient, value: order.billing.razonSocial || order.clientName },
      { label: text.cedula, value: formatBillingCedula(order.billing.cedulaType, order.billing.cedulaNumber) || strings.empty.dash },
      { label: text.address, value: order.billing.direccion || strings.empty.dash },
      { label: text.rate, value: order.rateBs ? formatRate(order.rateBs) : strings.empty.dash },
    ],
    lines: order.lines.map((line) => ({
      name: line.examName,
      amount: line.priceUsd === null ? strings.orders.sinPrecio : formatMoney(line.priceUsd),
    })),
    totals: [
      { label: text.subTotal, value: formatMoney(totals.subTotal) },
      { label: text.iva, value: formatMoney(totals.iva) },
      { label: text.igtf, value: formatMoney(totals.igtf) },
      { label: text.totalUsd, value: formatMoney(totals.totalUsd) },
      { label: text.totalBs, value: totals.totalBs === null ? strings.empty.dash : formatMoney(totals.totalBs) },
      { label: text.abono, value: formatMoney(totals.abono) },
      { label: text.resta, value: formatMoney(totals.resta) },
    ],
  }
}

/** The visit, with no prices. Further fields are Unknown. */
export function orderDocument(order: SavedOrder, title: string): FiscalDocumentView {
  return {
    title,
    number: order.number,
    rows: [
      { label: text.date, value: formatDate(order.savedAt) },
      { label: text.patient, value: order.clientName },
      ...(order.convenioName ? [{ label: text.convenio, value: order.convenioName }] : []),
      ...(order.titular ? [{ label: text.titular, value: order.titular }] : []),
    ],
    lines: order.lines.map((line) => ({ name: line.examName, amount: null })),
    totals: [],
  }
}

export function noteDocument(note: FiscalNote): FiscalDocumentView {
  return {
    title: note.kind === 'CREDITO' ? text.kinds['nota-credito'] : text.kinds['nota-debito'],
    number: note.number,
    rows: [
      { label: text.againstInvoice, value: note.invoiceNumber },
      { label: text.date, value: formatDate(note.at) },
      { label: text.patient, value: note.clientName },
      { label: text.rate, value: note.rateBs ? formatRate(note.rateBs) : strings.empty.dash },
    ],
    lines: note.lines.map((line) => ({ name: line.description, amount: formatMoney(line.amount) })),
    totals: [{ label: text.totalUsd, value: formatMoney(note.total) }],
  }
}
