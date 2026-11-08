import Link from 'next/link'
import { Plus } from 'lucide-react'
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
  const includeInactive = one(params.incluirInactivos) === '1'

  const context = await requireReadyStaff()
  if (context.locked) return null

  const screen = await getClientsScreen(context, '', false)
  if (screen.kind === 'BLOCKED') return <BlockedNotice />
  const { rows, canCreate, canIncludeInactive } = screen

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b-2 border-[var(--color-burgundy)] pb-3">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-semibold">{strings.clients.title}</h1>
          <p className="text-sm text-muted-foreground">
            {canCreate ? strings.clients.selectPrompt : strings.clients.selectPromptReadOnly}
          </p>
        </div>
        {canCreate ? (
          <Button asChild size="lg" className="h-10 rounded-[var(--radius-control)] px-4 font-semibold">
            <Link href="/clientes/nuevo">
              <Plus aria-hidden className="size-4" />
              {strings.pendingReview.clients.newClient}
            </Link>
          </Button>
        ) : null}
      </div>

      <ClientBrowser
        initialRows={rows}
        canIncludeInactive={canIncludeInactive}
        initialIncludeInactive={includeInactive && canIncludeInactive}
      />
    </section>
  )
}
