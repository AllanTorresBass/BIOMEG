export type NoteKind = 'CREDITO' | 'DEBITO'

export type ReprintKind = 'factura' | 'orden-entrega' | 'orden-empresa' | 'nota-credito' | 'nota-debito'

export interface NoteLine {
  description: string
  /** USD, as a decimal. An adjustment, never a change to the factura. */
  amount: string
}

/** A new document against exactly one factura, with its own number. */
export interface FiscalNote {
  id: string
  kind: NoteKind
  number: string
  orderId: string
  invoiceNumber: string
  clientName: string
  lines: NoteLine[]
  total: string
  rateBs: string
  at: string
  byName: string
}

export interface FiscalRow {
  label: string
  value: string
}

export interface FiscalDocumentLine {
  name: string
  amount: string | null
}

/** Only what the documents establish. No fiscal layout was captured, so none is written here. */
export interface FiscalDocumentView {
  title: string
  number: string
  rows: FiscalRow[]
  lines: FiscalDocumentLine[]
  totals: FiscalRow[]
}

export type ReprintResult =
  | { ok: true; message: string; need: null; document: FiscalDocumentView }
  | { ok: false; message: string; need: null }

export interface PendingControlRow {
  orderId: string
  number: string
  invoiceNumber: string
  clientName: string
  totalUsd: string
  hasSinPrecio: boolean
}

export interface InvoiceLookup {
  orderId: string
  invoiceNumber: string
  clientName: string
  totalUsd: string
}
