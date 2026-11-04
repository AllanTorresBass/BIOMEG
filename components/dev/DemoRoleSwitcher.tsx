import { switchDemoUser } from '@/app/actions/demo'
import { strings } from '@/lib/strings'
import type { DemoAccountOption } from '@/types/shell/shell.types'

interface DemoRoleSwitcherProps {
  accounts: readonly DemoAccountOption[]
  currentUserId: string
}

/** Demo only. Switching starts a fresh session, exactly as a sign-in would. */
export function DemoRoleSwitcher({ accounts, currentUserId }: DemoRoleSwitcherProps) {
  return (
    <section aria-label={strings.shell.demoSwitch} className="flex flex-wrap items-center gap-2 border-t border-border bg-sunken px-4 py-2">
      <p className="font-semibold">{strings.shell.demoSwitch}</p>
      {accounts.map((account) => (
        <form key={account.id} action={switchDemoUser}>
          <input type="hidden" name="userId" value={account.id} />
          <button
            type="submit"
            aria-pressed={account.id === currentUserId}
            className="h-9 rounded-[var(--radius-control)] border border-border-strong bg-card px-3 aria-pressed:bg-primary aria-pressed:text-primary-foreground"
          >
            {account.label}
          </button>
        </form>
      ))}
    </section>
  )
}
