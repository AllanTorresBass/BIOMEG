import { notFound, redirect } from 'next/navigation'
import { BlockedNotice } from '@/components/shared/BlockedNotice'
import { findMenuItem, toSlug } from '@/lib/config/menu'
import { guardRoute } from '@/lib/server/guard'
import { requireReadyStaff } from '@/lib/server/session/require'
import { strings } from '@/lib/strings'

const DEDICATED_SCREENS: Readonly<Record<string, string>> = {
  [toSlug('Agregar abono')]: '/pagos/abono',
  [toSlug('Registro de pagos')]: '/pagos/registro',
  [toSlug('Cierre de caja')]: '/pagos/cierre',
  [toSlug('Cierre mensual')]: '/pagos/cierre-mensual',
}

export default async function ScreenPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  if (slug === 'clientes') redirect('/clientes')
  if (slug === toSlug('Hoja de trabajo')) redirect('/hoja-de-trabajo')
  if (slug === toSlug('Ingreso particular')) redirect('/ordenes/nueva?via=particular')
  if (slug === toSlug('Ingreso empresa')) redirect('/ordenes/nueva?via=empresa')
  const screen = DEDICATED_SCREENS[slug]
  if (screen) redirect(screen)
  const entry = findMenuItem(slug)
  if (!entry) notFound()

  const context = await requireReadyStaff()
  if (context.locked) return null
  if (!(await guardRoute(context, entry.commands, `/p/${slug}`))) return <BlockedNotice />

  return (
    <section className="flex flex-col gap-2">
      <h1 className="text-xl font-semibold">{entry.label}</h1>
      <p className="text-muted-foreground">
        {slug === toSlug('Cobros Cashea') ? strings.pendingReview.payments.unknownColumns : strings.shell.pending}
      </p>
    </section>
  )
}
