# Display patterns

**Standard:** [03-documentation-standard.md](03-documentation-standard.md)  
**Palette:** [01-palette.md](01-palette.md)  
**Type and voice:** [02-brand-style.md](02-brand-style.md)

These are the surfaces the new application uses. A feature in [07-feature-catalog.md](07-feature-catalog.md) points at one of them. Field-level rules for each record are in [05-data-display-models.md](05-data-display-models.md). Defects the patterns close are in [06-edge-cases.md](06-edge-cases.md).

Shared rules, all **Design rule**:

- Text is Spanish. Documents in this folder stay English.
- Figures that are results, money, rates, dates, or identifiers use tabular numerals.
- A status the operator must trust is a word. Color and an icon repeat it. They do not replace it.
- Column headers stick. The patient header card does not scroll away on a visit screen.
- The last good values stay visible while a refresh runs (`Actualizando`).

```text
Shell
  └─ Screen title + primary action
        └─ Patient header card     (one visit)
              ├─ Billing card      (invoice only)
              ├─ Line table        (exams, payments)
              ├─ Result grid       (clinical values)
              ├─ Price matrix      (catalog prices)
              ├─ Registry table    (masters)
              └─ Fiscal report     (read-only lists)
                    └─ Issued report (paper and preview)
```

## Shell

**Purpose.** Keep the operator oriented for the whole session: who is signed in, which rate prices use, and whether QR and Saturday prices are on.  
**Actor.** Any signed-in role. **Design rule.**  
**Record.** Session. **Observed** pieces are the status line and the toolbar in [../session/README.md](../session/README.md).  
**Pattern.** Shell.

### Regions, top to bottom

1. **Bar** (`--color-navy-deep`, 56px). Emblem on a white tile, then BIOMEG and LABORATORIO CLINICO in white. Trailing cluster, left to right: Usuario activo, Tasa BCV, QR, Precio sábado, Cerrar sesión, Salir.
2. **Primary actions**, on the page under the bar, as text buttons: Ingreso particular, Ingreso empresa, Hoja de trabajo, Cargar resultados, Presupuesto, Cierre de caja, Clave. These are the toolbar commands from the session.
3. **Menu**, a single row: Pacientes, Hoja de trabajo y resultados, Registros, Administrativo, Estructura de costos, Reportes, Mantenimiento. Flyouts list the commands in [07-feature-catalog.md](07-feature-catalog.md). A command this role cannot run is omitted. **Design rule:** Pacientes is a direct link to the patient list (no nested Clientes item). A menu group with one reachable command uses the group label as that link. Patient lifecycle and Incluir inactivos live on that screen. Ingreso particular and Ingreso empresa stay on the primary actions row.

### Required content

| Slot | Observed value shape | Design rule |
|---|---|---|
| Usuario activo | A name, as in the session’s “LCDA. GIULIANA” | The signed-in user’s display name. Staff names are operational, not patient data |
| Tasa BCV | `889,26` on 30/10/2026 | The rate the session will apply, with the date it was taken in a caption |
| QR | `ACTIVO` or `INACTIVO` | Chip text, not a colored dot |
| Precio sábado | `ACTIVO` or `INACTIVO` | Chip text. The caption states that the switch is for the whole laboratory |

### Sort and filter

The shell has no rows. The home observations list, when that screen is open, sorts by the date the operator set, defaulting to today. **Observed:** the home panel has Nueva observación, Mostrar, Ocultar, a date, and Buscar, and the list was empty in every capture.

### States

| State | Display |
|---|---|
| Empty observations | Title Nueva observación, the date, Buscar, and the sentence “Sin observaciones para esta fecha.” |
| Single observation | One row, header still shown: date, author, first line of text |
| Partial | The rate chip reads `SIN TASA` in the incomplete colors when the session has no BCV rate. Priced actions stay disabled |
| Error | A failed sign-in leaves the lockup and the message “No se pudo entrar.” No clinical record is shown |
| No permission | The menu item is absent. The status chips still show, because the rate and the QR flag affect every role’s reading of a document |

