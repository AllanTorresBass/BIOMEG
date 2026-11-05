import { Search } from 'lucide-react'
import { strings } from '@/lib/strings'

interface ClientSearchProps {
  query: string
  includeInactive: boolean
  canIncludeInactive: boolean
}

/** A plain GET form. The page reads the search from the address, so a refresh keeps it. */
export function ClientSearch({ query, includeInactive, canIncludeInactive }: ClientSearchProps) {
  const text = strings.pendingReview.clients
  return (
    <form method="get" action="/clientes" role="search" className="flex flex-wrap items-end gap-4">
      <label className="flex min-w-64 flex-1 flex-col gap-1">
        <span className="font-semibold">{text.search}</span>
        <input
          name="q"
          type="search"
          defaultValue={query}
          autoComplete="off"
          className="h-10 rounded-[var(--radius-control)] border border-border-strong bg-background px-3"
        />
      </label>
      {canIncludeInactive ? (
        <label className="flex h-10 items-center gap-2">
          <input name="inactivos" type="checkbox" value="1" defaultChecked={includeInactive} className="size-4" />
          <span>{text.includeInactive}</span>
        </label>
      ) : null}
      <button
        type="submit"
        className="inline-flex h-10 items-center gap-2 rounded-[var(--radius-control)] bg-primary px-4 font-semibold text-primary-foreground"
      >
        <Search aria-hidden className="size-4" />
        {text.searchButton}
      </button>
    </form>
  )
}
