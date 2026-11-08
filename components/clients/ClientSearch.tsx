'use client'

import { Search } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { strings } from '@/lib/strings'
import type { ClientSearchProps } from '@/types/clients/card.types'

const DEBOUNCE_MS = 300

/** The term stays in component state and a POST body. A name or cédula never goes in the address. */
export function ClientSearch({
  canIncludeInactive,
  initialIncludeInactive = false,
  onSearch,
  resultCount,
}: ClientSearchProps) {
  const text = strings.pendingReview.clients
  const [term, setTerm] = useState('')
  const [includeInactive, setIncludeInactive] = useState(initialIncludeInactive)

  useEffect(() => {
    const handle = window.setTimeout(() => {
      onSearch(term.trim(), includeInactive)
    }, DEBOUNCE_MS)
    return () => window.clearTimeout(handle)
  }, [term, includeInactive, onSearch])

  return (
    <form
      role="search"
      className="flex flex-col gap-3"
      onSubmit={(event) => {
        event.preventDefault()
        onSearch(term.trim(), includeInactive)
      }}
    >
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex min-w-64 flex-1 flex-col gap-1">
          <Label htmlFor="client-search" className="font-semibold">
            {text.search}
          </Label>
          <div className="relative">
            <Search aria-hidden className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="client-search"
              type="search"
              value={term}
              onChange={(event) => setTerm(event.target.value)}
              autoComplete="off"
              className="h-10 rounded-[var(--radius-control)] pl-9"
            />
          </div>
        </div>
        {canIncludeInactive ? (
          <label className="flex h-10 items-center gap-2">
            <Checkbox
              checked={includeInactive}
              onCheckedChange={(value) => setIncludeInactive(value === true)}
            />
            <span>{text.includeInactive}</span>
          </label>
        ) : null}
        <Button type="submit" className="h-10 rounded-[var(--radius-control)] px-4 font-semibold">
          <Search aria-hidden className="size-4" />
          {text.searchButton}
        </Button>
      </div>
      {typeof resultCount === 'number' ? (
        <p className="text-sm text-muted-foreground">
          {strings.clients.resultCount(resultCount)}
          {includeInactive ? ` · ${strings.clients.softDeletedHidden}` : null}
        </p>
      ) : null}
    </form>
  )
}
