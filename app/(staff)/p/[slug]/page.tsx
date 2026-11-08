import { notFound, redirect } from 'next/navigation'
import { BlockedNotice } from '@/components/shared/BlockedNotice'
import { StatusChip } from '@/components/shared/StatusChip'
import { findMenuItem, toSlug } from '@/lib/config/menu'
import { guardRoute } from '@/lib/server/guard'
import { requireReadyStaff } from '@/lib/server/session/require'
import { strings } from '@/lib/strings'
import { REGISTRY_COMMAND } from '@/types/office/office.types'

const UNKNOWN_COLUMNS = new Set([
  toSlug('Cobros Cashea'),
  toSlug('Relación de referidos'),
  toSlug('Generar relación de paciente'),
  toSlug('Re-imprimir retenciones'),
])

const DESTINATIONS: Readonly<Record<string, string>> = {
  [toSlug('Agregar abono')]: '/pagos/abono',
  [toSlug('Registro de pagos')]: '/pagos/registro',
  [toSlug('Cierre de caja')]: '/pagos/cierre',
  [toSlug('Cierre mensual')]: '/pagos/cierre-mensual',
  [toSlug('Asignar Control N°')]: '/documentos/control',
  [toSlug('Notas')]: '/documentos/notas',
  [toSlug('Nota de crédito')]: '/documentos/nota/credito',
  [toSlug('Nota de débito')]: '/documentos/nota/debito',
  [toSlug('Reimprimir')]: '/documentos/reimprimir',
  [toSlug('Re-imprimir factura')]: '/documentos/reimprimir/factura',
  [toSlug('Re-imprimir nota de crédito')]: '/documentos/reimprimir/nota-credito',
  [toSlug('Re-imprimir nota de débito')]: '/documentos/reimprimir/nota-debito',
  [toSlug('Re-imprimir orden de entrega')]: '/documentos/reimprimir/orden-entrega',
  [toSlug('Re-imprimir orden empresa')]: '/documentos/reimprimir/orden-empresa',
  [toSlug('Precios')]: '/precios',
  [toSlug('Lista de precios')]: '/precios',
  [toSlug('Precio exámenes')]: '/precios?tab=editar',
  [toSlug('Aplicar aumento general')]: '/precios?tab=aumento',
  [toSlug('Bacteriología')]: '/registros/bacteriologia',
  [toSlug('Registro de parásitos')]: '/registros/bacteriologia?tab=parasites',
  [toSlug('Registro de antibióticos')]: '/registros/bacteriologia?tab=antibiotics',
  [toSlug('Registro de microorganismo')]: '/registros/bacteriologia?tab=organisms',
  [toSlug('Registro de muestra de bacteriología')]: '/registros/bacteriologia?tab=bacteriology_samples',
  [toSlug('Registro de observaciones de bacteriología')]: '/registros/bacteriologia?tab=bacteriology_observations',
  [toSlug('Usuarios')]: '/usuarios',
  [toSlug('Nuevo usuario')]: '/usuarios',
  [toSlug('Órdenes de compra')]: '/compras',
  [toSlug('Restar inventario')]: '/inventario',
  [toSlug('Cargar resultados')]: '/hoja-de-trabajo',
  [toSlug('Lista de insumos, servicios y otros')]: '/reportes/insumos-servicios-y-otros',
  [toSlug('Lista de salarios de personal')]: '/reportes/salarios-de-personal',
  [toSlug('Lista de costos de reactivos')]: '/reportes/costos-reactivos',
  [toSlug('Lista de paciente por fecha')]: '/reportes/lista-de-pacientes',
  [toSlug('Promedios pacientes/pruebas')]: '/reportes/promedios-pacientes-pruebas',
  [toSlug('Lista de médicos')]: '/registros/physicians',
  [toSlug('Lista de proveedores')]: '/registros/suppliers',
  [toSlug('Lista de reactivos y servicios')]: '/registros/reagents',
  [toSlug('Lista de empresas')]: '/registros/companies',
  [toSlug('Lista de equipos')]: '/registros/equipment',
  [toSlug('Lista de inventario de reactivos')]: '/inventario',
  [toSlug('Lista de pagos realizados')]: '/pagos/registro',
}

const CLIENTES_MENU_REDIRECTS: Readonly<Record<string, string>> = {
  [toSlug('Pacientes')]: '/clientes',
  [toSlug('Clientes')]: '/clientes',
  [toSlug('Modificar pacientes')]: '/clientes',
  [toSlug('Fusionar')]: '/clientes',
  [toSlug('Desactivar')]: '/clientes',
  [toSlug('Eliminar')]: '/clientes',
  [toSlug('Incluir inactivos')]: '/clientes?incluirInactivos=1',
}

export default async function ScreenPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const clientesTarget = CLIENTES_MENU_REDIRECTS[slug]
  if (clientesTarget) redirect(clientesTarget)
  if (slug === toSlug('Hoja de trabajo')) redirect('/hoja-de-trabajo')
  if (slug === toSlug('Ingreso particular')) redirect('/ordenes/nueva?via=particular')
  if (slug === toSlug('Ingreso empresa')) redirect('/ordenes/nueva?via=empresa')
  const screen = DESTINATIONS[slug]
  if (screen) redirect(screen)

  if (slug === toSlug('Trasladar paciente') || slug === toSlug('Reversar relación')) {
    const context = await requireReadyStaff()
    if (context.locked) return null
    const label = slug === toSlug('Trasladar paciente') ? 'Trasladar paciente' : 'Reversar relación'
    return (
      <section className="flex flex-col items-start gap-2">
        <h1 className="text-xl font-semibold">{label}</h1>
        <StatusChip status="BLOQUEADO" />
      </section>
    )
  }
  if (slug === toSlug('Facturar consulta') || slug === toSlug('Generar presupuesto')) {
    const context = await requireReadyStaff()
    if (context.locked) return null
    const command = slug === toSlug('Generar presupuesto') ? 'quote.create' : 'order.open'
    if (!(await guardRoute(context, [command], `/p/${slug}`))) return <BlockedNotice />
    const label = slug === toSlug('Generar presupuesto') ? 'Generar presupuesto' : 'Facturar consulta'
    return (
      <section className="flex flex-col gap-2">
        <h1 className="text-xl font-semibold">{label}</h1>
        <p className="text-muted-foreground">{strings.shell.pending}</p>
      </section>
    )
  }

  const entry = findMenuItem(slug)
  if (!entry) notFound()
  const command = entry.commands[0] ?? ''
  if (command === 'prices.list') redirect('/precios')
  if (command === 'prices.edit') redirect('/precios?tab=editar')
  if (command === 'prices.general_increase') redirect('/precios?tab=aumento')
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
