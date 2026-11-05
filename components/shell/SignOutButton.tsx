'use client'

import { useTransition } from 'react'
import { useSessionCommands } from '@/hooks/use-session'
import { strings } from '@/lib/strings'

export function SignOutButton() {
  const { signOut } = useSessionCommands()
  const [pending, start] = useTransition()
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => start(async () => void (await signOut()))}
      className="h-9 rounded-[var(--radius-control)] bg-card px-3 font-semibold text-foreground disabled:opacity-60"
    >
      {strings.shell.signOut}
    </button>
  )
}
