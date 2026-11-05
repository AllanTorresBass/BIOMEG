import { notFound } from 'next/navigation'
import { NoteForm } from '@/components/fiscal/NoteForm'
import { BlockedNotice } from '@/components/shared/BlockedNotice'
import { canIssueNote } from '@/lib/server/queries/fiscal'
import { requireReadyStaff } from '@/lib/server/session/require'
import { strings } from '@/lib/strings'

const KINDS = { credito: 'CREDITO', debito: 'DEBITO' } as const

export default async function NotePage({ params }: { params: Promise<{ tipo: string }> }) {
  const { tipo } = await params
  if (tipo !== 'credito' && tipo !== 'debito') notFound()
  const context = await requireReadyStaff()
  if (context.locked) return null
  const kind = KINDS[tipo]
  if (!(await canIssueNote(context, kind))) return <BlockedNotice />
  const { kinds } = strings.pendingReview.fiscal
  return (
    <section className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">{kind === 'CREDITO' ? kinds['nota-credito'] : kinds['nota-debito']}</h1>
      <NoteForm kind={kind} />
    </section>
  )
}
