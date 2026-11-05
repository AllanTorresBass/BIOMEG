'use client'

import { useEffect, useRef, useState } from 'react'
import { strings } from '@/lib/strings'
import type { ConfirmDialogProps } from '@/types/shared/dialog.types'

export function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel,
  cancelLabel,
  motivoRequired = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [motivo, setMotivo] = useState('')

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  const missingMotivo = motivoRequired && motivo.trim() === ''

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="confirm-title"
      onCancel={onCancel}
      className="m-auto w-full max-w-sm rounded-[var(--radius-card)] border border-border bg-card p-5 text-foreground backdrop:bg-black/60"
    >
      <div className="flex flex-col gap-4">
        <h2 id="confirm-title" className="text-xl font-semibold">
          {title}
        </h2>
        <p className="text-muted-foreground">{body}</p>
        {motivoRequired ? (
          <label className="flex flex-col gap-1">
            <span className="font-semibold">{strings.auth.motivo}</span>
            <textarea
              value={motivo}
              onChange={(event) => setMotivo(event.target.value)}
              required
              rows={3}
              className="rounded-[var(--radius-control)] border border-border-strong bg-background p-2"
            />
            {missingMotivo ? <span className="text-flag-blocked">{strings.auth.motivoRequired}</span> : null}
          </label>
        ) : null}
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="h-10 rounded-[var(--radius-control)] border border-border-strong px-4 font-semibold"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            disabled={missingMotivo}
            onClick={() => onConfirm(motivoRequired ? motivo.trim() : null)}
            className="h-10 rounded-[var(--radius-control)] bg-primary px-4 font-semibold text-primary-foreground disabled:opacity-60"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </dialog>
  )
}
