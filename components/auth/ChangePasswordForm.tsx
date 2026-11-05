'use client'

import { useActionState } from 'react'
import { useSessionCommands } from '@/hooks/use-session'
import { strings } from '@/lib/strings'
import type { FormState } from '@/types/session/session.types'

const INITIAL: FormState = { error: null }

export function ChangePasswordForm() {
  const { changePasswordForm } = useSessionCommands()
  const [state, action, pending] = useActionState(changePasswordForm, INITIAL)
  return (
    <form action={action} className="flex max-w-sm flex-col gap-4">
      <label className="flex flex-col gap-1">
        <span className="font-semibold">{strings.auth.currentPassword}</span>
        <input
          name="current"
          type="password"
          autoComplete="current-password"
          required
          className="h-10 rounded-[var(--radius-control)] border border-border-strong bg-background px-3"
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className="font-semibold">{strings.auth.newPassword}</span>
        <input
          name="next"
          type="password"
          autoComplete="new-password"
          required
          className="h-10 rounded-[var(--radius-control)] border border-border-strong bg-background px-3"
        />
      </label>
      {state.error ? (
        <p role="alert" className="text-flag-blocked">
          {state.error}
        </p>
      ) : null}
      {state.done ? <p role="status">{strings.auth.passwordChanged}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="h-10 self-start rounded-[var(--radius-control)] bg-primary px-4 font-semibold text-primary-foreground disabled:opacity-60"
      >
        {strings.auth.changePassword}
      </button>
    </form>
  )
}
