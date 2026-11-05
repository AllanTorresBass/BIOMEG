import Link from 'next/link'
import { strings } from '@/lib/strings'
import type { PrimaryAction } from '@/types/shell/menu.types'

export function PrimaryActions({ actions }: { actions: readonly PrimaryAction[] }) {
  if (actions.length === 0) return null
  return (
    <nav aria-label={strings.shell.actionsLabel} className="flex flex-wrap gap-2 border-b border-border bg-sunken px-4 py-2">
      {actions.map((action) => (
        <Link
          key={action.label}
          href={action.href}
          className="flex h-10 items-center rounded-[var(--radius-control)] border border-border-strong bg-card px-4 font-semibold hover:bg-background"
        >
          {action.label}
        </Link>
      ))}
    </nav>
  )
}
