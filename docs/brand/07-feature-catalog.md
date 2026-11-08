# Feature catalog

**Standard:** [03-documentation-standard.md](03-documentation-standard.md)  
**Patterns:** [04-display-patterns.md](04-display-patterns.md)

Every command below was on the 30 October 2026 shell, toolbar, or menu, or on the result preview. The pattern is how the new application presents it. **Opened** means the session showed the form. **Menu** means only the command name was captured. Fields for menu-only commands stay **Unknown** except for the minimum the pattern already requires.

Actor is a **Design rule** inferred from the job. The vendor publishes the roles and does not publish a permission matrix. [../product/06-access-control.md](../product/06-access-control.md) is the authority. If an actor here differs, that page wins.

## Session and shell

| Command | Where seen | Pattern | Actor | Notes |
|---|---|---|---|---|
| Usuario activo, Tasa BCV, QR, Precio sábado | Shell, opened | Shell | Any signed-in role reads. Who sets each one is in [../product/06-access-control.md](../product/06-access-control.md) | Words Activo and Inactivo. Rate repeated on new totals |
| Ingreso particular | Toolbar and Pacientes | Nueva orden. Its later steps use the patient header card, billing card, and line table | Receptionist | Starts as facturado al paciente |
| Ingreso empresa | Toolbar and Pacientes | Same order | Receptionist | Requires an active convenio and a razón social before Guardar |
| Hoja de trabajo | Toolbar and Hoja de trabajo | Worklist. Row opens the order hub (`/ordenes/{id}`) with breadcrumb back. **Design rule** | Auxiliary, bioanalyst | Form not opened. Five minimum columns. Sole item under Hoja de trabajo y resultados |
| Cargar resultados | Order hub Acciones (and legacy `/p/cargar-resultados` → worklist). Not a flyout or primary action. **Design rule** | Result grid | Bioanalyst. Auxiliary before release | Form not opened. Grid shape comes from the preview |
| Presupuesto | Demoted from primary until the quote flow is a real destination. Legacy slug stays pending. **Design rule** | Billing card + line table | Reception, administration | A quote. It does not allocate Factura N°. Screen not opened |
| Cierre de caja | Toolbar and Administrativo | Fiscal report | Reception, administration | Daily close. Extra fields **Unknown** |
| Clave | Toolbar | Single card: current password, new password | The signed-in user | Screen not opened |
| Cerrar sesión | Toolbar | Returns to sign-in | Any | Writes `session.leave` |
| Salir | Toolbar and several forms | Leaves the current form. Confirm if there are unsaved edits | Any | **Observed** as a command on the invoice, the price list, and the preview |
| Nueva observación, Mostrar, Ocultar, Buscar | Home panel. **Design rule:** Agregar opens an inline composer; list filters by date; author may retract own note the same lab day. Fields: date, author, text | Line table on `/` | Any (`observation.use`) | Distinct from section OBSERVACIONES on a result. Holds no patient linkage |

Sign-in itself was not captured. **Design rule:** the sign-in screen is the full lockup, Usuario, Clave, and Entrar.

## Clients

Evidence for the October commands: [../session/pacientes.md](../session/pacientes.md). The master, the four order steps, and the portal are **design rules** in [../product/02-client-flow.md](../product/02-client-flow.md).

