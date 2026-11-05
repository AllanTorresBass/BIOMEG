'use client'

import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useSessionCommands } from '@/hooks/use-session'
import { strings } from '@/lib/strings'
import type { StepUpDialogProps } from '@/types/shared/dialog.types'

/** Asks for the password again and checks it on the server. The page never decides on its own. */
export function StepUpDialog({
  open,
  title,
  description,
  submitLabel,
  cancellable,
  onVerified,
  onCancel,
}: StepUpDialogProps) {
  const { verifyStepUp } = useSessionCommands()
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const password = String(new FormData(form).get('password') ?? '')
    setPending(true)
    setError(null)
    const verified = await verifyStepUp(password).then((answer) => answer.ok, () => false)
    if (verified) {
      form.reset()
      onVerified()
    } else {
      setError(strings.auth.verifyFailed)
    }
    setPending(false)
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="step-up-title"
      onCancel={(event) => {
        if (!cancellable) event.preventDefault()
        else onCancel?.()
      }}
      className="m-auto w-full max-w-sm rounded-[var(--radius-card)] border border-border bg-card p-5 text-foreground backdrop:bg-black/60"
    >
      <form onSubmit={submit} className="flex flex-col gap-4">
        <h2 id="step-up-title" className="text-xl font-semibold">
          {title}
        </h2>
        {description ? <p className="text-muted-foreground">{description}</p> : null}
        <label className="flex flex-col gap-1">
          <span className="font-semibold">{strings.auth.password}</span>
          <input
            name="password"
            type="password"
            autoComplete="current-password"
            required
            autoFocus
            aria-describedby={error ? 'step-up-error' : undefined}
            className="h-10 rounded-[var(--radius-control)] border border-border-strong bg-background px-3"
          />
        </label>
        {error ? (
          <p id="step-up-error" role="alert" className="text-flag-blocked">
            {error}
          </p>
        ) : null}
        <div className="flex justify-end gap-2">
          {cancellable ? (
            <button
              type="button"
              onClick={onCancel}
              className="h-10 rounded-[var(--radius-control)] border border-border-strong px-4 font-semibold"
            >
              {strings.auth.cancel}
            </button>
          ) : null}
          <button
            type="submit"
            disabled={pending}
            className="h-10 rounded-[var(--radius-control)] bg-primary px-4 font-semibold text-primary-foreground disabled:opacity-60"
          >
            {submitLabel}
          </button>
        </div>
      </form>
    </dialog>
  )
}
