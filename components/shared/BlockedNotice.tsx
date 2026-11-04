import { StatusChip } from '@/components/shared/StatusChip'
import { strings } from '@/lib/strings'

/** Shown when a route is refused. It names no record and shows no values. */
export function BlockedNotice() {
  return (
    <section className="flex flex-col items-start gap-3 rounded-[var(--radius-card)] border border-border bg-card p-5">
      <StatusChip status="BLOQUEADO" />
      <h1 className="text-xl font-semibold">{strings.shell.blockedTitle}</h1>
    </section>
  )
}