| Command | Capture | Pattern | Actor | Write |
|---|---|---|---|---|
| Pacientes (Clientes) | Not a separate October form. The invoice typed the person | List on `/clientes`, then ficha on `/clientes/{id}` with tabs Ficha, Contacto, Acciones. The Pacientes menu item opens this screen directly. **Design rule** | Receptionist, administration | `patient.save`. Nombre and Fecha de nac. required. C.I. may be empty, then Sin verificar |
| Incluir inactivos | Design rule | Checkbox on the Clientes list (not a menu item) | Reception, administration | Shows deactivated clients. Hides soft-deleted ones |
| Fusionar | Design rule | Acciones tab on the client ficha. Confirm that retypes the surviving name, with a password re-entry | Administration | Moves orders. Soft-deletes the source |
| Desactivar | Design rule | Acciones tab on the client ficha | Reception, administration | Hides the client from search and from Nueva orden. Portal still opens |
| Reactivar | Design rule | Acciones tab on the client ficha | Reception, administration | Returns a deactivated client to search and Nueva orden. Soft-deleted stay hidden |
| Corregir cédula | Design rule | Acciones tab on the client ficha | Administration | Password re-entry and motivo. Issued documents keep what they printed |
| Deshacer fusión | Design rule | Acciones tab on the client ficha | Administration | Password re-entry and motivo. Restores orders from the stored map |
| Eliminar | Design rule | Acciones tab confirm | Administration | Refused when an order exists in the last 30 days. Otherwise soft-delete |
| Ingreso particular | Toolbar | Nueva orden, step Cliente, no convenio | Receptionist | Does not create the client by itself |
| Ingreso empresa | Toolbar | Nueva orden, step Cliente, convenio required before Pago | Receptionist | Same |
| Facturar consulta | Invoice opened, blank | Steps Exámenes, Personal, and Pago on that client. Not in the Pacientes flyout until a route exists | Receptionist | Order, lines, payments. Sin verificar needs the billing party’s complete cédula at Pago |
| Modificar pacientes | Design rule | Same as opening a row on Clientes and editing Ficha / Contacto. Old `/p/modificar-pacientes` redirects to `/clientes` | Receptionist, administration | `patient.save`. Open orders show the new name. Issued reports keep the printed name |
| Trasladar paciente | Design rule | Blocked until a capture names the destination **Unknown**. Not in the Pacientes flyout | None | Does not offer invented destinations |

Invoice actions **observed** on the form: Nuevo, Guardar, Cancelar, Salir. Nuevo clears the order form and does not invent a birth date. Cancelar discards unsaved order edits and leaves the client and the last saved order stored.

Nueva orden steps, all **design rule**: Cliente, Exámenes, Personal (Médico optional), Pago.

## Work and results

Evidence: [../session/hoja-de-trabajo.md](../session/hoja-de-trabajo.md), [../session/print-preview.md](../session/print-preview.md).

| Command | Capture | Pattern | Actor |
|---|---|---|---|
| Imprimir por paciente | Order hub Acciones → reporte. Not in the Hoja flyout. **Design rule** | Issued report, all sections that have rows | Bioanalyst. Reception after release |
| Imprimir prueba individual | Same path as above. Not in the Hoja flyout. **Design rule** | Issued report, one analyte and its heading | Bioanalyst. Reception after release |
| Status de impresión | Chip on the worklist only. Not a menu place. **Design rule** | Chip on the worklist: Sin imprimir, Impreso. Values of the current program are **Unknown**. These two words are a **Design rule** | Auxiliary, bioanalyst. Reception reads |
| Imprimir referidos | Hidden from flyout until columns exist. Legacy slug stays. **Design rule** | Fiscal report. Columns **Unknown** | Reception, administration |
| Release (no menu item is named Validar) | Gap in the session | Action Liberar on the result grid, sets `LIBERADO` and Procesado por | Bioanalyst |

**Design rule.** Liberar is visible on the result grid because the vendor’s path includes validation and the captured menus do not name a Validar command. It is not described as a hidden current-program button.

## Billing and cash

Evidence: [../session/administrativo.md](../session/administrativo.md), [../session/facturacion.md](../session/facturacion.md).

