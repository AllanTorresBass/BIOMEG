# Stage 5: Money and back office

[Back to the catalog](README.md)

Many of these commands were only seen as menu names. The prompts deliberately build a shell and say so on screen, rather than letting v0 guess a fiscal layout.

## V0-19. Abono, payments, reversal, closes

**Attach:** `product/03-processes.md` (Payments), `brand/06-edge-cases.md` (Abono, Two closes), rows R-060 to R-065, R-072, R-073, E-13, E-47 to E-49.

```text
Build payments after the factura. All through decide().

AGREGAR ABONO (Recepción, Administración). An amount against one factura. Abono increases and Resta decreases. The invoice stays open while Resta isn't zero. Writes payment.record. Money owed never blocks release or the portal.

REGISTRO DE PAGOS. Registry table. Recepción reads only its own rows. Administración reads all. Columns: the invoice instruments and amounts only. Further columns are Unknown.

REVERSE PAYMENT. Recepción: only its own payment from the same day, with a confirm and motivo. Otherwise Administración, with password re-entry and motivo. It writes a reversal row. The original row stays. Writes payment.reverse. Same-user reversals are listed for weekly review.

CIERRE DE CAJA. Own drawer: Recepción, Administración. It closes the session day's payments for that user across all workstations, labeled by workstation. It shows at least Total USD, Total Bs, the rate, and Resta still open, and lists open invoices separately from paid ones. It deletes nothing. Other fields are Unknown. Writes cash.close.
- Another user's drawer: Administración, re-entry and motivo, naming whose drawer.
- Reopen a close: Administración, re-entry and motivo. Writes cash.reopen.
- A payment taken after a close goes to the next open period and keeps its real time.

CIERRE MENSUAL. Administración, re-entry. Does not run the daily close. Writes month.close.

COBROS CASHEA. Administración. Use the Fiscal report pattern and the Unknown-columns sentence. Don't invent how Cashea settles or add a Cashea box to the invoice.
```

**Check:**
- Reverse someone else's payment as Recepción: `OWNERSHIP`.
- Close a drawer and confirm payments remain.

## V0-20. Fiscal notes, reprints, Control N°

**Attach:** `product/03-processes.md` (Fiscal documents), `brand/05-data-display-models.md` (Documents), `brand/06-edge-cases.md` (Control number, Reprint), R-066 to R-071, R-074, R-075.

```text
Build fiscal documents. I can't give you a Venezuelan fiscal layout because none was captured, so do not write one from your own knowledge.

CONTROL N°. Shows a number or Pendiente. While it's pending, issuing a fiscal copy is refused with "Falta el número de control." Assigning it: Administración, or Sistema once a fiscal source exists. Build a manual field for Administración, and writes control.assign. Mark in code that the method depends on a fiscal capture. SIN PRECIO also blocks the fiscal issue.

NOTA DE CRÉDITO, NOTA DE DÉBITO. Administración, password re-entry. Each is a new document, against exactly one factura, using a line table of adjustments, with its own number. The factura isn't changed. Writes note.issue.

RE-IMPRIMIR. Factura, orden de entrega, orden empresa: Recepción, Administración. Notas, retenciones: Administración. Opens the stored document, adds a visible COPIA watermark, allocates no number, and writes document.reprint with the operator and the time. The rate on the document is the stored one.

BLOCKED OR UNKNOWN.
- Reversar relación: blocked for everyone. Title and BLOQUEADO only.
- Tipos de retenciones (ISLR): Registry table with the name only.
- Relación de referidos, Generar relación de paciente: Fiscal report with the Unknown-columns sentence. Keep that cut-off title exactly.

Numbers are never reused, including on a voided order.
```

**Check:**
- A reprint keeps its number and shows `COPIA`.
- Reversar relación is blocked for Administración too.
- No invented SENIAT fields appear.

## V0-21. Prices, rate, Saturday, QR switch

**Attach:** `brand/04-display-patterns.md` (Price matrix), `brand/05-data-display-models.md` (Price and cost type), `session/lista-de-precios.md`, R-002 to R-004, R-085 to R-087, E-51, E-52.

