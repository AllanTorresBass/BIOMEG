'use client'

import { useActionState } from 'react'
import { signIn } from '@/app/actions/session'
import { strings } from '@/lib/strings'
import type { FormState } from '@/types/session/session.types'

const INITIAL: FormState = { error: null }

export function SignInForm() {
  const [state, action, pending] = useActionState(signIn, INITIAL)
  return (
    <form action={action} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1">
        <span className="font-semibold">{strings.auth.username}</span>
        <input
          name="username"
          autoComplete="username"
          required
          autoCapitalize="none"
          spellCheck={false}
          className="h-10 rounded-[var(--radius-control)] border border-border-strong bg-background px-3"
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className="font-semibold">{strings.auth.password}</span>
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          aria-describedby={state.error ? 'sign-in-error' : undefined}
          className="h-10 rounded-[var(--radius-control)] border border-border-strong bg-background px-3"
        />
      </label>
      {state.error ? (
        <p id="sign-in-error" role="alert" className="text-flag-blocked">
          {state.error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="h-10 rounded-[var(--radius-control)] bg-primary px-4 font-semibold text-primary-foreground disabled:opacity-60"
      >
        {strings.auth.submit}
      </button>
    </form>
  )
}