| Command | Pattern | Actor | Rule |
|---|---|---|---|
| Notas | Hub at `/documentos/notas` choosing crédito or débito. **Design rule** | Administration | Replaces two sibling flyout rows |
| Nota de crédito | Line table against one factura, from the Notas hub | Administration | Allocates a new note |
| Nota de débito | Line table against one factura, from the Notas hub | Administration | Allocates a new note |
| Reimprimir | Hub at `/documentos/reimprimir` with document type. **Design rule** | Reception, administration | Replaces six sibling flyout rows |
| Re-imprimir factura | Issued copy of the stored factura, watermark `COPIA`, from the Reimprimir hub | Receptionist, administration | New number is not allocated |
| Re-imprimir nota de crédito | Copy, from the Reimprimir hub | Administration | Same |
| Re-imprimir nota de débito | Copy, from the Reimprimir hub | Administration | Same |
| Re-imprimir retenciones | Hidden until columns known. Legacy slug stays. **Design rule** | Administration | Same |
| Re-imprimir orden de entrega | Copy of the order, from the Reimprimir hub | Reception, administration | Same |
| Re-imprimir orden empresa | Copy of the company order, from the Reimprimir hub | Reception, administration | Same |
| Cobros Cashea | Off the Administrativo flyout until fields are known. Fiscal report plus a payment capture whose fields are **Unknown**. **Design rule** | Administration | Not a box on the blank invoice |
| Reversar relación | Off the flyout. Blocked page via legacy slug until a capture shows what a “relación” is (**Unknown**). **Design rule** | Administration | Writes a reversal event and does not delete the original |
| Agregar abono | Amount against one factura; also on order hub Acciones | Reception, administration | Updates Abono and Resta |
| Registro de pagos | Registry table of payments. Columns beyond the invoice instruments are **Unknown** | Administration | — |
| Cierre de caja | Fiscal report | Reception, administration | Session day, this user. Another user's drawer: administration only |
| Cierre mensual | Fiscal report | Administration | Does not run the daily close |
| Generar presupuesto | Quote, invoice pattern without a factura number | Reception, administration | — |
| Relación de referidos | Fiscal report. Columns **Unknown** | Administration | — |
| Generar relación de paciente | Fiscal report. Title stays the visible words | Administration | Label was cut off |
| Cuentas por cobrar | Fiscal report. Flyout not opened | Administration | — |
| Cuentas por pagar | Fiscal report | Administration | — |
| Tipos de retenciones (ISLR) | Registry table of types. Columns **Unknown** | Administration | — |
| Órdenes de compra | Line table. Item fields **Unknown** beyond “a purchase order exists” | Administration | Reportes repeats a list of them |
| Restar inventario | A quantity against one reagent. Reagent columns **Unknown** | Bioanalyst, administration | Asks for a confirm |

Payment instruments on the open invoice use the payment line table: Efectivo USD, Zelle, Efectivo Bs, T. débito, T. crédito, Pago móvil, Transferencia, plus Banco and Referencia.

## Masters

Evidence: [../session/registros.md](../session/registros.md). All menu-only. Pattern: registry table. Actor for edits: administration, except the bacteriology masters, which the bioanalyst edits. Reception reads médicos and empresas because the invoice dropdowns need them.

| Command | Name column |
|---|---|
| Registro de médicos | Nombre |
| Registro de empresas | Razón social, plus Requiere titular as a **Design rule** |
| Registro de proveedores | Nombre |
| Registro de reactivos y servicios | Nombre |
| Registro de equipos | Nombre |
| Bacteriología (hub) | One Registros item opens `/registros/bacteriologia` with tabs for the five masters below. **Design rule** |
| Registro de parásitos | Nombre. Reachable from the Bacteriología hub |
| Registro de antibióticos | Nombre. Reachable from the Bacteriología hub |
| Registro de microorganismo | Nombre. Reachable from the Bacteriología hub |
| Registro de muestra de bacteriología | Nombre. Reachable from the Bacteriología hub |
| Registro de observaciones de bacteriología | Nombre. Reachable from the Bacteriología hub |

Agregar nota de bacteriología, under Mantenimiento, is a different command from Registro de observaciones de bacteriología. In the new application it moves to the result grid, and its actor is the bioanalyst. It opens a note on a bacteriology order. The form was not opened. Pattern: a section observation on the result grid, limited to orders that contain a bacteriology section. If the order has no such section, the action explains that and writes nothing.

