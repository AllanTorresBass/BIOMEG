# Data lifecycle

**Standard:** [03-documentation-standard.md](03-documentation-standard.md)  
**Where each fact is drawn:** [05-data-display-models.md](05-data-display-models.md)

This page answers, for each class of record, why it is kept, when it is written, where it appears, who may see it, and what a reprint or a send adds. “How” is the display and the write. “When” is the moment. “Where” is the pattern and the channel. “Why” is care of the patient, a fiscal reprint, delivery, or traceability.

Roles are a **Design rule**. The published roles are receptionist, secretary, auxiliary or assistant, bioanalyst, and physician. Secretary follows reception in this page. Administration is a role of the new application. A permission matrix for the current program is **Unknown**. The new application’s is [../product/06-access-control.md](../product/06-access-control.md).

Patient identifiers from the October preview are not repeated here.

## Patient

| Question | Answer |
|---|---|
| Why | The next visit has to find the same person, and the report header has to name them |
| When | First Guardar in Clientes. Again on Modificar pacientes. Open orders show a renamed client. An issued PDF keeps the name it was printed with |
| Where | Clientes. The Cliente step of Nueva orden. Patient header card. Report header for the fields the preview prints. Email stays off the paper |
| Who | Reception writes. Bioanalyst reads the header on the result grid, and may change Fecha de nac. or sex after a result. The client reads the portal after sign-in. Physician reads the issued report. The physician’s own screen is **Unknown** |
| How | One name string, cédula type and digits or Sin verificar, birth date, computed age, sex (Masculino, Femenino, or blank), phone, email, and the link to orders |
| Reprint or send | The issued report copies the header fields it prints. A later name change updates the master and open orders. The old PDF keeps the old name |

Age is computed at display from Fecha de nac. and Fecha muestra. The cache inside a PDF is the age at issue. See [06-edge-cases.md](06-edge-cases.md).

## Order

| Question | Answer |
|---|---|
| Why | One visit binds the patient, the convenio, the exams, the money, and the results |
| When | Guardar on a new intake assigns N° orden. Fecha muestra is the collection date. Fecha reporte is written at the first Liberar and updated by each later Liberar of that order |
| Where | Patient card, worklist, result-grid chip, issued report |
| Who | Reception opens it. The bench reads it on the worklist. Bioanalyst fills results |
| How | Header fields in [../data-model/order.md](../data-model/order.md), plus médico and motivo on screen only |
| Reprint or send | Re-imprimir orden de entrega and Re-imprimir orden empresa mark `COPIA` and write `document.reprint`. The order number stays |

Two people saving the same order: the second save is refused and the first writer’s version reloads, with that user’s name and time. **Design rule.**

## Convenio and billing party

| Question | Answer |
|---|---|
| Why | The header prints one convenio, and a company visit needs a razón social for the invoice |
| When | Chosen at intake. Empresa requires razón social before the first save |
| Where | Convenio on the patient card and the report. Razón social, billing C.I., and dirección on the billing card and the factura. They are not on the clinical report |
| Who | Reception writes. Administration reads the company lists |
| How | One convenio value per order. Whether that value is the same row as Registro de empresas was not shown on the preview. **Design rule:** a convenio is a row in Registro de empresas, which holds Status and Requiere titular. The order stores the registry id, the printed string, and any titular |
| Reprint or send | The factura copy includes the billing party. The clinical PDF includes convenio only |

## Exam line

| Question | Answer |
|---|---|
| Why | The worklist, the result grid, and the invoice total are the same requested exams |
| When | The operator adds an exam on the invoice. Removing a line with no results removes it. Removing a line after any result exists is a correction and keeps the audit row |
| Where | Line table on the invoice. Section and row on the result grid if it is an analyte. Price from the matrix column named on the line |
| Who | Reception adds at intake. Bioanalyst does not re-price |
| How | Description, tipo de costo, columna de precio, moneda, precio, status |
| Reprint or send | The clinical report lists descriptions and results, not prices. The factura lists descriptions and prices |

A `No disp.` exam can be added only after a confirm. `SIN PRECIO` blocks a fiscal issue. It does not block Liberar, because a price gap must not delay a clinical result.

## Result

