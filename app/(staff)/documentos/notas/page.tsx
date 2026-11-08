import Link from 'next/link'
import { BlockedNotice } from '@/components/shared/BlockedNotice'
import { StaffBreadcrumb } from '@/components/shared/StaffBreadcrumb'
import { mayReach } from '@/lib/server/guard'
import { requireReadyStaff } from '@/lib/server/session/require'
import { strings } from '@/lib/strings'

const text = strings.pendingReview.hubs
const { kinds } = strings.pendingReview.fiscal

export default async function NotasHubPage() {
  const context = await requireReadyStaff()
  if (context.locked) return null
  const canCredit = mayReach(context, ['note.credit'])
  const canDebit = mayReach(context, ['note.debit'])
  if (!canCredit && !canDebit) return <BlockedNotice />

  return (
    <section className="flex max-w-xl flex-col gap-4">
      <StaffBreadcrumb label={text.routeLabel} crumbs={[{ label: text.notasTitle }]} />
      <h1 className="text-xl font-semibold">{text.notasTitle}</h1>
      <p className="text-muted-foreground">{text.notasHint}</p>
      <ul className="flex flex-col gap-2">
        {canCredit ? (
          <li>
            <Link
              href="/documentos/nota/credito"
              className="inline-flex h-10 items-center font-semibold text-primary underline-offset-2 hover:underline"
            >
              {kinds['nota-credito']}
            </Link>
          </li>
        ) : null}
        {canDebit ? (
          <li>
            <Link
              href="/documentos/nota/debito"
              className="inline-flex h-10 items-center font-semibold text-primary underline-offset-2 hover:underline"
            >
              {kinds['nota-debito']}
            </Link>
          </li>
        ) : null}
      </ul>
    </section>
  )
}