## Prices and costs

Evidence: [../session/lista-de-precios.md](../session/lista-de-precios.md), [../session/mantenimiento.md](../session/mantenimiento.md), [../session/estructura-de-costos.md](../session/estructura-de-costos.md).

| Command | Capture | Pattern | Actor |
|---|---|---|---|
| Precios | Design rule | One place (`/precios`) with modes Lista / Editar / Aumento | Reception reads list. Administration edits |
| Lista de precios | Opened; now the Lista mode on Precios | Price matrix | Reception reads. Print via Imprimir lista |
| Precio exámenes | Editar mode on Precios | Price matrix, editable | Administration |
| Aplicar aumento general | Aumento mode on Precios | Password re-entry, with a percent and the price columns it will touch. Preview of the change before write | Administration |
| Precio sábado | Menu, and the shell chip | Shell switch for the whole laboratory, plus a calendar | Administration |
| Promedios pacientes/pruebas | Menu | Fiscal report. Formula **Unknown**, so no average is displayed | Administration |
| Insumos, servicios y otros | Menu | Fiscal report. Columns **Unknown** | Administration |
| Salarios de personal | Menu | Fiscal report. Columns **Unknown**. This is cost accounting, not the user directory | Administration |
| Costos reactivos | Menu | Fiscal report. Columns **Unknown** | Administration |
| Lista de insumos, servicios y otros | Alias removed; same `costs.supplies`. Legacy slug redirects. **Design rule** | Fiscal report | Administration |
| Lista de salarios de personal | Alias removed; same `costs.salaries`. **Design rule** | Fiscal report | Administration |
| Lista de costos de reactivos | Alias removed; same `costs.reagents`. **Design rule** | Fiscal report | Administration |

Cancelar and Salir on the price list leave prices unchanged.

## Reports

Evidence: [../session/reportes.md](../session/reportes.md). Pattern for all of these is the fiscal report, except Lista de precios. Actor: administration, with these additions. Reception and the bioanalyst may open the patient, physician, company, and price lists. The bioanalyst may also read the supplier, reagent, inventory, and equipment lists. Evolución de pacientes belongs to the bioanalyst. Estadísticas belongs to the bioanalyst, and administration sees aggregates only.

| Command | Flyout or note |
|---|---|
| Lista de pacientes | On Reportes flyout. General. Por nombre o cédula |
| Lista de paciente por fecha | Same `report.patients` as Lista de pacientes; removed from flyout. Legacy redirects. **Design rule** |
| Lista de médicos | Off Reportes until Exportar exists on Registro de médicos. Legacy redirects to the registry. **Design rule** |
| Lista de proveedores | Same: registry export, not a Reportes stub. **Design rule** |
| Lista de reactivos y servicios | Same. **Design rule** |
| Lista de inventario de reactivos | Same → inventario. **Design rule** |
| Lista de empresas | Same. **Design rule** |
| Lista de ventas | Hidden until columns ship. Legacy slug stays. **Design rule** |
| Lista de compras | Hidden until columns ship. **Design rule** |
| Lista de retenciones | Hidden until columns ship. **Design rule** |
| Lista de pagos realizados | Redirects to Registro de pagos. **Design rule** |
| Lista de cuentas por pagar | Hidden until columns ship. **Design rule** |
| Lista de cuentas por cobrar | Hidden until columns ship. **Design rule** |
| Lista de equipos | Registry export path. **Design rule** |
| Lista de presupuestos | Hidden until columns ship. **Design rule** |
| Evolución de pacientes | Hidden until columns ship. **Design rule** |
| Estadísticas | On Reportes flyout |

The ISLR command offers Descargar XML. The other fiscal commands offer Imprimir. Libro de ventas, Resumen de IGTF, ARCV, the ISLR XML, and Retenciones del IVA are Venezuelan fiscal outputs. Their column layouts are **Unknown**.

