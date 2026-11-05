import { notFound, redirect } from 'next/navigation'
import { BlockedNotice } from '@/components/shared/BlockedNotice'
import { StatusChip } from '@/components/shared/StatusChip'
import { findMenuItem, toSlug } from '@/lib/config/menu'
import { guardRoute } from '@/lib/server/guard'
import { requireReadyStaff } from '@/lib/server/session/require'
import { strings } from '@/lib/strings'

// Only menu names were seen, so these invent nothing. The cut-off title stays as captured.
const UNKNOWN_COLUMNS = new Set([
  toSlug('Cobros Cashea'),
  toSlug('Relación de referidos'),
  toSlug('Generar relación de paciente'),
  toSlug('Re-imprimir retenciones'),
])

const DEDICATED_SCREENS: Readonly<Record<string, string>> = {
  [toSlug('Agregar abono')]: '/pagos/abono',
  [toSlug('Registro de pagos')]: '/pagos/registro',
  [toSlug('Cierre de caja')]: '/pagos/cierre',
  [toSlug('Cierre mensual')]: '/pagos/cierre-mensual',
  [toSlug('Asignar Control N°')]: '/documentos/control',
  [toSlug('Nota de crédito')]: '/documentos/nota/credito',
  [toSlug('Nota de débito')]: '/documentos/nota/debito',
  [toSlug('Re-imprimir factura')]: '/documentos/reimprimir/factura',
  [toSlug('Re-imprimir nota de crédito')]: '/documentos/reimprimir/nota-credito',
  [toSlug('Re-imprimir nota de débito')]: '/documentos/reimprimir/nota-debito',
  [toSlug('Re-imprimir orden de entrega')]: '/documentos/reimprimir/orden-entrega',
  [toSlug('Re-imprimir orden empresa')]: '/documentos/reimprimir/orden-empresa',
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
  // Blocked for everyone until a capture says what it does: the title and BLOQUEADO, nothing else.
  if (entry.commands.includes('relation.reverse') || entry.commands.includes('client.transfer')) {
    return (
      <section className="flex flex-col items-start gap-2">
        <h1 className="text-xl font-semibold">{entry.label}</h1>
        <StatusChip status="BLOQUEADO" />
      </section>
    )
  }
  if (!(await guardRoute(context, entry.commands, `/p/${slug}`))) return <BlockedNotice />

  return (
    <section className="flex flex-col gap-2">
      <h1 className="text-xl font-semibold">{entry.label}</h1>
      <p className="text-muted-foreground">
        {UNKNOWN_COLUMNS.has(slug) ? strings.pendingReview.payments.unknownColumns : strings.shell.pending}
      </p>
    </section>
  )
}
