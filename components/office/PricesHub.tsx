'use client'

import Link from 'next/link'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { strings } from '@/lib/strings'

const text = strings.pendingReview.hubs
const office = strings.pendingReview.office

type TabId = 'lista' | 'editar' | 'aumento'

export function PricesHubNav({
  active,
  canEdit,
  canIncrease,
}: {
  active: TabId
  canEdit: boolean
  canIncrease: boolean
}) {
  const tabs: { id: TabId; label: string; href: string }[] = [
    { id: 'lista', label: office.listTitle, href: '/precios' },
    ...(canEdit ? [{ id: 'editar' as const, label: office.editTitle, href: '/precios?tab=editar' }] : []),
    ...(canIncrease ? [{ id: 'aumento' as const, label: office.increaseTitle, href: '/precios?tab=aumento' }] : []),
  ]

  return (
    <div role="tablist" aria-label={text.preciosTabs} className="flex flex-wrap gap-1 border-b border-border">
      {tabs.map((tab) => {
        const selected = active === tab.id
        return (
          <Link
            key={tab.id}
            href={tab.href}
            role="tab"
            aria-selected={selected}
            className={cn(
              'inline-flex h-10 items-center rounded-t-[var(--radius-control)] px-4 text-sm font-semibold outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-navy)] focus-visible:ring-offset-2',
              selected ? 'border-b-2 border-[var(--color-navy)] text-[var(--color-navy)]' : 'text-muted-foreground',
            )}
          >
            {tab.label}
          </Link>
        )
      })}
    </div>
  )
}

export function PricesHubShell({
  active,
  canEdit,
  canIncrease,
  children,
}: {
  active: TabId
  canEdit: boolean
  canIncrease: boolean
  children: ReactNode
}) {
  return (
    <section className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">{text.preciosTitle}</h1>
      <p className="text-muted-foreground">{text.preciosHint}</p>
      <PricesHubNav active={active} canEdit={canEdit} canIncrease={canIncrease} />
      {children}
    </section>
  )
}
