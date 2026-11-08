# Access rule reference

**Rule page:** [06-access-control.md](06-access-control.md)

This page holds the detail behind the permission matrix: how a decision reads the table, and each row's command names and conditions. Who holds each right, and with which gesture, is only on the rule page. Everything here is a **design rule**, and no application implements it yet.

## How a decision reads the table

1. **Session.** The account is active, the session is valid, and the person holds at least one known role. Staff roles can combine. A client, public, or system role stands alone.
2. **Command.** A command in no row is refused with `UNKNOWN_COMMAND`.
3. **Role.** If no role the person holds appears on any row of the command, the answer is `ROLE`, or `BLOCKED` when the command has a blocked row. This comes first, so a refusal does not depend on facts about a record the person cannot use.
4. **Row.** The command's rows are read in the order listed below, and the first row whose conditions match applies. A condition on a missing fact refuses with `STATE`, as does no match. A blocked row refuses with `BLOCKED`.
5. **Grant.** If the row gives none of the person's roles a grant, the answer is `OWNERSHIP` when the row depends on `$own`, and `STATE` otherwise. Each role's grant is then checked for its own conditions, for a read-only grant on an action (`ROLE`), and for its relation (`OWNERSHIP`). If all fail, the reason is the furthest check reached, in the order `ROLE`, `STATE`, `OWNERSHIP`.
6. **Gesture.** With several roles, the lightest gesture applies, and among equal gestures the grant without a motivo. A password re-entry also satisfies a confirm. The action runs only when every required gesture has been presented. Otherwise the answer names what is missing: `STEP_UP`, `CONFIRM`, or `MOTIVO_REQUIRED`.

## What the server must supply

- **The person** comes from the server session, never from the request.
- **Facts** come from the database. A fact must be a real true or false, so `1` does not count as true. A blank motivo counts as no motivo.
- **`$own`** is worked out by the server, by comparing the record's owner with the person. A request cannot set it.
- **Relation** means the record's owner is the person (`own`), the record's client is in the portal session (`client`), or the token matches (`token`).
- **Password re-entry and confirm** count only after the server has verified them.

`delivery_mode_allowed` is worked out by the server: true for a portal link, and for an attachment with recorded consent.

## What a scope requires

| Scope | The answer must be limited to |
|---|---|
| `status_only` | Worklist status, with no values |
| `clinical_text_masked` | Audit rows with clinical before-and-after text, and the motivo on clinical events, masked |
| `aggregates_only` | Totals, with small groups suppressed |
| `released_sections_labeled_partial` | Released sections only, labeled partial |
| `date_and_number_until_released` | Date and order number, with no exam names, until release |

## Rows

Order matters, because the first matching row applies. A row with no grant in the matrix refuses everyone. IDs are not always consecutive. R-034 was added later, so it sits with the other Anular orden rows.

