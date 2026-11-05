import Link from 'next/link'
import { Plus } from 'lucide-react'
import { ClientCard } from '@/components/clients/ClientCard'
import { ClientLifecycle } from '@/components/clients/ClientLifecycle'
import { ClientBrowser } from '@/components/clients/ClientBrowser'
import { BlockedNotice } from '@/components/shared/BlockedNotice'
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

  const context = await requireReadyStaff()
  if (context.locked) return null
  const screen = await getClientsScreen(context, selectedId, wantsNew)
  if (screen.kind === 'BLOCKED') return <BlockedNotice />
  const { rows, card, lifecycle, canCreate, canEdit, canIncludeInactive } = screen

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">{strings.clients.title}</h1>
        {canCreate ? (
          <Link
            href="/clientes?nuevo=1"
            className="inline-flex h-10 items-center gap-2 rounded-[var(--radius-control)] bg-primary px-4 font-semibold text-primary-foreground"
          >
            <Plus aria-hidden className="size-4" />
            {strings.pendingReview.clients.newClient}
          </Link>
        ) : null}
      </div>

      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <ClientBrowser
          initialRows={rows}
          selectedId={screen.selectedId}
          canIncludeInactive={canIncludeInactive}
        />
        {card ? (
          <div className="flex flex-col gap-4">
            <ClientCard
              key={card.id ?? 'new'}
              data={card}
              canEdit={card.id ? canEdit : canCreate}
              justSaved={justSaved}
            />
            {lifecycle ? <ClientLifecycle key={`lifecycle-${lifecycle.clientId}`} {...lifecycle} /> : null}
          </div>
        ) : null}
      </div>
    </section>
  )
}
