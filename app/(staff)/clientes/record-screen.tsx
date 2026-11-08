import Link from 'next/link'
import { ClientRecord } from '@/components/clients/ClientRecord'
import { BlockedNotice } from '@/components/shared/BlockedNotice'
import { getClientsScreen } from '@/lib/server/queries/clients'
import { requireReadyStaff } from '@/lib/server/session/require'
import { strings } from '@/lib/strings'

export async function ClientRecordScreen({
  clientId,
  wantsNew,
  justSaved,
}: {
  clientId: string
  wantsNew: boolean
  justSaved: boolean
}) {
  const context = await requireReadyStaff()
  if (context.locked) return null
  const screen = await getClientsScreen(context, clientId, wantsNew)
  if (screen.kind === 'BLOCKED') return <BlockedNotice />
  if (wantsNew && !screen.canCreate) return <BlockedNotice />
  const { card, lifecycle, canCreate, canEdit, canOpenOrder } = screen
  if (!card) {
    return (
      <section className="flex flex-col gap-3">
        <Link href="/clientes" className="font-semibold text-primary underline-offset-2 hover:underline">
          {strings.clients.title}
        </Link>
        <h1 className="text-xl font-semibold">{strings.pendingReview.clients.errors.NOT_FOUND}</h1>
      </section>
    )
  }

  return (
    <ClientRecord
      card={card}
      lifecycle={lifecycle}
      canEdit={card.id ? canEdit : canCreate}
      canOpenOrder={canOpenOrder}
      justSaved={justSaved}
    />
  )
}
