'use client'

import { useTransition } from 'react'
import { useSessionCommands } from '@/hooks/use-session'
import { strings } from '@/lib/strings'
import type { DemoRoleSwitcherProps } from '@/types/shell/shell.types'

/** Demo only. Switching starts a fresh session, exactly as a sign-in would. */
export function DemoRoleSwitcher({ accounts, currentUserId }: DemoRoleSwitcherProps) {
  const { switchDemoUser } = useSessionCommands()
  const [pending, start] = useTransition()
  return (
    <section aria-label={strings.shell.demoSwitch} className="flex flex-wrap items-center gap-2 border-t border-border bg-sunken px-4 py-2">
      <p className="font-semibold">{strings.shell.demoSwitch}</p>
      {accounts.map((account) => (
        <button
          key={account.id}
          type="button"
          disabled={pending}
          aria-pressed={account.id === currentUserId}
          onClick={() => start(async () => void (await switchDemoUser(account.id)))}
          className="h-9 rounded-[var(--radius-control)] border border-border-strong bg-card px-3 aria-pressed:bg-primary aria-pressed:text-primary-foreground"
        >
          {account.label}
        </button>
      ))}
    </section>
  )
}