## Delivery and authenticity

Evidence: [../session/print-preview.md](../session/print-preview.md), [../session/mantenimiento.md](../session/mantenimiento.md).

| Command | Pattern | Actor | Write |
|---|---|---|---|
| Generar PDF | Action on the issued-report preview | Bioanalyst. Reception after release | Stores the file on the order |
| Enviar WhatsApp | Action on the preview | Reception or bioanalyst, after release | Destination, time, operator, mode. A portal link, or an attachment with recorded consent. Provider **Unknown** |
| Enviar correo | Action on the preview | Reception or bioanalyst, after release | Uses Email from the visit. A portal link, or an attachment with recorded consent. Provider **Unknown** |
| QR | Maintenance command and shell chip | Administration | Laboratory-wide. Off removes the code |
| Verification page | The page the QR opens | The holder of the paper | Order number, laboratory name, report date, release state, and whether the issue was replaced. Says that it doesn’t confirm printed values |
| Ingresar | Design rule. Not the October shell | Cédula type and number and Fecha de nac., then a one-time code to the phone on file. No password | The client | `portal.login` or `portal.login.failed`. One generic error |
| Mis visitas | Design rule | List: Todos, Con resultado, Pendientes | The client | A Pendiente row hides the result grid |
| Descargar informe | Design rule | Issued report when Liberado, or the released sections of a partial order, labeled partial | The client | `portal.download`. No new clinical result |

## Maintenance of the system

Evidence: [../session/mantenimiento.md](../session/mantenimiento.md).

| Command | Pattern | Actor | Rule |
|---|---|---|---|
| Crear perfiles | Registry of panels. A profile’s member exams are **Unknown** | Bioanalyst, administration | The reading “panel of exams” stays a reading. The screen does not invent members |
| Modificar valores | Off the Mantenimiento flyout until captured. Legacy slug shows the blocked panel. **Design rule** | — | Writes nothing. See [06-edge-cases.md](06-edge-cases.md) |
| Registro de correo | Single card. Fields **Unknown** beyond “the account Enviar correo uses” | Administration | — |
| Usuarios | Mantenimiento opens `/usuarios` (list → create/edit; label Usuarios, not Nuevo usuario). Registry table: display name, role, Activo. **Design rule** | Administration | Roles are those in [../product/06-access-control.md](../product/06-access-control.md). A person may hold several |
| Respaldo de la BD | Password re-entry | Administration | `backup.run`. Path and engine **Unknown** |
| Auditoría | Fiscal report. Columns in [../product/09-audit-log.md](../product/09-audit-log.md). The current program's are **Unknown** | Administration, with clinical text masked. Bioanalyst, clinical events | Must be able to list every event |

## Home-to-paper path

The patterns connect in this order for a visit. Steps the session did not open stay on the menu commands above.

1. Shell shows the user, the rate, QR, and Saturday price.
2. Clientes finds the person or creates one. Nombre and Fecha de nac. are required. A missing cédula is Sin verificar.
3. Ingreso particular or Ingreso empresa opens Nueva orden at Cliente with that person. Empresa requires a convenio before Pago.
4. Exámenes, optional Médico, then Pago. Sin verificar needs the billing party’s complete cédula at Pago. Guardar assigns N° orden and Factura N°, and leaves Control N° as a number or `Pendiente`.
5. Hoja de trabajo lists the order. A row opens the order hub; Acciones opens Cargar resultados.
6. Cargar resultados fills the result grid. Empty sections stay off the grid.
7. Liberar, per section, sets that section `LIBERADO` and Procesado por. The order is `LIBERADO` once every section is.
8. The issued report shows the lockup, the header, the grid, and the QR when Activo.
9. Generar PDF, Enviar WhatsApp, or Enviar correo records the output. The client can also open Ingresar and Mis visitas. The result grid there waits for Liberar.
10. Cierre de caja and the libros read the invoice. They do not change the result.
