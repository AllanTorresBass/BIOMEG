export interface StepUpDialogProps {
  open: boolean
  title: string
  description?: string
  submitLabel: string
  /** The idle lock cannot be dismissed. A step-up for one gesture can. */
  cancellable: boolean
  onVerified: () => void
  onCancel?: () => void
}

export interface ConfirmDialogProps {
  open: boolean
  title: string
  body: string
  confirmLabel: string
  cancelLabel: string
  /** When true the confirm button stays off until a motivo is typed. */
  motivoRequired?: boolean
  onConfirm: (motivo: string | null) => void
  onCancel: () => void
}