**Write.** Signing in writes the session’s user and the time. The rate and the QR and Saturday flags are laboratory values, read live, and each chip refreshes when one changes. A document copies the values in force when it is saved. **Why:** two desks must not charge different rates.  
**Audit.** `session.enter` and `session.leave`. **Design rule.** The current Auditoría screen is **Unknown**.  
**Evidence.** [../session/README.md](../session/README.md).

## Patient header card

**Purpose.** Show one visit’s identity in the same place on the invoice, the result screen, and the report preview.  
**Actor.** Receptionist at intake. Bioanalyst at result entry, read-only for identity except Fecha de nac. and sex after a result. **Design rule.**  
**Record.** Patient plus the order header. [../data-model/patient.md](../data-model/patient.md), [../data-model/order.md](../data-model/order.md).  
**Pattern.** Patient header card.

### Regions

The card is white, 16px padding, 8px radius, a 2px burgundy rule under the title `Paciente`.

| Order | Label | Source | Edit |
|---|---|---|---|
| 1 | Nombre y apellido | One string. **Observed** on the invoice | Reception. An issued report keeps the printed name |
| 2 | C.I. | Type plus digits, displayed `V-12.345.678`. **Observed** on the print as digits. The type list is a **design rule**. Empty is allowed on the client and shows Sin verificar | Reception, until the client has an order |
| 3 | Fecha de nac. | `DD/MM/YYYY`. Empty until the operator sets it. **Design rule.** The blank invoice’s prefilled `07/10/2012` is a defect, recorded in [06-edge-cases.md](06-edge-cases.md) | Reception. After a result, a confirm and a review flag |
| 4 | Edad | Computed from the birth date and the sample date, shown as years, or months when the child is under two | Read-only. **Design rule.** The October form left Edad empty beside a prefilled birth date |
| 5 | Sexo | Masculino, Femenino, or blank. No third value | Reception. After a result, a confirm and a review flag |
| 6 | Teléfono | The delivery number | Reception |
| 7 | Email | On the card because Enviar correo needs it. **Observed** on the invoice. Absent from the clinical print header | Reception |
| 8 | Motivo | Free text | Reception |
| 9 | Médico | Dropdown fed by Registro de médicos | Reception |
| 10 | Convenio | The agreement or company name. **Observed** as a company on the BIOMEG preview | Reception |
| 11 | Fecha muestra | `DD/MM/YYYY` | Reception, default the session date only after the operator confirms a new visit |
| 12 | Fecha reporte | `DD/MM/YYYY` | Set at the first Liberar and updated by each later Liberar of that order. Read-only |
| 13 | N° orden | Zero-padded, at least four digits | Assigned at save. Read-only |

### Sort and filter

One card, one visit. The person is found or created in Clientes, then Nueva orden opens with that client already chosen. This card shows the selected client. It does not create a second person. A Sin verificar client passes Pago only with the billing party’s complete cédula. See [../product/02-client-flow.md](../product/02-client-flow.md).

### States

| State | Display |
|---|---|
| Empty | No client selected. Crear cliente stays disabled until Nombre and Fecha de nac. are filled. C.I. may stay empty, and the client is then Sin verificar. Fecha de nac. is never prefilled. The blank form’s `07/10/2012` is refused. See [06-edge-cases.md](06-edge-cases.md) |
| Single | The card as specified. A visit with one exam uses this same card |
| Partial | Chip `INCOMPLETO` when a requested section is not yet released. A blank sex or email stays visible as an em dash and does not change the chip |
| Error | Save failure: “La orden no se guardó.” Fields keep what the operator typed |
| No permission | Bioanalysts see the card read-only, except Fecha de nac. and sex after a result. A role without patient access gets `BLOQUEADO` and no values |

**Write.** The client is saved in Clientes, before the order. A matching cédula selects that client. Sin verificar can be saved, and passes Pago only with the billing party’s complete cédula. Guardar on the order writes the order header against the client id. **Why:** the next visit must find the same person, and the report must print this header. Age is not stored as the source of truth.  
**Audit.** `patient.save`, `order.open`.  
**Evidence.** [../session/facturacion.md](../session/facturacion.md), [../session/print-preview.md](../session/print-preview.md).