| Question | Answer |
|---|---|
| Why | The result is the care record and the text the report prints |
| When | On leaving the cell in Cargar resultados. Analyzer import is advertised and was not captured. A typed value and an imported value, if both exist, still show as one Resultado cell, because that is all the report has. Which one won is **Unknown** in the current program. **Design rule:** the cell stores one text, and `result.enter` records the source as `teclado` or `equipo` when the source is known. An analyzer value that arrives on a typed cell does not replace it. It waits beside the cell for the bioanalyst |
| Where | Result grid. Issued report. Row history after a correction |
| Who | Bioanalyst writes before release, and an auxiliary may enter values before release. After `LIBERADO`, only through Liberar corrección. Reception reads after release |
| How | Text, so qualitative and numeric shapes share the column. Marca is derived or set by the bioanalyst and is stored with the line so the PDF matches the screen |
| Reprint or send | The PDF stores the text and the Marca word as issued. Releasing a correction writes a new issue at once, marks the old one Reemplazado, and creates a resend task. The audit keeps the previous text |

Empty sections are not written as blank result rows. They remain unordered or pending exams on the order, listed in the `INCOMPLETO` chip.

## Validation

| Question | Answer |
|---|---|
| Why | The vendor’s path releases results before delivery, and the report has a Procesado por slot that public templates sometimes leave empty |
| When | Liberar. The new app requires a signed-in bioanalyst who re-enters the password, so the slot is filled |
| Where | Chip `LIBERADO` on the order. The name on the issued report. Wet-stamp sentences are template text from other laboratories and are printed only when the laboratory record contains that sentence |
| Who | Bioanalyst |
| How | State, user id, display name, time |
| Reprint or send | Delivery actions stay hidden until Liberar, unless a bioanalyst approves an incomplete send |

## Invoice, rate, and payment

| Question | Answer |
|---|---|
| Why | The laboratory reprints facturas, notes, and retentions, and the session shows IVA, IGTF, both currencies, abono, and resta |
| When | Guardar assigns Factura N°. Control N° is stored when the fiscal assignment happens. Until then the screen says `Pendiente` and a fiscal copy is refused. Payments write as amounts are entered. Abono writes from Agregar abono. The BCV rate is copied from the shell onto the invoice at save and is not replaced when the shell rate later changes |
| Where | Billing card, payment line table, totals card, libros and the other fiscal reports once their columns are known |
| Who | Reception takes payment and the daily close. Administration issues notes, retentions, the monthly close, and Cashea collections |
| How | Totals observed on the form, instruments observed on the form, rate and price column added by design rule |
| Reprint or send | Re-imprimir writes `document.reprint` and prints `COPIA`. It does not allocate a number. Credit and debit notes are new documents that point at the factura |

Cierre de caja records the day’s totals for the signed-in user and the time. It does not delete payments. Cierre mensual is a separate event.

## Delivery

| Question | Answer |
|---|---|
| Why | The patient leaves with a PDF, a WhatsApp message, or an email, and the laboratory needs to know which of those happened |
| When | After Liberar, or after a bioanalyst approves an incomplete send. The October buttons were visible and not pressed, so timing inside the current program is **Unknown**. The published word “automático” is not treated as “send with no operator,” because this preview shows buttons |
| Where | Actions above the issued report. Phone from Teléfono. Email from Email. QR on the page when the shell flag is Activo |
| Who | Reception and the bioanalyst send and generate the PDF after release. Only the bioanalyst generates a draft or approves an incomplete send. Anyone holding the paper can open the verification page |
| How | Each send stores channel, destination, time, operator, order number, mode (a portal link, or an attachment with recorded consent), and whether the order was incomplete. The provider for WhatsApp and for correo is **Unknown**. Registro de correo is the maintenance slot for the mail account, fields **Unknown** |
| Reprint or send | A second send is a new delivery row. It does not erase the first. A failed send stores the failure and leaves the order as it was |

The verification page shows order number, laboratory name, report date, the state (Liberado, Incompleto, or En revisión), and whether the issue was replaced. Cédula and telephone stay off that page.

## Portal session

| Question | Answer |
|---|---|
| Why | The client can read a released result without a staff member resending it |
| When | Ingresar, after a complete cédula, the matching Fecha de nac. on a client who has at least one order, and a one-time code. The session lasts three hours, with a 15-minute idle timeout |
| Where | Ingresar and Mis visitas. A Pendiente row lists the visit and hides the grid |
| Who | The client. A soft-deleted client cannot sign in. An inactive client with orders still can |
| How | Cédula, Fecha de nac., and a one-time code to the phone on file. No password is stored. The attempt stores a keyed hash of laboratory, type, and number, plus the address. The log keeps a hash prefix, not the digits. Unknown cédula, a wrong Fecha de nac., no orders, a wrong type, and a soft-deleted client share one generic error |
| Reprint or send | Descargar informe writes `portal.download` and does not create a clinical result |

