import type { ReactNode } from 'react'

export interface DataTableColumn<Row> {
  key: string
  header: ReactNode
  /** Null or undefined shows the dash, so a partial row is never blank. */
  cell: (row: Row) => ReactNode
  /** The column that names the row, for screen readers. */
  rowHeader?: boolean
  className?: string
}

export interface DataTableProps<Row> {
  caption: string
  columns: readonly DataTableColumn<Row>[]
  rows: readonly Row[]
  rowKey: (row: Row) => string
  emptyText: string
  /** Set when a refresh failed. Rows already on screen stay. */
  errorText?: string | null | undefined
  blocked?: boolean
  rowClassName?: (row: Row) => string | undefined
  className?: string
}