Email, birth date, médico, and motivo are on the invoice and are not in the preview header. The card shows them on screen. The issued report prints the header set in the issued-report pattern.

## Billing card

**Purpose.** Show who is charged when that party is not the patient.  
**Actor.** Receptionist.  
**Record.** Invoice header. **Observed** on Facturación de consultas.  
**Pattern.** A second header card under the patient card, title `Facturación`, same chrome.

| Label | Observed on the blank form |
|---|---|
| Factura N° | Empty until save |
| Control N° | Empty on the blank form. **Design rule:** `Pendiente` until assigned, then the number |
| Tipo de costo | Rutina, Seguro/Empresa, Emergencia, Hospitalizado. One selected. The choice is repeated in the totals so the price column is explicit |
| C.I. | Billing document, separate from the patient |
| Razón social | Legal name |
| Dirección | Address |

**States.** Empty razón social on a Particular visit is valid: the card reads “Facturado al paciente.” On Empresa or Seguro/Empresa the card requires razón social before Guardar. Error and permission behave as the patient card.

**Write.** With the invoice. **Why:** fiscal reprint and a company convenio.  
**Evidence.** [../session/facturacion.md](../session/facturacion.md).

## Line table

**Purpose.** Editable rows of a known, short shape: exams on an invoice, payments, or a catalog slice.  
**Actor.** Whoever owns the parent screen.  
**Record.** Exam order line, or payment line.  
**Pattern.** Line table.

### Regions

1. Filter or adder. On the invoice this is Indique examen, then the catalog list, then the chosen lines. **Observed.**
2. Sticky header.
3. Body rows, 36px, white and `--surface-page` alternating.
4. A footer row only when the table is payments or when a count helps (“3 exámenes”).

### Invoice exam columns

**Design rule**, built from what the invoice and the price list actually separate. Prices are not on the exam picker. They are on Lista de precios.

| Column | Content |
|---|---|
| Examen | Catalog description |
| Tipo de costo | The visit’s choice, repeated so the row shows which tariff applied |
| Columna de precio | The price-list column used: Particular, Aliados, Hospitalizado, Emergencia, or Estatal. **Design rule.** The October form does not show this link. The new screen does, and it does not guess a mapping |
| Moneda | USD or Bs |
| Precio | Amount in that currency, tabular |
| Status | `Disponible` or `No disp.` as words |

### Payment columns

**Observed** instruments, laid out as rows rather than as a scatter of boxes: Efectivo USD, Zelle, Efectivo Bs, T. débito, T. crédito, Pago móvil, Transferencia. Each row has Monto, Banco, and Referencia. Banco and Referencia apply to the electronic methods. Pago móvil and Transferencia had a dropdown beside the amount. The dropdown’s options are **Unknown**.

Cashea is not a box on the blank invoice. The line table gains a Cashea row only when Forma de pago includes it. That dropdown was not opened, so the option is **Unknown**. Cobros Cashea remains its own command.

### Sort and filter

Exam lines stay in the order the operator added them. The catalog picker filters as the operator types and can be limited by category. Payment lines stay in the instrument order above.

### States

| State | Display |
|---|---|
| Empty | Header plus “Sin exámenes en esta orden.” Guardar is refused, and the client stays saved in Clientes. **Design rule:** issuing a report from an order with no exams is refused |
| Single | One row, header kept |
| Partial | A `No disp.` exam can be added only after a confirm that names the exam. The row carries the status word |
| Error | A price that cannot be resolved because the column or the currency is missing leaves the Precio cell as `SIN PRECIO` and blocks the fiscal issue |
| No permission | The table is readable and the adder is hidden |

**Write.** Each added exam writes an order line. Each amount writes a payment line. **Why:** the invoice total, the worklist, and the result grid are the same lines.  
**Audit.** `order.line.add`, `order.line.remove`, `payment.record`.  
**Evidence.** [../session/facturacion.md](../session/facturacion.md), [../session/lista-de-precios.md](../session/lista-de-precios.md).

### Totals under the line table