Sin verificar has no portal entry, and passes Pago only with the billing party’s complete cédula. See [../product/04-edges.md](../product/04-edges.md).

## Price, Saturday switch, and cost pools

| Question | Answer |
|---|---|
| Why | Every exam line needs a tariff, and the shell has a Saturday switch the invoice does not explain |
| When | Precio exámenes writes a price change immediately and audits it. Aplicar aumento general writes only after the operator sees the preview of the percent and the columns. The Saturday flag is read at the moment a line is priced and stored on that line |
| Where | Price matrix. Invoice line. Shell chip |
| Who | Administration edits. Reception reads Lista de precios and applies the column the line names |
| How | Five columns, one currency at a time, status word. Cost pools (insumos, salarios, reactivos) and Promedios pacientes/pruebas are separate records. Their formulas are **Unknown**, so they are not used to fill patient prices |
| Reprint or send | Imprimir lista records `price.print` and the filter values. A price change does not rewrite saved invoices |

## Registry masters

| Question | Answer |
|---|---|
| Why | Dropdowns on the invoice and bacteriology results need a stable list |
| When | Nuevo and Guardar on the registry |
| Where | Registry table. Invoice dropdowns show Activo rows only |
| Who | Administration writes, except the bacteriology lists, which the bioanalyst writes and administration reads. Reception reads médicos and empresas |
| How | Name plus status. Further fields **Unknown**. An order copies the display string at save time |
| Reprint or send | Renaming a physician changes the dropdown and leaves issued reports and saved orders with the previous string |

## User and session

| Question | Answer |
|---|---|
| Why | The shell shows who is working, and concurrent staff need a name on each write |
| When | Entrar, Clave, Cerrar sesión, Nuevo usuario |
| Where | Shell. Audit events. Procesado por |
| Who | Each person uses their own user. Administration creates users |
| How | Display name, one or more roles, password, Activo, and a license number for a bioanalyst. The password is never shown back and is never printed |
| Reprint or send | Session enter and leave are events. They are not on the clinical report |

## Audit and backup

| Question | Answer |
|---|---|
| Why | Corrections, reprints, sends, price changes, and backups have to be reconstructable after the visit |
| When | On the successful action named in each pattern. A failed send is also an event. A refused second save is an event |
| Where | Auditoría, as a fiscal report. Columns of the current program’s screen are **Unknown**. The new application’s columns and events are in [../product/09-audit-log.md](../product/09-audit-log.md) |
| Who | Administration reads Auditoría with clinical text masked, and identity changes shown. The bioanalyst reads the clinical events. A monthly summary goes to the owner and the lead bioanalyst. Every role generates the events for the actions they can perform |
| How | Event name, time, operator, record type, record id, and a short before/after when the action is a correction or a sensitive edit such as a phone or an email |
| Reprint or send | Viewing Auditoría writes `report.view`. The view does not change the events |

Events the patterns already name:

`session.enter`, `session.leave`, `patient.save`, `order.open`, `order.line.add`, `order.line.remove`, `payment.record`, `result.enter`, `report.issue`, `report.pdf`, `delivery.whatsapp`, `delivery.email`, `portal.login`, `portal.login.failed`, `portal.download`, `price.print`, `price.change`, `registry.create`, `registry.update`, `document.reprint`, `backup.run`, `report.view`, `report.print`, `report.export`. The full list, including release, correction, void, merge, and user events, is in [../product/06-access-control.md](../product/06-access-control.md).

Respaldo de la BD writes `backup.run` with operator and time. The file path, the engine, and the schedule are **Unknown**. A backup is a copy of the store. It is not a second place where staff edit patients.

## What is deliberately not a lifecycle yet

| Fact | Why it stops here |
|---|---|
| Sample tube, barcode, rejection | Only Fecha muestra is observed |
| Analyzer message and the instrument map | Advertised, not captured. The poster’s BC-20 and BS-240 are not registry rows |
| QR payload | Image not decoded |
| WhatsApp and mail providers | Buttons not pressed |
| Modificar valores | Object of the command is unknown, and the new app writes nothing from it |
| Estadísticas and Evolución de pacientes columns | Menus only |
| Payroll details inside Salarios de personal | The cost screen was not opened. It is not the user directory |

When a capture fills one of these, the matching section above gains the columns, and the label on those columns changes from **Unknown** to **Observed**.
