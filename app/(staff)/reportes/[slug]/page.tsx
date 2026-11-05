import { notFound } from 'next/navigation'
import { StepUpGate } from '@/components/office/Panels'
import { StatusChip } from '@/components/shared/StatusChip'
import { findMenuItem } from '@/lib/config/menu'
import { guardRoute } from '@/lib/server/guard'
import { defaultAuditFilters, getStatistics, salariesLocked } from '@/lib/server/queries/back-office'
import { auditEvent } from '@/lib/server/audit'
import { requireReadyStaff } from '@/lib/server/session/require'
import { strings } from '@/lib/strings'

const text = strings.pendingReview.office

export default async function ReportPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ from?: string; to?: string }>
}) {
  const { slug } = await params
  const entry = findMenuItem(slug)
  const command = entry?.commands[0]
  if (!entry || !command || (!command.startsWith('report.') && !command.startsWith('costs.'))) notFound()
  const context = await requireReadyStaff()
  if (context.locked) return null
  if (!(await guardRoute(context, entry.commands, `/reportes/${slug}`))) {
    return (
      <section className="flex flex-col items-start gap-2">
        <h1 className="text-xl font-semibold">{entry.label}</h1>
        <StatusChip status="BLOQUEADO" />
      </section>
    )
  }
  if (command === 'costs.salaries' && salariesLocked(context)) {
    return (
      <section className="flex flex-col gap-4">
        <h1 className="text-xl font-semibold">{entry.label}</h1>
        <StepUpGate />
      </section>
    )
  }

  const search = await searchParams
  const filters = defaultAuditFilters(search)
  if (command === 'report.statistics') {
    const stats = await getStatistics(context, filters)
    if (stats.kind === 'BLOCKED') return null
    return (
      <section className="flex flex-col gap-4">
        <h1 className="text-xl font-semibold">{text.statsTitle}</h1>
        <p>{text.statsNote}</p>
        <p>{strings.fixed.unopenedReport}</p>
        <form method="get" className="flex flex-wrap items-end gap-3">
          <label className="flex flex-col gap-1"><span className="font-semibold">{text.reportFrom}</span><input type="date" name="from" defaultValue={filters.from} className="h-10 rounded-[var(--radius-control)] border border-border-strong px-3" /></label>
          <label className="flex flex-col gap-1"><span className="font-semibold">{text.reportTo}</span><input type="date" name="to" defaultValue={filters.to} className="h-10 rounded-[var(--radius-control)] border border-border-strong px-3" /></label>
          <button type="submit" className="h-10 rounded-[var(--radius-control)] bg-primary px-4 font-semibold text-primary-foreground">{text.auditApply}</button>
        </form>
        {stats.lines.every(([, value]) => value === strings.empty.dash || value === '0') &&
        stats.refusals.length === 0 &&
        stats.portalFailures.length === 0 ? (
          <p>{text.statsNone}</p>
        ) : null}
        <dl className="grid gap-2 sm:grid-cols-2">
          {stats.lines.map(([label, value]) => (
            <div key={label} className="flex justify-between gap-4 border-b border-border py-1">
              <dt>{label}</dt>
              <dd className="tabular-nums font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
        <h2 className="font-semibold">{text.statsRefusals}</h2>
        <ul>
          {stats.refusals.map((group) => (
            <li key={group.label} className="tabular-nums">{group.label}: {group.count}</li>
          ))}
        </ul>
        <h2 className="font-semibold">{text.statsPortalFailures}</h2>
        <ul>
          {stats.portalFailures.map((group) => (
            <li key={group.label} className="tabular-nums">{group.label}: {group.count}</li>
          ))}
        </ul>
        {stats.suppressed > 0 ? <p>{text.statsSuppressed(stats.suppressed)}</p> : null}
      </section>
    )
  }

  await auditEvent({
    command: 'report.view',
    outcome: 'ALLOWED',
    session: context.session,
    account: context.account,
    recordType: 'report',
    recordId: command,
    change: { before: null, after: { from: filters.from, to: filters.to } },
  })
  return (
    <section className="flex flex-col gap-3">
      <h1 className="text-xl font-semibold">{entry.label}</h1>
      <form method="get" className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1"><span className="font-semibold">{text.reportFrom}</span><input type="date" name="from" defaultValue={filters.from} className="h-10 rounded-[var(--radius-control)] border border-border-strong px-3" /></label>
        <label className="flex flex-col gap-1"><span className="font-semibold">{text.reportTo}</span><input type="date" name="to" defaultValue={filters.to} className="h-10 rounded-[var(--radius-control)] border border-border-strong px-3" /></label>
        <button type="submit" className="h-10 rounded-[var(--radius-control)] bg-primary px-4 font-semibold text-primary-foreground">{text.auditApply}</button>
      </form>
      <p>{strings.fixed.unopenedReport}</p>
      {command === 'costs.averages' ? <p>{text.averagesNone}</p> : null}
    </section>
  )
}