**Observed** on the blank invoice, all zero: Sub total, Total exento, Total base imp., I.V.A., IGTF, Desc., Total Bs, Total USD, Abono, Resta.

**Design rule.** The totals card repeats Tasa BCV with the figure from the shell and the words “tasa usada en este total.” Descuento shows the chosen percent, not a bare `Desc. 0%` when a percent was selected. Abono and Resta stay visible when a visit is partly paid.

## Result grid

**Purpose.** Show and, before release, edit clinical values in the shape the laboratory already prints.  
**Actor.** Auxiliary and bioanalyst enter before release. Only the bioanalyst overwrites another value, releases, and corrects. Reception reads after release. **Design rule.**  
**Record.** Section and result line. [../data-model/exam-and-result.md](../data-model/exam-and-result.md).  
**Pattern.** Result grid.

### Regions

1. Patient header card, read-only.
2. Order chip: N° orden, Fecha muestra, Fecha reporte, and the order state: `ABIERTA`, `INCOMPLETO`, `LIBERADO`, or `EN_CORRECCION`.
3. Sections in clinical order. A section heading spans the grid and has no result cell.
4. Rows.

### Columns

**Observed** on the preview and on other laboratories’ reports:

| Column | Content |
|---|---|
| Descripción del examen | Analyte or panel child. A heading row uses this column only |
| Resultado | Number, word, or semi-quantitative text. Comma decimals |
| Unidades | May be blank or a dot |
| Valores de referencia | The reference **text**, which may contain both sexes, an age word, or a sentence. See [../data-model/reference-interval.md](../data-model/reference-interval.md) |
| Marca | **Design rule.** `ALTO`, `BAJO`, or blank. The October page has no such column |

The Marca cell also carries the icon and the semantic background from [01-palette.md](01-palette.md). The word is what a monochrome print keeps.

### How a row is read

1. The operator reads the section heading to know the department.
2. The description names the analyte.
3. The result is the value that will print.
4. The unit sits in its own column. When the reference text repeats the unit, both stay. The new application does not strip one of them, because both shapes were printed.
5. The reference text is compared as text. The screen also computes Marca when the reference is a closed numeric range and the result is numeric. When the reference is a sentence, both sexes, or a word, Marca stays blank unless the bioanalyst sets it.
6. A calculated name (`V.C.M.`, `LDL-COLESTEROL`, and the others listed in the exam note) is a normal row. The grid does not add a formula badge. Whether the current program calculates those rows is **Unknown**.

### Sort and filter

Rows follow the section order already observed: hematology (serie roja, serie blanca, serie plaquetaria), then the other departments on the order. Inside a section the catalog sequence holds. The operator can filter the grid to one section. The filter does not change stored order.

### States

| State | Display |
|---|---|
| Empty | Patient card, order chip, and “Sin resultados.” No section headings |
| Single | One section, one row, four columns plus Marca |
| Partial | Sections that have at least one result are shown. A section with no rows is omitted. The order chip reads `INCOMPLETO` and names the missing exams (“Química sanguínea: sin resultados”). The October preview printed QUIMICA SANGUINEA with headers and no rows. That layout is the defect this state replaces |
| Error | A non-numeric entry in a numeric analyte shows “El resultado no es un número.” The previous stored value remains |
| No permission | Reception sees no values before `LIBERADO` or during a correction, and read-only values after it. Administration sees no values. Editing a released value is a separate action, Liberar corrección, with a password re-entry and a motivo, and audited |

**Write.** Each cell writes on leave of the field, storing the displayed text. **Why:** the issued report prints this cell, and a qualitative result cannot be forced into a float. A second numeric channel for analyzers is **Unknown** and is not shown. An analyzer value that arrives on a typed cell waits beside it for the bioanalyst.  
**Audit.** `result.enter` before release. After release, `result.correct.open`, `result.correct.cancel`, and `result.correct.release`. The correction event stores the previous text, the new text, the operator, and the time. **Design rule.** The current report shows only the current value.  
**Evidence.** [../session/print-preview.md](../session/print-preview.md), [../data-model/exam-and-result.md](../data-model/exam-and-result.md).

### Observations

