'use client'

import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { useState, type KeyboardEvent } from 'react'
import { ClientCard } from '@/components/clients/ClientCard'
import { ClientLifecycle, hasLifecycleActions } from '@/components/clients/ClientLifecycle'
import { StatusChip } from '@/components/shared/StatusChip'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { strings } from '@/lib/strings'
import { cn } from '@/lib/utils'
import type { ClientFormPanel } from '@/types/clients/client-card.props'
import type { ClientRecordProps, ClientSection } from '@/types/clients/client-record.props'

const text = strings.pendingReview.clients

function crumb(current: string) {
  return (
    <nav aria-label={text.routeLabel} className="sticky top-0 z-10 -mx-1 bg-[var(--surface-page)] px-1 py-2">
      <ol className="flex flex-wrap items-center gap-1 text-sm">
        <li>
          <Link
            href="/clientes"
            className="rounded-[var(--radius-control)] font-semibold text-primary underline-offset-2 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-[var(--color-navy)] focus-visible:ring-offset-2"
          >
            {strings.clients.title}
          </Link>
        </li>
        <li aria-hidden className="text-muted-foreground">
          <ChevronRight className="size-4" />
        </li>
        <li aria-current="page" className="font-semibold">
          {current}
        </li>
      </ol>
    </nav>
  )
}

export function ClientRecord({ card, lifecycle, canEdit, canOpenOrder, justSaved }: ClientRecordProps) {
  const showActions = lifecycle !== null && hasLifecycleActions(lifecycle)
  const [section, setSection] = useState<ClientSection>('ficha')
  const tabs: { id: ClientSection; label: string }[] = [
    { id: 'ficha', label: text.fichaTab },
    { id: 'contacto', label: text.contactTab },
    ...(showActions ? [{ id: 'acciones' as const, label: text.actionsTab }] : []),
  ]
  const active = tabs.some((tab) => tab.id === section) ? section : 'ficha'
  const current = card.id ? card.fullName : text.newTitle

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
    setSection(next.id)
    document.getElementById(`client-tab-${next.id}`)?.focus()
  }

  return (
    <section className="flex max-w-3xl flex-col gap-4">
      {crumb(current)}
      <div className="flex flex-col gap-3 border-b-2 border-[var(--color-burgundy)] pb-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-xl font-semibold">{current}</h1>
            {card.id ? (
              card.verified ? (
                <Badge className="rounded-[var(--radius-control)] border-transparent bg-flag-released-bg text-xs font-semibold text-flag-released uppercase">
                  {strings.clients.verified}
                </Badge>
              ) : (
                <StatusChip status="SIN_VERIFICAR" />
              )
            ) : null}
            {card.id && !card.active ? <StatusChip status="INACTIVO" /> : null}
          </div>
          {card.id && card.active && canOpenOrder ? (
            <Button asChild variant="outline" className="h-10 rounded-[var(--radius-control)] px-4 font-semibold">
              <Link href={`/ordenes/nueva?via=particular&clientId=${encodeURIComponent(card.id)}`}>{strings.clients.newOrder}</Link>
            </Button>
          ) : null}
        </div>
      </div>

      <div role="tablist" aria-label={text.cardTitle} className="flex flex-wrap gap-1 border-b border-border">
        {tabs.map((tab, index) => {
          const selected = active === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              id={`client-tab-${tab.id}`}
              aria-selected={selected}
              aria-controls={`client-panel-${tab.id}`}
              tabIndex={selected ? 0 : -1}
              className={cn(
                'h-10 rounded-t-[var(--radius-control)] px-4 text-sm font-semibold outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-navy)] focus-visible:ring-offset-2',
                selected ? 'border-b-2 border-[var(--color-navy)] text-[var(--color-navy)]' : 'text-muted-foreground',
              )}
              onClick={() => setSection(tab.id)}
              onKeyDown={(event) => onTabKey(event, index)}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      <div hidden={active === 'acciones'}>
        <ClientCard
          key={card.id ?? 'new'}
          data={card}
          canEdit={canEdit}
          canOpenOrder={canOpenOrder}
          justSaved={justSaved}
          embedded
          panel={active === 'contacto' ? 'contacto' : 'ficha'}
          onFieldPanel={(panel: ClientFormPanel) => setSection(panel)}
        />
      </div>

      {showActions && lifecycle ? (
        <div role="tabpanel" id="client-panel-acciones" aria-labelledby="client-tab-acciones" hidden={active !== 'acciones'}>
          <ClientLifecycle key={`lifecycle-${lifecycle.clientId}`} {...lifecycle} hideTitle />
        </div>
      ) : null}
    </section>
  )
}
