import { notFound } from 'next/navigation'
import { BlockedNotice } from '@/components/shared/BlockedNotice'
import { findMenuItem } from '@/lib/config/menu'
import { guardRoute } from '@/lib/server/guard'
import { requireReadyStaff } from '@/lib/server/session/require'
import { strings } from '@/lib/strings'

export default async function ScreenPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const entry = findMenuItem(slug)
  if (!entry) notFound()

  const context = await requireReadyStaff()
  if (context.locked) return null
  if (!(await guardRoute(context, entry.commands, `/p/${slug}`))) return <BlockedNotice />

  return (
    <section className="flex flex-col gap-2">
      <h1 className="text-xl font-semibold">{entry.label}</h1>
      <p className="text-muted-foreground">{strings.shell.pending}</p>
    </section>
  )
}