`OBSERVACIONES` is an optional note under a section, as on one public hematology report. The home screen’s Nueva observación is a different list. The session never showed that the two are the same record. The result grid’s note is per section of this order. The home list stays a session note until a capture shows otherwise.

## Price matrix

**Purpose.** Read prices for one category, one currency, and one status.  
**Actor.** Reception and whoever maintains prices. Editing lives under Mantenimiento, Precio exámenes, not on this inquiry. **Design rule** separating the two commands that already exist.  
**Record.** Exam price. [../session/lista-de-precios.md](../session/lista-de-precios.md).  
**Pattern.** Price matrix.

### Regions

1. Filters: Columna de precio, Moneda, Categoría, Status. **Observed.** The capture had Química sanguínea and Disponible. Column and currency were not chosen in the visible state.
2. Sticky header.
3. Rows.
4. Imprimir lista. The printed list repeats the filter values in the heading so a paper copy states its currency.

### Columns

| Column | Observed |
|---|---|
| Examen | Catalog name, spelling kept as stored |
| Particular | Amount |
| Aliados | Amount |
| Hospitalizado | Amount |
| Emergencia | Amount |
| Estatal | Amount |
| Status | `Disponible` or `No disp.` |

Amounts use the currency selected in the filter. The header of the matrix includes that currency (`Montos en USD` or `Montos en Bs`). One currency at a time, as the filter implies.

### Sort and filter

Default sort is the catalog order inside the category. The operator can sort by Examen. Status filter is Disponible, No disp., or Todos. A row that is No disp. inside a Disponible filter is shown with its status word and a caption “Excepción en el filtro”, because the October capture showed at least one such row. Further status names are **Unknown** and are not added.

### States

| State | Display |
|---|---|
| Empty | Filters kept, “Sin exámenes en esta categoría.” |
| Single | One row, all five price columns |
| Partial | A blank price cell shows `SIN PRECIO`, not a zero. Zero is a real price only when stored as zero |
| Error | An unknown currency code shows “Moneda no disponible.” and no amounts |
| No permission | Inquiry is readable. Precio exámenes is a maintenance command and follows that command’s permission |

**Write.** This screen does not write prices. Imprimir lista writes a print event. **Why:** a price change belongs to maintenance, where Auditoría can see it.  
**Audit.** `price.print`. Price edits audit as `price.change` from the maintenance screen.  
**Evidence.** [../session/lista-de-precios.md](../session/lista-de-precios.md).

Tipo de costo on the invoice is a different list (Rutina, Seguro/Empresa, Emergencia, Hospitalizado). The matrix does not rename its columns to match. The invoice names the column it used. See [06-edge-cases.md](06-edge-cases.md).

## Registry table

**Purpose.** Maintain a master the invoice or the catalog only chooses from.  
**Actor.** Whoever runs Mantenimiento and Registros. The split of duties is **Unknown** in the current program and is a permission **Design rule** in the new one: reception may read médicos and empresas, administration edits, and the bioanalyst edits the bacteriology masters.  
**Record.** One master. Columns beyond the identity the command name proves are **Unknown**.  
**Pattern.** Registry table.

### Regions

1. Title, the command’s name (Registro de médicos, and the rest in the catalog).
2. Search.
3. Sticky header: Nombre, Status, and Actualizado.
4. Rows.
5. Primary action Nuevo. A row opens a single-record card with the same fields.

### What each master is allowed to show before a form is captured

| Master | Column the command itself proves | Further columns |
|---|---|---|
| Médicos | Nombre | Unknown. The invoice dropdown only proves the name is choosable |
| Empresas | Razón social | Requiere titular, a yes or no. **Design rule**, because a convenio is a row here. Others **Unknown**. Convenio on the preview was a company name |
| Proveedores | Nombre | Unknown |
| Reactivos y servicios | Nombre | Unknown |
| Equipos | Nombre | Unknown. The analyzer poster names a BC-20 and a BS-240. Those names are advertisement, not rows from this registry |
| Parásitos, antibióticos, microorganismo, muestra de bacteriología, observaciones de bacteriología | Nombre | Unknown |