```text
Build prices and laboratory switches.

LISTA DE PRECIOS, an inquiry using the Price matrix. Recepción, Bioanalista, Administración read it. It writes no price. Filters: Columna de precio, Moneda, Categoría, Status (Disponible, No disp., Todos). Columns: Examen, Particular, Aliados, Hospitalizado, Emergencia, Estatal, Status. Full width, sticky header. The header states the currency: "Montos en USD" or "Montos en Bs". One currency at a time. Catalog spelling is kept as stored.
A No disp. row inside a Disponible filter stays visible with the caption "Excepción en el filtro". Add no other status names.
States. Empty: "Sin exámenes en esta categoría." with filters kept. A blank cell: SIN PRECIO, not zero. A stored zero: 0,00. Unknown currency: "Moneda no disponible." and no amounts. Imprimir lista repeats the filter values in the heading, and writes price.print. Cancelar and Salir change nothing.

Do not rename matrix columns to match Tipo de costo.

PRECIO EXÁMENES. Administración, with a confirm. The same matrix, editable. Writes price.change immediately. A price change doesn't rewrite saved invoices.

APLICAR AUMENTO GENERAL. Administración, password re-entry. Shows the percent and the columns it will touch, with a preview of the change, before writing.

TASA BCV. Recepción may set it only when today has no rate. Later changes are Administración's. Writes rate.change. New documents only. Saved documents keep their rate. Open unsaved orders are warned at Guardar. The source of the rate is Unknown, so there's no automatic fetch.

PRECIO SÁBADO. Whole laboratory. On by calendar, through the Sistema: scheduler role, with a manual switch for Administración and a confirm. Writes setting.saturday.change. It shows ACTIVO or INACTIVO. Each priced line records whether it applied. What the Saturday price changes is Unknown, so no formula: show the column value and record the flag.

QR SWITCH. Administración, with a confirm, whole laboratory. Writes setting.qr.change.

Each desk's chip refreshes when a setting changes.
```

**Check:**
- Change the rate and confirm saved orders don't change.
- A blank price shows `SIN PRECIO`, not zero.
- No Saturday formula has been invented.

## V0-22. Registries and inventory

**Attach:** `brand/04-display-patterns.md` (Registry table), `brand/07-feature-catalog.md` (Masters), `session/registros.md`, R-075, R-076, R-080 to R-084.

```text
Build one reusable Registry table, used for these masters. Regions: title using the command's name, search on the name column, sticky header Nombre, Status, Actualizado, rows, primary action Nuevo. A row opens a single-record card with the same fields. Sort by Nombre. Inactive rows are hidden until the Status filter is Todos.

MASTERS. Name column in parentheses. Add no other fields, because they are Unknown:
Registro de médicos (Nombre), empresas (Razón social, plus Requiere titular, a yes or no, because a convenio is a row here), proveedores (Nombre), reactivos y servicios (Nombre), equipos (Nombre), parásitos (Nombre), antibióticos (Nombre), microorganismo (Nombre), muestra de bacteriología (Nombre), observaciones de bacteriología (Nombre).

PERMISSIONS, through decide():
- Médicos, empresas: Administración edits. Recepción and Bioanalista read.
- Proveedores: Administración only.
- Reactivos y servicios, equipos: Administración edits. Auxiliar and Bioanalista read.
- The five bacteriology lists: Bioanalista edits. Auxiliar and Administración read.

STATUS is Activo or Inactivo. A retired row disappears from order dropdowns and stays on old orders. An order stores the id and the printed name, so a rename doesn't rewrite issued reports or saved orders.

STATES. Empty: "Sin registros." and Nuevo. Partial: a row with only a name is valid. Error: duplicate name shows "Ese nombre ya existe." and the existing row is unchanged. No permission: menu item absent, direct route BLOQUEADO. Writes registry.create and registry.update.

Do not seed BC-20 or BS-240 as equipment: those came from an advertisement.

CREAR PERFILES. Bioanalista, Administración. A registry of panels, name only. Member exams are Unknown, so don't invent them.

ÓRDENES DE COMPRA. Administración. A line table with the title and an Unknown note, with no invented item fields.

RESTAR INVENTARIO. Bioanalista, Administración, with a confirm. A quantity against one reagent. Columns beyond name and quantity are Unknown.
```

**Check:**
- Bioanalista edits a bacteriology list, while Recepción can't reach it.
- Renaming a physician leaves old orders alone.

## V0-23. Reports and cost screens

**Attach:** `brand/04-display-patterns.md` (Fiscal and list report), `brand/07-feature-catalog.md` (Prices and costs, Reports), `session/reportes.md`, `session/estructura-de-costos.md`, R-088, R-089, R-100 to R-105.

