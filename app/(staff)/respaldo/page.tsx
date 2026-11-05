import { BackupPanel } from '@/components/office/Panels'
import { BlockedNotice } from '@/components/shared/BlockedNotice'
import { DataTable } from '@/components/shared/DataTable'
import { guardRoute } from '@/lib/server/guard'
import { backupScreen } from '@/lib/server/queries/back-office'
import { requireReadyStaff } from '@/lib/server/session/require'
import { strings } from '@/lib/strings'

const text = strings.pendingReview.office

export default async function BackupPage() {
  const context = await requireReadyStaff()
  if (context.locked) return null
  if (!(await guardRoute(context, ['backup.run'], '/respaldo'))) return <BlockedNotice />
  const rows = backupScreen()
  return (
    <section className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">{text.backupTitle}</h1>
      <BackupPanel />
      <DataTable
        caption={text.backupTitle}
        columns={[
          { key: 'when', header: text.auditWhen, rowHeader: true, className: 'tabular-nums', cell: (row) => row.atText },
          { key: 'by', header: text.auditUser, cell: (row) => row.byName },
        ]}
        rows={rows}
        rowKey={(row) => row.at}
        emptyText={text.backupEmpty}
      />
    </section>
  )
}