Status is a **Design rule** (`Activo` / `Inactivo`) so a retired physician disappears from the invoice dropdown and remains on old orders.

### Sort and filter

Sort by Nombre. Search matches the name column. Inactive rows are hidden until the filter Status is Todos.

### States

| State | Display |
|---|---|
| Empty | “Sin registros.” and Nuevo |
| Single | One row, header kept |
| Partial | A row saved with only a name is valid. Unknown fields are not required |
| Error | A duplicate name shows “Ese nombre ya existe.” The existing row is unchanged |
| No permission | The menu item is absent |

**Write.** Nuevo and Guardar write the master. An order stores the chosen id and the name as printed, so a later rename does not rewrite issued reports. **Design rule.**  
**Audit.** `registry.create`, `registry.update`.  
**Evidence.** [../session/registros.md](../session/registros.md).

## Fiscal and list report

**Purpose.** Read-only lists and Venezuelan fiscal outputs.  
**Actor.** Administrative staff. Bioanalysts do not need the libros. **Design rule.**  
**Record.** Whatever the command names. Column sets for unopened reports are **Unknown**.  
**Pattern.** Fiscal report.

### Regions

1. Title, the full command path (Lista de ventas / Libro de ventas).
2. Filters that the command’s siblings already imply when a date or a party is in the name: Desde, Hasta, and, when relevant, Empresa or Moneda. A flyout that was not opened does not grow extra filters.
3. Sticky table.
4. Totals row when the report is money: the sum of the amount columns that are known, plus Tasa BCV if any bolívar figure was converted.
5. Export actions that were implied by a named output: Imprimir, and for the ISLR XML command, Descargar XML. Other exports are not added.

### How an unopened report still behaves

The table renders the title, the filters, and a body of **Unknown** columns as the sentence “Las columnas de este reporte no están capturadas.” It does not invent Libro de ventas columns. When a later capture names the columns, they replace that sentence and follow the line-table reading order.

Reports whose screens were opened use real columns. Lista de precios uses the price matrix instead of this pattern.

### Sort and filter

Date range defaults to the session day. Sort is the document number ascending inside the range. The operator can sort by any known column.

### States

| State | Display |
|---|---|
| Empty | Filters kept. “Sin movimientos en este rango.” |
| Single | One row and a totals row that equals that row |
| Partial | A cut-off menu label stays cut off in the catalog (“Generar relación de paciente”). The screen title uses only the words that were visible |
| Error | A range that fails to load keeps the previous rows and shows “No se pudo actualizar.” |
| No permission | Menu item absent |

**Write.** These screens do not change clinical or fiscal documents. Download and print write an audit event. **Why:** a reprint and a libro are evidence, and reading them should be traceable.  
**Audit.** `report.view`, `report.print`, `report.export`.  
**Evidence.** [../session/reportes.md](../session/reportes.md), [../session/administrativo.md](../session/administrativo.md).

## Issued report

**Purpose.** The page the patient, the physician, or another laboratory can hold. Separate from screen chrome.  
**Actor.** Reception and the bioanalyst generate and send after release. Only the bioanalyst generates a draft or approves an incomplete send. **Design rule.**  
**Record.** The released order and its result lines.  
**Pattern.** Issued report.

### Regions on the paper

1. **Laboratory block.** Full lockup: emblem, BIOMEG, LABORATORIO CLINICO, RIF from the laboratory record. QR at the upper right when the session flag is Activo. **Observed** on the BIOMEG preview: name, line, RIF, QR.
2. **Patient and order block.** PACIENTE, C.I., EDAD, GÉNERO, TELÉFONO, CONVENIO, FECHA MUESTRA, FECHA REPORTE, N° ORDEN. Email, birth date, médico, and motivo stay off this block. They are on the invoice. **Observed** omission.
3. **Result grid** as specified above, including the Marca word. Section headings with no rows are omitted.
4. **Page mark.** `1 de 1`, or `2 de N` when the grid flows. **Design rule.** **Observed:** the October viewer showed “1 de 1” and the paper printed “Page 1 of 1”.
5. **Procesado por.** The releasing user’s display name. The public Template B slot was empty and the report still existed. **Design rule:** the new application refuses release without a user, so this line is filled. The historical emptiness is why the rule exists. When different bioanalysts released different sections, the name appears per section.

