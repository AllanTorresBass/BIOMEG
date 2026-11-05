'use client'

import { Search } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { strings } from '@/lib/strings'
import type { ClientSearchProps } from '@/types/clients/card.types'

/** The term stays in component state and a POST body. A name or cédula never goes in the address. */
export function ClientSearch({ canIncludeInactive, onSearch }: ClientSearchProps) {
  const text = strings.pendingReview.clients
  const [term, setTerm] = useState('')
  const [includeInactive, setIncludeInactive] = useState(false)

  function submit(event: FormEvent) {
    event.preventDefault()
    onSearch(term.trim(), includeInactive)
  }

  return (
    <form onSubmit={submit} role="search" className="flex flex-wrap items-end gap-4">
      <label className="flex min-w-64 flex-1 flex-col gap-1">
        <span className="font-semibold">{text.search}</span>
        <input
          type="search"
          value={term}
          onChange={(event) => setTerm(event.target.value)}
          autoComplete="off"
          className="h-10 rounded-[var(--radius-control)] border border-border-strong bg-background px-3"
        />
      </label>
      {canIncludeInactive ? (
        <label className="flex h-10 items-center gap-2">
          <input
            type="checkbox"
            checked={includeInactive}
            onChange={(event) => setIncludeInactive(event.target.checked)}
            className="size-4"
          />
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
