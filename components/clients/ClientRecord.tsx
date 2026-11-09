'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ClientCard } from '@/components/clients/ClientCard'
import { ClientLifecycle, hasLifecycleActions } from '@/components/clients/ClientLifecycle'
import { RecordTabs } from '@/components/shared/RecordTabs'
import { StaffBreadcrumb } from '@/components/shared/StaffBreadcrumb'
import { StatusChip } from '@/components/shared/StatusChip'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { strings } from '@/lib/strings'
import type { ClientFormPanel } from '@/types/clients/client-card.props'
import type { ClientRecordProps, ClientSection } from '@/types/clients/client-record.props'

const text = strings.pendingReview.clients

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

  return (
    <section className="flex max-w-3xl flex-col gap-4">
      <StaffBreadcrumb
        label={text.routeLabel}
        crumbs={[
          { label: strings.clients.title, href: '/clientes' },
          { label: current },
        ]}
      />
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
            <div className="flex flex-wrap gap-2">
              <Button asChild variant="outline" className="h-10 rounded-[var(--radius-control)] px-4 font-semibold">
                <Link href={`/ordenes/nueva?via=particular&clientId=${encodeURIComponent(card.id)}`}>{strings.clients.newOrder}</Link>
              </Button>
              <Button asChild className="h-10 rounded-[var(--radius-control)] px-4 font-semibold">
                <Link href={`/ordenes/facturar?clientId=${encodeURIComponent(card.id)}`}>{strings.clients.billOrder}</Link>
              </Button>
            </div>
          ) : null}
        </div>
      </div>

      <RecordTabs
        tabs={tabs}
        label={text.cardTitle}
        idPrefix="client"
        value={active}
        onChange={(id) => setSection(id as ClientSection)}
      >
        {(tab) => (
          <>
            <div hidden={tab === 'acciones'}>
              <ClientCard
                key={card.id ?? 'new'}
                data={card}
                canEdit={canEdit}
                canOpenOrder={canOpenOrder}
                justSaved={justSaved}
                embedded
                panel={tab === 'contacto' ? 'contacto' : 'ficha'}
                onFieldPanel={(panel: ClientFormPanel) => setSection(panel)}
              />
            </div>
            {showActions && lifecycle ? (
              <div
                role="tabpanel"
                id="client-panel-acciones"
                aria-labelledby="client-tab-acciones"
                hidden={tab !== 'acciones'}
              >
                <ClientLifecycle key={`lifecycle-${lifecycle.clientId}`} {...lifecycle} hideTitle />
              </div>
            ) : null}
          </>
        )}
      </RecordTabs>
    </section>
  )
}
