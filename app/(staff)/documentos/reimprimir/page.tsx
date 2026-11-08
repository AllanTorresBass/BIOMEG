import Link from 'next/link'
import { BlockedNotice } from '@/components/shared/BlockedNotice'
import { StaffBreadcrumb } from '@/components/shared/StaffBreadcrumb'
import { mayReach } from '@/lib/server/guard'
import { requireReadyStaff } from '@/lib/server/session/require'
import { strings } from '@/lib/strings'
import type { ReprintKind } from '@/types/orders/fiscal.types'

const text = strings.pendingReview.hubs
const { kinds } = strings.pendingReview.fiscal

const OPTIONS: { tipo: ReprintKind; commands: string[] }[] = [
  { tipo: 'factura', commands: ['reprint.invoice'] },
  { tipo: 'nota-credito', commands: ['reprint.notes'] },
  { tipo: 'nota-debito', commands: ['reprint.notes'] },
  { tipo: 'orden-entrega', commands: ['reprint.delivery_order'] },
  { tipo: 'orden-empresa', commands: ['reprint.company_order'] },
]

export default async function ReimprimirHubPage() {
  const context = await requireReadyStaff()
  if (context.locked) return null
  const reachable = OPTIONS.filter((option) => mayReach(context, option.commands))
  if (reachable.length === 0) return <BlockedNotice />

  return (
    <section className="flex max-w-xl flex-col gap-4">
      <StaffBreadcrumb label={text.routeLabel} crumbs={[{ label: text.reimprimirTitle }]} />
      <h1 className="text-xl font-semibold">{text.reimprimirTitle}</h1>
      <p className="text-muted-foreground">{text.reimprimirHint}</p>
      <ul className="flex flex-col gap-2">
        {reachable.map((option) => (
          <li key={option.tipo}>
            <Link
              href={`/documentos/reimprimir/${option.tipo}`}
              className="inline-flex h-10 items-center font-semibold text-primary underline-offset-2 hover:underline"
            >
              {kinds[option.tipo]}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
