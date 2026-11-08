import type { MenuGroup, MenuItem, PrimaryAction } from '@/types/shell/menu.types'

export function toSlug(label: string): string {
  return label
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function item(label: string, ...commands: string[]): MenuItem {
  return { label, commands, slug: toSlug(label) }
}

/**
 * Staff flyout: only destinations that do a job (Pacientes net idea).
 * Removed aliases and pending/BLOQUEADO rows stay reachable via /p/{slug} redirects.
 */
export const MENU_GROUPS: readonly MenuGroup[] = [
  {
    label: 'Pacientes',
    items: [item('Pacientes', 'client.read')],
  },
  {
    label: 'Hoja de trabajo y resultados',
    items: [item('Hoja de trabajo', 'worklist.read')],
  },
  {
    label: 'Registros',
    items: [
      item('Registro de médicos', 'registry.physicians'),
      item('Registro de empresas', 'registry.companies'),
      item('Registro de proveedores', 'registry.suppliers'),
      item('Registro de reactivos y servicios', 'registry.reagents'),
      item('Registro de equipos', 'registry.equipment'),
      item(
        'Bacteriología',
        'registry.parasites',
        'registry.antibiotics',
        'registry.organisms',
        'registry.bacteriology_samples',
        'registry.bacteriology_observations',
      ),
    ],
  },
  {
    label: 'Administrativo',
    items: [
      item('Notas', 'note.credit', 'note.debit'),
      item(
        'Reimprimir',
        'reprint.invoice',
        'reprint.notes',
        'reprint.delivery_order',
        'reprint.company_order',
      ),
      item('Asignar Control N°', 'control.assign'),
      item('Agregar abono', 'payment.abono'),
      item('Registro de pagos', 'payments.registry'),
      item('Cierre de caja', 'cash.close'),
      item('Cierre mensual', 'month.close'),
      item('Tipos de retenciones (ISLR)', 'retention.types'),
      item('Restar inventario', 'inventory.deduct'),
    ],
  },
  {
    label: 'Estructura de costos',
    items: [
      item('Precios', 'prices.list', 'prices.edit', 'prices.general_increase'),
      item('Precio sábado', 'setting.saturday.change'),
      item('Insumos, servicios y otros', 'costs.supplies'),
      item('Salarios de personal', 'costs.salaries'),
      item('Costos reactivos', 'costs.reagents'),
    ],
  },
  {
    label: 'Reportes',
    items: [
      item('Lista de pacientes', 'report.patients'),
      item('Estadísticas', 'report.statistics'),
    ],
  },
  {
    label: 'Mantenimiento',
    items: [
      item('Crear perfiles', 'profiles.create'),
      item('QR', 'setting.qr.change'),
      item('Registro de correo', 'mail.config'),
      item('Usuarios', 'user.create'),
      item('Respaldo de la BD', 'backup.run'),
      item('Auditoría', 'audit.read_all', 'audit.read_clinical'),
    ],
  },
]

export const PRIMARY_ACTIONS: readonly PrimaryAction[] = [
  { label: 'Ingreso particular', commands: ['order.open'], href: `/p/${toSlug('Ingreso particular')}` },
  { label: 'Ingreso empresa', commands: ['order.open'], href: `/p/${toSlug('Ingreso empresa')}` },
  { label: 'Hoja de trabajo', commands: ['worklist.read'], href: `/p/${toSlug('Hoja de trabajo')}` },
  { label: 'Cierre de caja', commands: ['cash.close'], href: `/p/${toSlug('Cierre de caja')}` },
  { label: 'Clave', commands: ['password.change'], href: '/clave' },
]

/** Labels removed from flyouts but still resolved for bookmarks and tests. */
export const LEGACY_MENU_ITEMS: readonly MenuItem[] = [
  item('Clientes', 'client.read'),
  item('Modificar pacientes', 'client.update'),
  item('Incluir inactivos', 'client.include_inactive'),
  item('Fusionar', 'client.merge'),
  item('Desactivar', 'client.deactivate'),
  item('Eliminar', 'client.delete'),
  item('Trasladar paciente', 'client.transfer'),
  item('Facturar consulta', 'order.open'),
  item('Cargar resultados', 'result.enter'),
  item('Imprimir por paciente', 'report.print.patient'),
  item('Imprimir prueba individual', 'report.print.single'),
  item('Status de impresión', 'print_status.use'),
  item('Imprimir referidos', 'report.print.referrals'),
  item('Registro de parásitos', 'registry.parasites'),
  item('Registro de antibióticos', 'registry.antibiotics'),
  item('Registro de microorganismo', 'registry.organisms'),
  item('Registro de muestra de bacteriología', 'registry.bacteriology_samples'),
  item('Registro de observaciones de bacteriología', 'registry.bacteriology_observations'),
  item('Nota de crédito', 'note.credit'),
  item('Nota de débito', 'note.debit'),
  item('Re-imprimir factura', 'reprint.invoice'),
  item('Re-imprimir nota de crédito', 'reprint.notes'),
  item('Re-imprimir nota de débito', 'reprint.notes'),
  item('Re-imprimir retenciones', 'reprint.retentions'),
  item('Re-imprimir orden de entrega', 'reprint.delivery_order'),
  item('Re-imprimir orden empresa', 'reprint.company_order'),
  item('Cobros Cashea', 'cashea.collect'),
  item('Reversar relación', 'relation.reverse'),
  item('Generar presupuesto', 'quote.create'),
  item('Relación de referidos', 'relation.referrals'),
  item('Generar relación de paciente', 'relation.patient'),
  item('Cuentas por cobrar', 'receivables.use'),
  item('Cuentas por pagar', 'payables.use'),
  item('Órdenes de compra', 'purchase.orders'),
  item('Lista de precios', 'prices.list'),
  item('Precio exámenes', 'prices.edit'),
  item('Aplicar aumento general', 'prices.general_increase'),
  item('Promedios pacientes/pruebas', 'costs.averages'),
  item('Lista de insumos, servicios y otros', 'costs.supplies'),
  item('Lista de salarios de personal', 'costs.salaries'),
  item('Lista de costos de reactivos', 'costs.reagents'),
  item('Lista de paciente por fecha', 'report.patients'),
  item('Lista de médicos', 'report.physicians'),
  item('Lista de proveedores', 'report.suppliers'),
  item('Lista de reactivos y servicios', 'report.reagents'),
  item('Lista de inventario de reactivos', 'report.inventory'),
  item('Lista de empresas', 'report.companies'),
  item('Lista de ventas', 'report.sales'),
  item('Lista de compras', 'report.purchases'),
  item('Lista de retenciones', 'report.retentions'),
  item('Lista de pagos realizados', 'report.payments'),
  item('Lista de cuentas por pagar', 'report.payables'),
  item('Lista de cuentas por cobrar', 'report.receivables'),
  item('Lista de equipos', 'report.equipment'),
  item('Lista de presupuestos', 'report.quotes'),
  item('Evolución de pacientes', 'report.patient_evolution'),
  item('Modificar valores', 'values.modify'),
  item('Nuevo usuario', 'user.create'),
]

export function findMenuItem(slug: string): MenuItem | null {
  for (const group of MENU_GROUPS) {
    const found = group.items.find((entry) => entry.slug === slug)
    if (found) return found
  }
  return LEGACY_MENU_ITEMS.find((entry) => entry.slug === slug) ?? null
}
