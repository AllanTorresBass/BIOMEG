import 'server-only'

import type { Condition, Gesture, Grant, PermissionRow } from '@/types/auth/auth.types'
import type { Grants, RowOptions } from '@/types/auth/table.types'

export const TABLE_VERSION = 5

const T = (fact: string): Condition => ({ fact, is: true })
const F = (fact: string): Condition => ({ fact, is: false })
const IN = (fact: string, ...values: string[]): Condition => ({ fact, oneOf: values })

const grant = (gesture: Gesture, extra: Omit<Grant, 'gesture'> = {}): Grant => ({ gesture, ...extra })
const ok = (extra?: Omit<Grant, 'gesture'>) => grant('NONE', extra)
const confirm = (extra?: Omit<Grant, 'gesture'>) => grant('CONFIRM', extra)
const stepUp = (extra?: Omit<Grant, 'gesture'>) => grant('STEP_UP', extra)
const readOnly = (extra?: Omit<Grant, 'gesture'>) => grant('NONE', { read: true, ...extra })

function row(
  id: string,
  label: string,
  commands: string[],
  when: readonly Condition[] | 'BLOCKED',
  grants: Grants,
  options: RowOptions = {},
): PermissionRow {
  return {
    id,
    label,
    commands,
    when: when === 'BLOCKED' ? [] : when,
    blocked: when === 'BLOCKED',
    kind: options.kind ?? 'action',
    ownDependent: options.ownDependent ?? false,
    grants,
  }
}

const READ = { kind: 'read' } as const
const ALWAYS: readonly Condition[] = []

/**
 * Order matters: the first matching row applies. This is the order of
 * docs/product/07-rule-reference.md, so R-034 sits before R-033 and R-149
 * sits before R-145.
 */
