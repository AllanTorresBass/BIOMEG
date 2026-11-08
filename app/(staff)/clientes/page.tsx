import Link from 'next/link'
import { Plus } from 'lucide-react'
import { ClientCard } from '@/components/clients/ClientCard'
import { ClientDetailPane } from '@/components/clients/ClientDetailPane'
import { ClientLifecycle } from '@/components/clients/ClientLifecycle'
import { ClientBrowser } from '@/components/clients/ClientBrowser'
import { BlockedNotice } from '@/components/shared/BlockedNotice'
import { Button } from '@/components/ui/button'
import { getClientsScreen } from '@/lib/server/queries/clients'
import { requireReadyStaff } from '@/lib/server/session/require'
import { strings } from '@/lib/strings'
import type { SearchParams } from '@/types/app/page.types'

function one(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? '') : (value ?? '')
}

export default async function ClientsPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams
  const selectedId = one(params.id)
  const wantsNew = one(params.nuevo) === '1'
  const justSaved = one(params.saved) === '1'
  const includeInactive = one(params.incluirInactivos) === '1'

  const context = await requireReadyStaff()
  if (context.locked) return null
  const screen = await getClientsScreen(context, selectedId, wantsNew)
  if (screen.kind === 'BLOCKED') return <BlockedNotice />
  const { rows, card, lifecycle, canCreate, canEdit, canIncludeInactive, canOpenOrder } = screen

  const detailTitle = card?.id
    ? strings.pendingReview.clients.cardTitle
    : wantsNew
      ? strings.pendingReview.clients.newTitle
      : strings.clients.title

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">{strings.clients.title}</h1>
        {canCreate ? (
          <Button asChild size="lg" className="h-10 rounded-[var(--radius-control)] px-4 font-semibold">
            <Link href="/clientes?nuevo=1">
              <Plus aria-hidden className="size-4" />
              {strings.pendingReview.clients.newClient}
            </Link>
          </Button>
        ) : null}
      </div>

      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <ClientBrowser
          initialRows={rows}
          selectedId={screen.selectedId}
          canIncludeInactive={canIncludeInactive}
          initialIncludeInactive={includeInactive && canIncludeInactive}
        />
        <ClientDetailPane open={card !== null} title={detailTitle}>
          {card ? (
            <>
              <ClientCard
                key={card.id ?? 'new'}
                data={card}
                canEdit={card.id ? canEdit : canCreate}
                canOpenOrder={canOpenOrder}
                justSaved={justSaved}
              />
              {lifecycle ? <ClientLifecycle key={`lifecycle-${lifecycle.clientId}`} {...lifecycle} /> : null}
            </>
          ) : null}
        </ClientDetailPane>
      </div>
    </section>
  )
}