| ID | Row | Commands | Applies when | Conditions on a role |
|---|---|---|---|---|
| R-001 | Entrar, Cerrar sesión, Salir, Clave | `session.enter`, `session.leave`, `form.exit`, `password.change` | Always |  |
| R-002 | View Tasa BCV, QR, Precio sábado | `shell.view` | Always |  |
| R-003 | Set Tasa BCV | `rate.set` | Always | Recepción: `rate_today_exists` is false |
| R-004 | Switch QR, Precio sábado | `setting.qr.change`, `setting.saturday.change` | Always |  |
| R-005 | Nueva observación, Mostrar, Ocultar, Buscar | `observation.use` | Always |  |
| R-010 | Clientes: search, read | `client.read` | Always | Auxiliar: `on_worklist` is true |
| R-011 | Change cédula through Modificar after an order exists | `client.update` | `cedula_changed` is true, `has_order` is true |  |
| R-012 | Change Fecha de nac. or sex after a result | `client.update` | `dob_or_sex_changed` is true, `has_result` is true |  |
| R-013 | Change phone or email after Liberar | `client.update` | `contact_changed` is true, `has_released_result` is true |  |
| R-014 | Create client, Modificar pacientes | `client.create`, `client.update` | Always |  |
| R-015 | Corregir cédula after an order exists | `client.cedula.correct` | `has_order` is true |  |
| R-016 | Incluir inactivos | `client.include_inactive` | Always |  |
| R-017 | Desactivar, Reactivar | `client.deactivate`, `client.reactivate` | Always |  |
| R-018 | Eliminar | `client.delete` | `order_last_30_days` is false |  |
| R-019 | Request Fusionar | `client.merge.request` | Always |  |
| R-020 | Fusionar | `client.merge` | `both_complete_and_different` is false |  |
| R-021 | Deshacer fusión | `client.unmerge` | Always |  |
| R-022 | Trasladar paciente | `client.transfer` | Blocked |  |
| R-023 | Ingreso particular, Ingreso empresa, Facturar consulta | `order.open`, `order.save` | Always |  |
| R-024 | Discount | `order.discount` | `within_limit` is true |  |
| R-025 | Discount above the limit | `order.discount` | `within_limit` is false |  |
| R-026 | Price column other than the default | `order.price_column.override` | Always |  |
| R-027 | Add exam line | `order.line.add` | Always |  |
| R-028 | Remove line, no results | `order.line.remove` | `has_result` is false |  |
| R-029 | Remove line, result exists | `order.line.remove` | `has_result` is true |  |
| R-030 | Anular orden: result released | `order.void` | `has_released_result` is true |  |
| R-031 | Anular orden: payment exists | `order.void` | `has_payment` is true |  |
| R-032 | Anular orden: no payment, no result | `order.void` | `has_result` is false |  |
| R-034 | Anular orden: unreleased results, no payment | `order.void` | `has_result` is true |  |
| R-033 | Presupuesto, Generar presupuesto | `quote.create` | Always |  |
| R-040 | Hoja de trabajo | `worklist.read` | Always | Recepción: scope `status_only` |
| R-041 | Status de impresión | `print_status.use` | Always |  |
| R-042 | Cargar resultados: empty or own typed cell | `result.enter` | `state` is one of `PENDIENTE`, `CARGADO`, `cell_empty_or_own` is true |  |
| R-043 | Overwrite analyzer or another's value | `result.enter` | `state` is one of `PENDIENTE`, `CARGADO`, `cell_empty_or_own` is false |  |
| R-044 | Read grid before release | `result.read` | `state` is one of `PENDIENTE`, `CARGADO`, `EN_CORRECCION` |  |
| R-045 | Read grid after release | `result.read` | `state` is `LIBERADO` |  |
| R-046 | Liberar | `result.release` | `state` is `CARGADO` |  |
| R-047 | Liberar corrección: open | `result.correct.open` | `state` is `LIBERADO` |  |
| R-048 | Edit or cancel an open correction | `result.correct.edit`, `result.correct.cancel` | `state` is `EN_CORRECCION` |  |
| R-049 | Liberar corrección: release | `result.correct.release` | `state` is `EN_CORRECCION` |  |
| R-050 | Agregar nota de bacteriología | `bacteriology.note.add` | `order_has_bacteriology` is true |  |
| R-051 | Imprimir por paciente, Imprimir prueba individual | `report.print.patient`, `report.print.single` | Always | Recepción: `state` is `LIBERADO` |
| R-052 | Imprimir referidos | `report.print.referrals` | Always |  |
| R-060 | Record payment, Agregar abono | `payment.record`, `payment.abono` | Always |  |
| R-061 | Reverse payment | `payment.reverse` | Always | Recepción: `same_day` is true, relation `own` |
| R-062 | Cierre de caja: own | `cash.close` | `$own` is true |  |
| R-063 | Cierre de caja: another user's | `cash.close` | `$own` is false |  |
| R-064 | Reopen a close | `cash.reopen` | Always |  |
| R-065 | Cierre mensual | `month.close` | Always |  |
| R-066 | Nota de crédito, Nota de débito | `note.credit`, `note.debit` | Always |  |
| R-067 | Reversar relación | `relation.reverse` | Blocked |  |
| R-068 | Re-imprimir factura | `reprint.invoice` | Always |  |
| R-069 | Re-imprimir orden de entrega, orden empresa | `reprint.delivery_order`, `reprint.company_order` | Always |  |
| R-070 | Re-imprimir notas, retenciones | `reprint.notes`, `reprint.retentions` | Always |  |
| R-071 | Assign Control N° | `control.assign` | Always |  |
| R-072 | Registro de pagos | `payments.registry` | Always | Recepción: relation `own` |
| R-073 | Cobros Cashea, Cuentas por cobrar, Cuentas por pagar | `cashea.collect`, `receivables.use`, `payables.use` | Always |  |
| R-074 | Relación de referidos, Generar relación de paciente | `relation.referrals`, `relation.patient` | Always |  |
| R-075 | Tipos de retenciones, Órdenes de compra | `retention.types`, `purchase.orders` | Always |  |
| R-076 | Restar inventario | `inventory.deduct` | Always |  |
| R-080 | Registro de médicos, empresas | `registry.physicians`, `registry.companies` | Always |  |
| R-081 | Registro de proveedores | `registry.suppliers` | Always |  |
| R-082 | Registro de reactivos y servicios, equipos | `registry.reagents`, `registry.equipment` | Always |  |
| R-083 | Parásitos, antibióticos, microorganismo, muestra and observaciones de bacteriología | `registry.parasites`, `registry.antibiotics`, `registry.organisms`, `registry.bacteriology_samples`, `registry.bacteriology_observations` | Always |  |
| R-084 | Crear perfiles | `profiles.create` | Always |  |
| R-085 | Lista de precios | `prices.list` | Always |  |
| R-086 | Precio exámenes | `prices.edit` | Always |  |
| R-087 | Aplicar aumento general | `prices.general_increase` | Always |  |
| R-088 | Insumos, servicios y otros, Costos reactivos, Promedios pacientes/pruebas, and their Lista reports | `costs.supplies`, `costs.reagents`, `costs.averages` | Always |  |
| R-089 | Salarios de personal, Lista de salarios | `costs.salaries` | Always |  |
| R-090 | Modificar valores | `values.modify` | Blocked |  |
| R-100 | Lista de pacientes, Lista de paciente por fecha | `report.patients` | Always |  |
| R-101 | Lista de médicos, empresas | `report.physicians`, `report.companies` | Always |  |
| R-102 | Lista de proveedores, reactivos y servicios, inventario de reactivos, equipos | `report.suppliers`, `report.reagents`, `report.inventory`, `report.equipment` | Always |  |
| R-103 | Lista de ventas, compras, retenciones, pagos realizados, cuentas por pagar, cuentas por cobrar, presupuestos, and their flyouts | `report.sales`, `report.purchases`, `report.retentions`, `report.payments`, `report.payables`, `report.receivables`, `report.quotes` | Always |  |
| R-104 | Evolución de pacientes | `report.patient_evolution` | Always |  |
| R-105 | Estadísticas | `report.statistics` | Always | Administración: scope `aggregates_only` |
| R-110 | Generar PDF, Liberado | `pdf.generate` | `state` is `LIBERADO` |  |
| R-111 | Generar PDF, draft `INCOMPLETO` | `pdf.generate` | `state` is `INCOMPLETO` |  |
| R-112 | Enviar WhatsApp, Enviar correo, Liberado | `delivery.send` | `state` is `LIBERADO`, `delivery_mode_allowed` is true |  |
| R-113 | Approve incomplete send | `delivery.approve_incomplete` | `state` is `INCOMPLETO` |  |
| R-114 | Enviar after that approval | `delivery.send` | `state` is `INCOMPLETO`, `incomplete_approved` is true, `delivery_mode_allowed` is true |  |
| R-115 | Resend after a correction | `delivery.resend` | `state` is `LIBERADO`, `has_resend_task` is true, `delivery_mode_allowed` is true |  |
| R-120 | Nuevo usuario | `user.create` | `grants_bioanalista` is false |  |
| R-121 | Own access: disable self, change own roles, temporary cover, Bioanalista grant | `user.disable`, `user.role.change`, `user.grant.temporary`, `role.grant_bioanalista` | `is_self` is true |  |
| R-122 | Disable or demote the last active administrator | `user.disable`, `user.role.change` | `is_last_admin` is true |  |
| R-123 | Disable another user | `user.disable` | Always |  |
| R-124 | Change another user's roles | `user.role.change` | `grants_bioanalista` is false |  |
| R-125 | Temporary cover | `user.grant.temporary` | `has_end_date` is true, `grants_bioanalista` is false |  |
| R-126 | Grant Bioanalista | `role.grant_bioanalista` | `license_present` is true |  |
| R-127 | Reset another user's Clave | `password.reset` | `is_self` is false |  |
| R-128 | Registro de correo | `mail.config` | Always |  |
| R-129 | Respaldo de la BD | `backup.run` | Always |  |
| R-130 | Auditoría: all events | `audit.read_all` | Always | Administración: scope `clinical_text_masked` |
| R-131 | Auditoría: clinical events | `audit.read_clinical` | Always |  |
| R-140 | Mis visitas, one row | `portal.visit.list` | `state` is one of `ABIERTA`, `INCOMPLETO`, `LIBERADO`, `EN_CORRECCION` | Cliente: relation `client`, scope `date_and_number_until_released` |
| R-141 | Portal grid and Descargar informe, Liberado | `portal.grid.read`, `portal.download` | `state` is `LIBERADO` | Cliente: relation `client` |
| R-142 | Portal grid and Descargar informe, released sections of a partial order | `portal.grid.read`, `portal.download` | `state` is `INCOMPLETO`, `section_released` is true | Cliente: relation `client`, scope `released_sections_labeled_partial` |
| R-143 | Portal Salir | `portal.leave` | Always |  |
| R-144 | Verification page | `verify.read` | `state` is one of `INCOMPLETO`, `LIBERADO`, `EN_CORRECCION` | Público: relation `token` |
| R-149 | Verification: open the original report | `verify.file.read` | `value_check_enabled` is true, `state` is `LIBERADO`, `issue_current` is true, `printed_code_matches` is true, `within_value_check_period` is true | Público: relation `token` |
| R-145 | Analyzer import | `result.import` | `state` is one of `PENDIENTE`, `CARGADO`, `cell_empty_or_equipo` is true |  |
| R-146 | Sender: read the file for one approved delivery and write its result | `delivery.file.read`, `delivery.result.write` | `delivery_approved` is true |  |
| R-147 | Scheduler: Saturday calendar | `setting.saturday.scheduled` | Always |  |
| R-148 | Sender: send a portal sign-in code | `portal.code.send` | `credentials_matched` is true |  |