export const PERMISSION_ROWS: readonly PermissionRow[] = [
  // Session and shell
  row('R-001', 'Entrar, Cerrar sesión, Salir, Clave', ['session.enter', 'session.leave', 'form.exit', 'password.change'], ALWAYS, {
    RECEPCION: ok(), AUXILIAR: ok(), BIOANALISTA: ok(), ADMINISTRACION: ok(),
  }),
  row('R-002', 'View Tasa BCV, QR, Precio sábado', ['shell.view'], ALWAYS, {
    RECEPCION: readOnly(), AUXILIAR: readOnly(), BIOANALISTA: readOnly(), ADMINISTRACION: readOnly(),
  }, READ),
  row('R-003', 'Set Tasa BCV', ['rate.set'], ALWAYS, {
    RECEPCION: ok({ when: [F('rate_today_exists')] }), ADMINISTRACION: ok(),
  }),
  row('R-004', 'Switch QR, Precio sábado', ['setting.qr.change', 'setting.saturday.change'], ALWAYS, {
    ADMINISTRACION: confirm(),
  }),
  row('R-005', 'Nueva observación, Mostrar, Ocultar, Buscar', ['observation.use'], ALWAYS, {
    RECEPCION: ok(), AUXILIAR: ok(), BIOANALISTA: ok(), ADMINISTRACION: ok(),
  }),

  // Clients and orders
  row('R-010', 'Clientes: search, read', ['client.read'], ALWAYS, {
    RECEPCION: ok(), AUXILIAR: readOnly({ when: [T('on_worklist')] }), BIOANALISTA: readOnly(), ADMINISTRACION: readOnly(),
  }, READ),
  row('R-011', 'Change cédula through Modificar after an order exists', ['client.update'], [T('cedula_changed'), T('has_order')], {}),
  row('R-012', 'Change Fecha de nac. or sex after a result', ['client.update'], [T('dob_or_sex_changed'), T('has_result')], {
    RECEPCION: confirm(), BIOANALISTA: ok(),
  }),
  row('R-013', 'Change phone or email after Liberar', ['client.update'], [T('contact_changed'), T('has_released_result')], {
    RECEPCION: confirm(),
  }),
  row('R-014', 'Create client, Modificar pacientes', ['client.create', 'client.update'], ALWAYS, {
    RECEPCION: ok(),
  }),
  row('R-015', 'Corregir cédula after an order exists', ['client.cedula.correct'], [T('has_order')], {
    ADMINISTRACION: stepUp({ motivo: true }),
  }),
  row('R-016', 'Incluir inactivos', ['client.include_inactive'], ALWAYS, {
    RECEPCION: ok(), ADMINISTRACION: ok(),
  }),
  row('R-017', 'Desactivar', ['client.deactivate'], ALWAYS, {
    RECEPCION: confirm(), ADMINISTRACION: confirm(),
  }),
  row('R-018', 'Eliminar', ['client.delete'], [F('order_last_30_days')], {
    ADMINISTRACION: confirm(),
  }),
  row('R-019', 'Request Fusionar', ['client.merge.request'], ALWAYS, {
    RECEPCION: ok(),
  }),
  row('R-020', 'Fusionar', ['client.merge'], [F('both_complete_and_different')], {
    ADMINISTRACION: stepUp(),
  }),
  row('R-021', 'Deshacer fusión', ['client.unmerge'], ALWAYS, {
    ADMINISTRACION: stepUp({ motivo: true }),
  }),
  row('R-022', 'Trasladar paciente', ['client.transfer'], 'BLOCKED', {}),
  row('R-023', 'Ingreso particular, Ingreso empresa, Facturar consulta', ['order.open', 'order.save'], ALWAYS, {
    RECEPCION: ok(),
  }),
  row('R-024', 'Discount', ['order.discount'], [T('within_limit')], {
    RECEPCION: ok(), ADMINISTRACION: ok(),
  }),
  row('R-025', 'Discount above the limit', ['order.discount'], [F('within_limit')], {
    ADMINISTRACION: ok({ motivo: true }),
  }),
  row('R-026', 'Price column other than the default', ['order.price_column.override'], ALWAYS, {
    RECEPCION: confirm({ motivo: true }), ADMINISTRACION: ok(),
  }),
  row('R-027', 'Add exam line', ['order.line.add'], ALWAYS, {
    RECEPCION: ok(),
  }),
  row('R-028', 'Remove line, no results', ['order.line.remove'], [F('has_result')], {
    RECEPCION: ok(), ADMINISTRACION: ok(),
  }),
  row('R-029', 'Remove line, result exists', ['order.line.remove'], [T('has_result')], {
    BIOANALISTA: stepUp(),
  }),
  row('R-030', 'Anular orden: result released', ['order.void'], [T('has_released_result')], {}),
  row('R-031', 'Anular orden: payment exists', ['order.void'], [T('has_payment')], {
    ADMINISTRACION: stepUp({ motivo: true }),
  }),
  row('R-032', 'Anular orden: no payment, no result', ['order.void'], [F('has_result')], {
    RECEPCION: confirm({ motivo: true }), ADMINISTRACION: ok({ motivo: true }),
  }),
  row('R-034', 'Anular orden: unreleased results, no payment', ['order.void'], [T('has_result')], {
    ADMINISTRACION: stepUp({ motivo: true }),
  }),
  row('R-033', 'Presupuesto, Generar presupuesto', ['quote.create'], ALWAYS, {
    RECEPCION: ok(), ADMINISTRACION: ok(),
  }),

  // Work and results
  row('R-040', 'Hoja de trabajo', ['worklist.read'], ALWAYS, {
    RECEPCION: ok({ scope: 'status_only' }), AUXILIAR: ok(), BIOANALISTA: ok(),
  }, READ),
  row('R-041', 'Status de impresión', ['print_status.use'], ALWAYS, {
    RECEPCION: readOnly(), AUXILIAR: ok(), BIOANALISTA: ok(),
  }),
  row('R-042', 'Cargar resultados: empty or own typed cell', ['result.enter'], [IN('state', 'PENDIENTE', 'CARGADO'), T('cell_empty_or_own')], {
    AUXILIAR: ok(), BIOANALISTA: ok(),
  }),
  row('R-043', "Overwrite analyzer or another's value", ['result.enter'], [IN('state', 'PENDIENTE', 'CARGADO'), F('cell_empty_or_own')], {
    BIOANALISTA: ok({ motivo: true }),
  }),
  row('R-044', 'Read grid before release', ['result.read'], [IN('state', 'PENDIENTE', 'CARGADO', 'EN_CORRECCION')], {
    AUXILIAR: ok(), BIOANALISTA: ok(),
  }, READ),
  row('R-045', 'Read grid after release', ['result.read'], [IN('state', 'LIBERADO')], {
    RECEPCION: readOnly(), AUXILIAR: readOnly(), BIOANALISTA: readOnly(),
  }, READ),
  row('R-046', 'Liberar', ['result.release'], [IN('state', 'CARGADO')], {
    BIOANALISTA: stepUp(),
  }),
  row('R-047', 'Liberar corrección: open', ['result.correct.open'], [IN('state', 'LIBERADO')], {
    BIOANALISTA: stepUp({ motivo: true }),
  }),
  row('R-048', 'Edit or cancel an open correction', ['result.correct.edit', 'result.correct.cancel'], [IN('state', 'EN_CORRECCION')], {
    BIOANALISTA: ok(),
  }),
  row('R-049', 'Liberar corrección: release', ['result.correct.release'], [IN('state', 'EN_CORRECCION')], {
    BIOANALISTA: stepUp(),
  }),
  row('R-050', 'Agregar nota de bacteriología', ['bacteriology.note.add'], [T('order_has_bacteriology')], {
    BIOANALISTA: ok(),
  }),
  row('R-051', 'Imprimir por paciente, Imprimir prueba individual', ['report.print.patient', 'report.print.single'], ALWAYS, {
    RECEPCION: ok({ when: [IN('state', 'LIBERADO')] }), BIOANALISTA: ok(),
  }),
  row('R-052', 'Imprimir referidos', ['report.print.referrals'], ALWAYS, {
    RECEPCION: ok(), ADMINISTRACION: ok(),
  }),

  // Money
  row('R-060', 'Record payment, Agregar abono', ['payment.record', 'payment.abono'], ALWAYS, {
    RECEPCION: ok(), ADMINISTRACION: ok(),
  }),
  row('R-061', 'Reverse payment', ['payment.reverse'], ALWAYS, {
    RECEPCION: confirm({ motivo: true, when: [T('same_day')], relation: 'own' }),
    ADMINISTRACION: stepUp({ motivo: true }),
  }),
  row('R-062', 'Cierre de caja: own', ['cash.close'], [T('$own')], {
    RECEPCION: ok(), ADMINISTRACION: ok(),
  }, { ownDependent: true }),
  row('R-063', "Cierre de caja: another user's", ['cash.close'], [F('$own')], {
    ADMINISTRACION: stepUp({ motivo: true }),
  }, { ownDependent: true }),
  row('R-064', 'Reopen a close', ['cash.reopen'], ALWAYS, {
    ADMINISTRACION: stepUp({ motivo: true }),
  }),
  row('R-065', 'Cierre mensual', ['month.close'], ALWAYS, {
    ADMINISTRACION: stepUp(),
  }),
  row('R-066', 'Nota de crédito, Nota de débito', ['note.credit', 'note.debit'], ALWAYS, {
    ADMINISTRACION: stepUp(),
  }),
  row('R-067', 'Reversar relación', ['relation.reverse'], 'BLOCKED', {}),
  row('R-068', 'Re-imprimir factura', ['reprint.invoice'], ALWAYS, {
    RECEPCION: ok(), ADMINISTRACION: ok(),
  }),
  row('R-069', 'Re-imprimir orden de entrega, orden empresa', ['reprint.delivery_order', 'reprint.company_order'], ALWAYS, {
    RECEPCION: ok(), ADMINISTRACION: ok(),
  }),
  row('R-070', 'Re-imprimir notas, retenciones', ['reprint.notes', 'reprint.retentions'], ALWAYS, {
    ADMINISTRACION: ok(),
  }),
  // The matrix also names Sistema here, but not which system actor. No system role is granted until a capture says so.
  row('R-071', 'Assign Control N°', ['control.assign'], ALWAYS, {
    ADMINISTRACION: ok(),
  }),
  row('R-072', 'Registro de pagos', ['payments.registry'], ALWAYS, {
    RECEPCION: readOnly({ relation: 'own' }), ADMINISTRACION: ok(),
  }),
  row('R-073', 'Cobros Cashea, Cuentas por cobrar, Cuentas por pagar', ['cashea.collect', 'receivables.use', 'payables.use'], ALWAYS, {
    ADMINISTRACION: ok(),
  }),
  row('R-074', 'Relación de referidos, Generar relación de paciente', ['relation.referrals', 'relation.patient'], ALWAYS, {
    ADMINISTRACION: ok(),
  }),
  row('R-075', 'Tipos de retenciones, Órdenes de compra', ['retention.types', 'purchase.orders'], ALWAYS, {
    ADMINISTRACION: ok(),
  }),
  row('R-076', 'Restar inventario', ['inventory.deduct'], ALWAYS, {
    BIOANALISTA: confirm(), ADMINISTRACION: confirm(),
  }),

  // Masters, prices, and costs
  row('R-080', 'Registro de médicos, empresas', ['registry.physicians', 'registry.companies'], ALWAYS, {
    RECEPCION: readOnly(), BIOANALISTA: readOnly(), ADMINISTRACION: ok(),
  }),
  row('R-081', 'Registro de proveedores', ['registry.suppliers'], ALWAYS, {
    ADMINISTRACION: ok(),
  }),
  row('R-082', 'Registro de reactivos y servicios, equipos', ['registry.reagents', 'registry.equipment'], ALWAYS, {
    AUXILIAR: readOnly(), BIOANALISTA: readOnly(), ADMINISTRACION: ok(),
  }),
  row('R-083', 'Parásitos, antibióticos, microorganismo, muestra and observaciones de bacteriología', [
    'registry.parasites', 'registry.antibiotics', 'registry.organisms', 'registry.bacteriology_samples', 'registry.bacteriology_observations',
  ], ALWAYS, {
    AUXILIAR: readOnly(), BIOANALISTA: ok(), ADMINISTRACION: readOnly(),
  }),
  row('R-084', 'Crear perfiles', ['profiles.create'], ALWAYS, {
    BIOANALISTA: ok(), ADMINISTRACION: ok(),
  }),
  row('R-085', 'Lista de precios', ['prices.list'], ALWAYS, {
    RECEPCION: readOnly(), BIOANALISTA: readOnly(), ADMINISTRACION: readOnly(),
  }, READ),
  row('R-086', 'Precio exámenes', ['prices.edit'], ALWAYS, {
    ADMINISTRACION: confirm(),
  }),
  row('R-087', 'Aplicar aumento general', ['prices.general_increase'], ALWAYS, {
    ADMINISTRACION: stepUp(),
  }),
  row('R-088', 'Insumos, servicios y otros, Costos reactivos, Promedios pacientes/pruebas, and their Lista reports', [
    'costs.supplies', 'costs.reagents', 'costs.averages',
  ], ALWAYS, {
    ADMINISTRACION: ok(),
  }),
  row('R-089', 'Salarios de personal, Lista de salarios', ['costs.salaries'], ALWAYS, {
    ADMINISTRACION: stepUp(),
  }),
  row('R-090', 'Modificar valores', ['values.modify'], 'BLOCKED', {}),

  // Reports
  row('R-100', 'Lista de pacientes, Lista de paciente por fecha', ['report.patients'], ALWAYS, {
    RECEPCION: ok(), BIOANALISTA: ok(), ADMINISTRACION: ok(),
  }, READ),
  row('R-101', 'Lista de médicos, empresas', ['report.physicians', 'report.companies'], ALWAYS, {
    RECEPCION: ok(), BIOANALISTA: ok(), ADMINISTRACION: ok(),
  }, READ),
  row('R-102', 'Lista de proveedores, reactivos y servicios, inventario de reactivos, equipos', [
    'report.suppliers', 'report.reagents', 'report.inventory', 'report.equipment',
  ], ALWAYS, {
    BIOANALISTA: readOnly(), ADMINISTRACION: ok(),
  }, READ),
  row('R-103', 'Lista de ventas, compras, retenciones, pagos realizados, cuentas por pagar, cuentas por cobrar, presupuestos, and their flyouts', [
    'report.sales', 'report.purchases', 'report.retentions', 'report.payments', 'report.payables', 'report.receivables', 'report.quotes',
  ], ALWAYS, {
    ADMINISTRACION: ok(),
  }, READ),
  row('R-104', 'Evolución de pacientes', ['report.patient_evolution'], ALWAYS, {
    BIOANALISTA: ok(),
  }, READ),
  row('R-105', 'Estadísticas', ['report.statistics'], ALWAYS, {
    BIOANALISTA: ok(), ADMINISTRACION: ok({ scope: 'aggregates_only' }),
  }, READ),

  // Delivery
  row('R-110', 'Generar PDF, Liberado', ['pdf.generate'], [IN('state', 'LIBERADO')], {
    RECEPCION: ok(), BIOANALISTA: ok(),
  }),
  row('R-111', 'Generar PDF, draft INCOMPLETO', ['pdf.generate'], [IN('state', 'INCOMPLETO')], {
    BIOANALISTA: ok(),
  }),
  row('R-112', 'Enviar WhatsApp, Enviar correo, Liberado', ['delivery.send'], [IN('state', 'LIBERADO'), T('delivery_mode_allowed')], {
    RECEPCION: confirm(), BIOANALISTA: confirm(),
  }),
  row('R-113', 'Approve incomplete send', ['delivery.approve_incomplete'], [IN('state', 'INCOMPLETO')], {
    BIOANALISTA: stepUp(),
  }),
  row('R-114', 'Enviar after that approval', ['delivery.send'], [IN('state', 'INCOMPLETO'), T('incomplete_approved'), T('delivery_mode_allowed')], {
    RECEPCION: confirm(), BIOANALISTA: confirm(),
  }),
  row('R-115', 'Resend after a correction', ['delivery.resend'], [IN('state', 'LIBERADO'), T('has_resend_task'), T('delivery_mode_allowed')], {
    RECEPCION: confirm(), BIOANALISTA: confirm(),
  }),

  // System maintenance
  row('R-120', 'Nuevo usuario', ['user.create'], [F('grants_bioanalista')], {
    ADMINISTRACION: stepUp(),
  }),
  row('R-121', 'Own access: disable self, change own roles, temporary cover, Bioanalista grant', [
    'user.disable', 'user.role.change', 'user.grant.temporary', 'role.grant_bioanalista',
  ], [T('is_self')], {}),
  row('R-122', 'Disable or demote the last active administrator', ['user.disable', 'user.role.change'], [T('is_last_admin')], {}),
  row('R-123', 'Disable another user', ['user.disable'], ALWAYS, {
    ADMINISTRACION: stepUp(),
  }),
  row('R-124', "Change another user's roles", ['user.role.change'], [F('grants_bioanalista')], {
    ADMINISTRACION: stepUp(),
  }),
  row('R-125', 'Temporary cover', ['user.grant.temporary'], [T('has_end_date'), F('grants_bioanalista')], {
    ADMINISTRACION: stepUp({ motivo: true }),
  }),
  row('R-126', 'Grant Bioanalista', ['role.grant_bioanalista'], [T('license_present')], {
    ADMINISTRACION: stepUp(),
  }),
  row('R-127', "Reset another user's Clave", ['password.reset'], [F('is_self')], {
    ADMINISTRACION: stepUp(),
  }),
  row('R-128', 'Registro de correo', ['mail.config'], ALWAYS, {
    ADMINISTRACION: stepUp(),
  }),
  row('R-129', 'Respaldo de la BD', ['backup.run'], ALWAYS, {
    ADMINISTRACION: stepUp(),
  }),
  row('R-130', 'Auditoría: all events', ['audit.read_all'], ALWAYS, {
    ADMINISTRACION: readOnly({ scope: 'clinical_text_masked' }),
  }, READ),
  row('R-131', 'Auditoría: clinical events', ['audit.read_clinical'], ALWAYS, {
    BIOANALISTA: readOnly(),
  }, READ),

  // Client, public, and system
  row('R-140', 'Mis visitas, one row', ['portal.visit.list'], [IN('state', 'ABIERTA', 'INCOMPLETO', 'LIBERADO', 'EN_CORRECCION')], {
    CLIENTE: readOnly({ relation: 'client', scope: 'date_and_number_until_released' }),
  }, READ),
  row('R-141', 'Portal grid and Descargar informe, Liberado', ['portal.grid.read', 'portal.download'], [IN('state', 'LIBERADO')], {
    CLIENTE: readOnly({ relation: 'client' }),
  }, READ),
  row('R-142', 'Portal grid and Descargar informe, released sections of a partial order', ['portal.grid.read', 'portal.download'], [IN('state', 'INCOMPLETO'), T('section_released')], {
    CLIENTE: readOnly({ relation: 'client', scope: 'released_sections_labeled_partial' }),
  }, READ),
  row('R-143', 'Portal Salir', ['portal.leave'], ALWAYS, {
    CLIENTE: ok(),
  }),
  row('R-144', 'Verification page', ['verify.read'], [IN('state', 'INCOMPLETO', 'LIBERADO', 'EN_CORRECCION')], {
    PUBLICO: readOnly({ relation: 'token' }),
  }, READ),
  row('R-149', 'Verification: open the original report', ['verify.file.read'], [
    T('value_check_enabled'), IN('state', 'LIBERADO'), T('issue_current'), T('printed_code_matches'), T('within_value_check_period'),
  ], {
    PUBLICO: readOnly({ relation: 'token' }),
  }, READ),
  row('R-145', 'Analyzer import', ['result.import'], [IN('state', 'PENDIENTE', 'CARGADO'), T('cell_empty_or_equipo')], {
    SISTEMA_ANALIZADOR: ok(),
  }),
  row('R-146', 'Sender: read the file for one approved delivery and write its result', ['delivery.file.read', 'delivery.result.write'], [T('delivery_approved')], {
    SISTEMA_ENVIADOR: ok(),
  }),
  row('R-147', 'Scheduler: Saturday calendar', ['setting.saturday.scheduled'], ALWAYS, {
    SISTEMA_PROGRAMADOR: ok(),
  }),
  row('R-148', 'Sender: send a portal sign-in code', ['portal.code.send'], [T('credentials_matched')], {
    SISTEMA_ENVIADOR: ok(),
  }),
]