```text
Build one reusable Fiscal report component. All these commands use it. Do not invent a single column.

REGIONS. Title with the full command path (Lista de ventas / Libro de ventas). Filters only when the command implies them: Desde, Hasta, default the session day, and Empresa or Moneda when relevant. A sticky table. A totals row when known columns are money, plus Tasa BCV if a bolívar figure was converted. Export: Imprimir, and Descargar XML only for the ISLR command.

UNKNOWN COLUMNS. The body is the sentence "Las columnas de este reporte no están capturadas." This applies to every report below, because none of these screens was opened.

STATES. Empty: "Sin movimientos en este rango." Single: one row and a matching totals row. Error: keep the previous rows and show "No se pudo actualizar." No permission: menu item absent. Writes report.view, report.print, report.export.

REPORTS, with exact names and permissions:
- Lista de pacientes (General; Por nombre o cédula), Lista de paciente por fecha: Recepción, Bioanalista, Administración. Export audited.
- Lista de médicos, Lista de empresas: the same three roles.
- Lista de proveedores, reactivos y servicios, inventario de reactivos, equipos: Bioanalista reads, Administración.
- Administración only: Lista de ventas (Resumen de ventas, Detalle de ventas, Libro de ventas, Resumen de IGTF, Ventas por Cashea, Lista de ventas por empresa), Lista de compras (Libro de compras, Órdenes de compra), Lista de retenciones (Comprobantes de retenciones varias (ARCV), XML de retenciones de ISLR, Retenciones del IVA), Lista de pagos realizados, Lista de cuentas por pagar (General, Por pagar), Lista de cuentas por cobrar, Lista de presupuestos.
- Evolución de pacientes: Bioanalista only, each open is logged.
- Estadísticas: Bioanalista. Administración gets aggregates only, with small groups suppressed. If a chart ever appears: navy series 1, burgundy series 2, --text-secondary series 3.

COST SCREENS, Administración only, Fiscal report, Unknown columns: Insumos, servicios y otros; Costos reactivos; Promedios pacientes/pruebas, which shows no average because the formula is Unknown; and their Lista reports. Salarios de personal and Lista de salarios need a password re-entry. These never feed client prices.

Lista de precios is the Price matrix, not this pattern.
```

**Check:**
- Open Libro de ventas: it must show the sentence and not invented columns.
- Salarios needs a re-entry.
- Promedios displays no number.

## V0-24. Users, backup, audit, blocked commands

**Attach:** `product/10-security-baseline.md`, `product/09-audit-log.md`, R-120 to R-131, E-01 to E-09 from `product/06-access-control.md`, `brand/06-edge-cases.md` (Session switches), `brand/08-data-lifecycle.md` (User, Audit).

```text
Build system maintenance. All through decide().

NUEVO USUARIO. Administración, password re-entry. Registry table: display name, roles, Activo. A person may hold several roles, listed in a monthly conflict report. Roles are Recepción, Auxiliar, Bioanalista, Administración. A new user can't start with Bioanalista. A person who leaves is disabled, never deleted, and their name stays on historical records.

RULES:
- Nobody can disable themselves, change their own roles, give themselves temporary cover, or grant themselves Bioanalista. Refused.
- The last active administrator can't be disabled or demoted. Refused.
- Disable another user: re-entry. Their sessions end immediately.
- Change roles: re-entry. Roles are REPLACED, not added to. This can't add Bioanalista. Writes user.role.change with before and after.
- Temporary cover: re-entry and motivo, with an end date. It ends by itself. It can't include Bioanalista. Writes user.grant.temporary.
- Grant Bioanalista: re-entry plus a license number. This is the only way to grant it. Notifies existing bioanalysts and the owner. A removed or lapsed license suspends the role, and past releases are unaffected.
- Reset another user's Clave: re-entry. Temporary password, valid for 24 hours and once, forced change at next sign-in. Ends their sessions, and notifies them and the owner. Writes password.reset.

REGISTRO DE CORREO. Administración, re-entry. A single card. Its fields are Unknown beyond "the account Enviar correo uses". The secret is write-only and never shown back. Writes mail.config.change.

RESPALDO DE LA BD. Administración, re-entry. Writes backup.run with operator and time. In this stage, it's a fake that records the event. Claim no path, engine, or schedule.

AUDITORÍA. Fiscal report listing the application's own events, as the attached audit log page specifies. Filters: Desde, Hasta, Evento, Usuario, Severidad, Resultado, record id, and no search by name or cédula. Columns: Fecha y hora, Evento, Usuario, Registro, Resultado, Motivo. A row opens its detail. Sort newest first by sequence number. Administración sees all events with clinical before-and-after text masked, and that view is logged. Bioanalista sees clinical events unmasked. The log is append-only: no edit or delete anywhere. Refused events appear too.

BLOCKED PANELS.
- Modificar valores: the menu item opens a panel reading "Este comando no tiene una pantalla capturada. No cambia precios, referencias ni resultados." Writes nothing.
- Trasladar paciente, Reversar relación: title and BLOQUEADO.

The physician has no account. Add no physician role. Do not add a back-door or a default admin account in code.
```

**Check:**
- As the only admin, try to disable yourself: refused.
- As Administración, clinical text in Auditoría is masked.
- Confirm no audit edit or delete route exists.
