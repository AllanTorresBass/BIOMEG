'use client'

import { useState, type KeyboardEvent, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

export interface RecordTab {
  id: string
  label: string
}

/**
 * Accessible tablist for staff fichas (Pacientes, órdenes, hubs).
 * Arrow / Home / End move focus; selection follows focus.
 */
export function RecordTabs({
  tabs,
  label,
  defaultTab,
  value,
  onChange,
  idPrefix = 'record',
  children,
}: {
  tabs: readonly RecordTab[]
  label: string
  defaultTab?: string
  value?: string
  onChange?: (id: string) => void
  idPrefix?: string
  children: (active: string) => ReactNode
}) {
  const initial = tabs.some((tab) => tab.id === defaultTab) ? (defaultTab as string) : (tabs[0]?.id ?? '')
  const [internal, setInternal] = useState(initial)
  const section = value ?? internal
  const active = tabs.some((tab) => tab.id === section) ? section : (tabs[0]?.id ?? '')

  function select(id: string) {
    if (value === undefined) setInternal(id)
    onChange?.(id)
  }

  function onTabKey(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const last = tabs.length - 1
    const nextIndex =
      event.key === 'ArrowRight' ? (index + 1) % tabs.length
      : event.key === 'ArrowLeft' ? (index + last) % tabs.length
      : event.key === 'Home' ? 0
      : event.key === 'End' ? last
      : null
    if (nextIndex === null) return
    event.preventDefault()
    const next = tabs[nextIndex]
    if (!next) return
    select(next.id)
    document.getElementById(`${idPrefix}-tab-${next.id}`)?.focus()
  }

  return (
    <div className="flex flex-col gap-4">
      <div role="tablist" aria-label={label} className="flex flex-wrap gap-1 border-b border-border">
        {tabs.map((tab, index) => {
          const selected = active === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              id={`${idPrefix}-tab-${tab.id}`}
              aria-selected={selected}
              aria-controls={`${idPrefix}-panel-${tab.id}`}
              tabIndex={selected ? 0 : -1}
              className={cn(
                'h-10 rounded-t-[var(--radius-control)] px-4 text-sm font-semibold outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-navy)] focus-visible:ring-offset-2',
                selected ? 'border-b-2 border-[var(--color-navy)] text-[var(--color-navy)]' : 'text-muted-foreground',
              )}
              onClick={() => select(tab.id)}
              onKeyDown={(event) => onTabKey(event, index)}
            >
              {tab.label}
            </button>
          )
        })}
      </div>
      {children(active)}
    </div>
  )
}
