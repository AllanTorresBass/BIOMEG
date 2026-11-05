import { InventoryPanel } from '@/components/office/Panels'
import { BlockedNotice } from '@/components/shared/BlockedNotice'
import { DataTable } from '@/components/shared/DataTable'
import { guardRoute } from '@/lib/server/guard'
import { inventoryScreen } from '@/lib/server/queries/back-office'
import { requireReadyStaff } from '@/lib/server/session/require'
import { strings } from '@/lib/strings'
import { formatDate, formatTime } from '@/lib/utils/format'

const text = strings.pendingReview.office

export default async function InventoryPage() {
  const context = await requireReadyStaff()
  if (context.locked) return null
  if (!(await guardRoute(context, ['inventory.deduct'], '/inventario'))) return <BlockedNotice />
  const screen = inventoryScreen()
  return (
    <section className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">{text.inventoryTitle}</h1>
      <InventoryPanel reagents={screen.reagents.map((row) => ({ id: row.id, name: row.name }))} />
      <DataTable
        caption={text.inventoryTitle}
        columns={[
          { key: 'name', header: text.name, rowHeader: true, cell: (row) => row.reagentName },
          { key: 'qty', header: text.quantity, className: 'tabular-nums', cell: (row) => row.quantity },
          { key: 'when', header: text.auditWhen, className: 'tabular-nums', cell: (row) => `${formatDate(row.at)} ${formatTime(row.at)}` },
        ]}
        rows={screen.movements}
        rowKey={(row) => row.id}
        emptyText={text.inventoryEmpty}
      />
    </section>
  )
}