Screen chrome around the preview, **observed** and kept: Generar PDF, Enviar WhatsApp, Enviar correo, Salir. Those actions sit above the paper, outside the page margin, and are not part of the PDF.

### QR

The code is present only when the shell says QR Activo. The payload of the October code was not decoded and stays **Unknown**. **Design rule:** the code resolves to this order through a random token, and the printed page still makes sense if the code is covered. The verification screen shows the order number, the laboratory name, the report date, the state (Liberado, Incompleto, or En revisión), and whether the issue was replaced. It does not show a phone number or a cédula. It says that it doesn’t confirm the printed values. If the optional value check is on, the paper also prints Código de consulta, near the QR, and the page has a field for it. See [../product/10-security-baseline.md](../product/10-security-baseline.md#a06-insecure-design).

### Sort and filter

Print by patient prints every section on the order that has rows. Print one test prints the chosen analyte and its section heading. Both use this pattern.

### States

| State | Display |
|---|---|
| Empty | Preview refuses: “Sin resultados para emitir.” |
| Single | One page, one section |
| Partial | Allowed only as a draft preview, with a banner `INCOMPLETO` across the top of the paper and the missing exams listed. **Design rule.** Issuing to WhatsApp or email requires a bioanalyst to approve “Enviar incompleto” with a password re-entry, and then a send confirm. The October program printed the empty chemistry header with no such banner |
| Error | A failed send: “El envío no salió. La orden sigue guardada.” PDF generation can be retried. The clinical values are unchanged |
| No permission | Enviar is hidden until the order is `LIBERADO` or a bioanalyst approved the incomplete send with a password re-entry. It is hidden again during a correction. Reception never approves |

**Write.** Generar PDF stores the file with the order. Enviar stores destination, channel, time, and operator before the send is called complete. The October buttons were not pressed, so the provider behind WhatsApp and correo is **Unknown**.  
**Audit.** `report.issue`, `report.pdf`, `delivery.whatsapp`, `delivery.email`.  
**Evidence.** [../session/print-preview.md](../session/print-preview.md), [../modules/result-delivery.md](../modules/result-delivery.md).

## Worklist

**Purpose.** The bench’s list of orders to process. The command is Hoja de trabajo. The form was not opened.  
**Actor.** Auxiliary and bioanalyst. **Design rule.**  
**Record.** Orders for the chosen date.  
**Pattern.** A line table with **Unknown** clinical columns, plus the columns the surrounding commands already force.

**Design rule** for the minimum columns, because the worklist has to open an order the other screens already identify:

| Column | Why it is the minimum |
|---|---|
| N° orden | Printed on the report |
| Paciente | Header name |
| Convenio | Header |
| Fecha muestra | Header |
| Estado | `ABIERTA`, `INCOMPLETO`, `LIBERADO`, or `EN_CORRECCION` |

Tube, barcode, and sample status are **Unknown**. They are not given columns. The date filter is the session date. Empty: “Sin órdenes para esta fecha.”

**Evidence.** [../session/hoja-de-trabajo.md](../session/hoja-de-trabajo.md). The note there says not to describe the current program’s columns. This table is the new application’s minimum, labeled as a design rule.

## Status chip

A chip is the small status object used inside the shell, the order header, and table cells.

| Rule | Detail |
|---|---|
| Content | One Spanish word, or a short fixed label such as `NO DISP.` or `SIN TASA`, in capitals. Printed flags use capitals too. Running text, filter options, and field values use sentence case |
| Color | The semantic pair when the word is `ALTO`, `BAJO`, `INCOMPLETO`, `BLOQUEADO`, or `LIBERADO`. `ACTIVO` and `DISPONIBLE` use released colors. `INACTIVO` and `NO DISP.` use blocked colors |
| Size | 12px type, 4px vertical padding, tabular figures if the chip ever holds a number |
| Icon | Beside `ALTO` and `BAJO` only |

The chip never stands in for a missing value. A missing birth date is an em dash in the field, not a chip.
