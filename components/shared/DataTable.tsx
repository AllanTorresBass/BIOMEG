import { BlockedNotice } from '@/components/shared/BlockedNotice'
import { cn } from '@/lib/utils/cn'
import { strings } from '@/lib/strings'
import type { DataTableProps } from '@/types/shared/data-table.props'

const CELL = 'px-3 py-2'

/**
 * The one table for lists. It renders the required states: empty, a single row, partial rows,
 * an error that keeps the last good rows on screen, and no permission with no values at all.
 */
export function DataTable<Row>({
  caption,
  columns,
  rows,
  rowKey,
  emptyText,
  errorText,
  blocked = false,
  rowClassName,
  className,
}: DataTableProps<Row>) {
  if (blocked) return <BlockedNotice />

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {errorText ? (
        <p role="alert" className="font-semibold text-flag-blocked">
          {errorText}
        </p>
      ) : null}
      {rows.length === 0 ? (
        errorText ? null : <p className="text-muted-foreground">{emptyText}</p>
      ) : (
        <div className="overflow-x-auto rounded-[var(--radius-card)] border border-border bg-card">
          <table className="w-full border-collapse text-left">
            <caption className="sr-only">{caption}</caption>
            <thead>
              <tr className="border-b border-border bg-sunken">
                {columns.map((column) => (
                  <th key={column.key} scope="col" className={cn(CELL, 'font-semibold', column.className)}>
                    {column.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={rowKey(row)} className={cn('border-b border-border last:border-b-0', rowClassName?.(row))}>
                  {columns.map((column) =>
                    column.rowHeader ? (
                      <th key={column.key} scope="row" className={cn(CELL, 'font-normal', column.className)}>
                        {column.cell(row) ?? strings.empty.dash}
                      </th>
                    ) : (
                      <td key={column.key} className={cn(CELL, column.className)}>
                        {column.cell(row) ?? strings.empty.dash}
                      </td>
                    ),
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
