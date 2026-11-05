import { notFound, redirect } from 'next/navigation'
import { BlockedNotice } from '@/components/shared/BlockedNotice'
import { StatusChip } from '@/components/shared/StatusChip'
import { findMenuItem, toSlug } from '@/lib/config/menu'
import { guardRoute } from '@/lib/server/guard'
import { requireReadyStaff } from '@/lib/server/session/require'
import { strings } from '@/lib/strings'
import { REGISTRY_COMMAND } from '@/types/office/office.types'

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
  const command = entry.commands[0] ?? ''
  if (command === 'prices.list') redirect('/precios')
  if (command === 'prices.edit') redirect('/precios/editar')
  if (command === 'prices.general_increase') redirect('/precios/aumento')
  if (command === 'setting.saturday.change') redirect('/mantenimiento/sabado')
  if (command === 'setting.qr.change') redirect('/mantenimiento/qr')
  if (command === 'purchase.orders') redirect('/compras')
  if (command === 'inventory.deduct') redirect('/inventario')
  if (command === 'user.create') redirect('/usuarios')
  if (command === 'mail.config') redirect('/correo')
  if (command === 'backup.run') redirect('/respaldo')
  if (entry.commands.includes('audit.read_all') || entry.commands.includes('audit.read_clinical')) redirect('/auditoria')
  if (command.startsWith('report.') || command.startsWith('costs.')) redirect(`/reportes/${slug}`)
  const registryKind = Object.entries(REGISTRY_COMMAND).find(([, value]) => value === command)?.[0]
  if (registryKind) redirect(`/registros/${registryKind}`)

  const context = await requireReadyStaff()
  if (context.locked) return null
  if (entry.commands.includes('values.modify')) {
    return (
      <section className="flex flex-col items-start gap-2">
        <h1 className="text-xl font-semibold">{entry.label}</h1>
        <p>{strings.pendingReview.office.modifyValues}</p>
      </section>
    )
  }
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
