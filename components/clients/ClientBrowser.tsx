'use client'

import { useCallback, useState } from 'react'
import { ClientList } from '@/components/clients/ClientList'
import { ClientSearch } from '@/components/clients/ClientSearch'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { useClientSearch } from '@/hooks/use-clients'
import { strings } from '@/lib/strings'
import type { ClientBrowserProps } from '@/types/clients/card.types'

/** Search and list. Choosing a name opens that client's ficha on its own page. */
export function ClientBrowser({
  initialRows,
  canIncludeInactive,
  initialIncludeInactive = false,
}: ClientBrowserProps) {
  const [search, setSearch] = useState({ text: '', includeInactive: initialIncludeInactive })
  const { rows, isLoading, isError } = useClientSearch(search.text, search.includeInactive, initialRows)

  const onSearch = useCallback((text: string, includeInactive: boolean) => {
    setSearch({ text, includeInactive })
  }, [])

  return (
    <div className="flex min-w-0 flex-col gap-4">
      <ClientSearch
        key={initialIncludeInactive ? 'inactive-on' : 'inactive-off'}
        canIncludeInactive={canIncludeInactive}
        initialIncludeInactive={initialIncludeInactive}
        onSearch={onSearch}
        resultCount={isLoading ? undefined : rows.length}
      />
      {isError ? (
        <Alert variant="destructive">
          <AlertDescription>{strings.pendingReview.api.fetchFailed}</AlertDescription>
        </Alert>
      ) : isLoading ? (
        <div className="flex flex-col gap-2" aria-busy="true" aria-live="polite">
          <p className="text-muted-foreground">{strings.pendingReview.clients.searching}</p>
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : (
        <ClientList
          rows={rows}
          searching={search.text !== '' || search.includeInactive}
          canIncludeInactive={canIncludeInactive}
          includeInactive={search.includeInactive}
        />
      )}
    </div>
  )
}
