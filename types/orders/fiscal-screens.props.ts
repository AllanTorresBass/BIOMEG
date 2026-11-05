import type { FiscalDocumentView, NoteKind, PendingControlRow, ReprintKind } from '@/types/orders/fiscal.types'

export interface ControlPanelProps {
  rows: readonly PendingControlRow[]
}

export interface NoteFormProps {
  kind: NoteKind
}

export interface ReprintPanelProps {
  kind: ReprintKind
  title: string
}

export interface FiscalPaperProps {
  document: FiscalDocumentView
  copy: boolean
}
