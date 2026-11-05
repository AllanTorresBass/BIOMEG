import { StatusChip } from '@/components/shared/StatusChip'
import { DataTable } from '@/components/shared/DataTable'
import { defaultAuditFilters, getAuditScreen } from '@/lib/server/queries/back-office'
import { requireReadyStaff } from '@/lib/server/session/require'
import { strings } from '@/lib/strings'

const text = strings.pendingReview.office
const FIELD = 'h-10 rounded-[var(--radius-control)] border border-border-strong bg-background px-3'

export default async function AuditPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string; event?: string; user?: string; severity?: string; outcome?: string; record?: string; row?: string }>
}) {
  const context = await requireReadyStaff()
  if (context.locked) return null
  const search = await searchParams
  const filters = defaultAuditFilters(search)
  const screen = await getAuditScreen(context, filters)
  if (screen.kind === 'BLOCKED') {
    return (
      <section className="flex flex-col items-start gap-2">
        <h1 className="text-xl font-semibold">{text.auditTitle}</h1>
        <StatusChip status="BLOQUEADO" />
      </section>
    )
  }
  const open = screen.rows.find((row) => row.id === search.row) ?? null
  return (
    <section className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">{text.auditTitle}</h1>
      <form method="get" className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1"><span className="font-semibold">{text.auditFrom}</span><input type="date" name="from" defaultValue={filters.from} className={FIELD} /></label>
        <label className="flex flex-col gap-1"><span className="font-semibold">{text.auditTo}</span><input type="date" name="to" defaultValue={filters.to} className={FIELD} /></label>
        <label className="flex flex-col gap-1"><span className="font-semibold">{text.auditEvent}</span><input name="event" defaultValue={search.event ?? ''} className={FIELD} /></label>
        <label className="flex flex-col gap-1">
          <span className="font-semibold">{text.auditUser}</span>
          <select name="user" defaultValue={search.user ?? ''} className={FIELD}>
            <option value="">{text.categoryAll}</option>
            {screen.users.map((person) => (
              <option key={person.id} value={person.id}>{person.displayName}</option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="font-semibold">{text.auditSeverity}</span>
          <select name="severity" defaultValue={search.severity ?? ''} className={FIELD}>
            <option value="">{text.categoryAll}</option>
            {['INFO', 'NOTICE', 'WARNING', 'CRITICAL'].map((level) => <option key={level} value={level}>{level}</option>)}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="font-semibold">{text.auditResult}</span>
          <select name="outcome" defaultValue={search.outcome ?? ''} className={FIELD}>
            <option value="">{text.categoryAll}</option>
            {['ALLOWED', 'REFUSED', 'FAILED'].map((level) => <option key={level} value={level}>{level}</option>)}
          </select>
        </label>
        <label className="flex flex-col gap-1"><span className="font-semibold">{text.auditRecord}</span><input name="record" defaultValue={search.record ?? ''} className={FIELD} /></label>
        <button type="submit" className="h-10 rounded-[var(--radius-control)] bg-primary px-4 font-semibold text-primary-foreground">{text.auditApply}</button>
      </form>
      <DataTable
        caption={text.auditTitle}
        columns={[
          { key: 'when', header: text.auditWhen, className: 'tabular-nums', cell: (row) => row.atText },
          { key: 'event', header: text.auditEvent, rowHeader: true, cell: (row) => row.event },
          { key: 'user', header: text.auditUser, cell: (row) => row.user },
          { key: 'record', header: text.auditRecord, cell: (row) => row.record },
          { key: 'result', header: text.auditResult, cell: (row) => row.outcome },
          { key: 'motivo', header: text.auditMotivo, cell: (row) => row.motivo },
        ]}
        rows={screen.rows}
        rowKey={(row) => row.id}
        emptyText={text.auditEmpty}
      />
      {open ? (
        <section className="rounded-[var(--radius-card)] border border-border bg-card p-4">
          <h2 className="font-semibold">{text.auditDetail}</h2>
          <p>{open.detail}</p>
        </section>
      ) : null}
    </section>
  )
}
