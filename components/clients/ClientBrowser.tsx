'use client'

import { useState } from 'react'
import { ClientList } from '@/components/clients/ClientList'
import { ClientSearch } from '@/components/clients/ClientSearch'
import { useClientSearch } from '@/hooks/use-clients'
import { strings } from '@/lib/strings'
import type { ClientBrowserProps } from '@/types/clients/card.types'

/** Search and list together. Opening a client keeps this state, because the page segment stays mounted. */
export function ClientBrowser({ initialRows, selectedId, canIncludeInactive }: ClientBrowserProps) {
  const [search, setSearch] = useState({ text: '', includeInactive: false })
  const { rows, isLoading, isError } = useClientSearch(search.text, search.includeInactive, initialRows)

  return (
    <div className="flex min-w-0 flex-col gap-4">
      <ClientSearch
        canIncludeInactive={canIncludeInactive}
        onSearch={(text, includeInactive) => setSearch({ text, includeInactive })}
      />
      {isError ? (
        <p role="alert">{strings.pendingReview.api.fetchFailed}</p>
      ) : isLoading ? (
        <p className="text-muted-foreground">{strings.pendingReview.clients.searching}</p>
      ) : (
        <ClientList rows={rows} selectedId={selectedId} />
      )}
    </div>
  )
}
