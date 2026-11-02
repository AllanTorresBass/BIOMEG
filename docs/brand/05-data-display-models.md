# Data display models

**Standard:** [03-documentation-standard.md](03-documentation-standard.md)  
**Patterns:** [04-display-patterns.md](04-display-patterns.md)

This page is the map from a stored fact to the pattern that shows it. It evaluates each model the laboratory already produces: the visit header, the exam line, the result text, the price matrix, the fiscal document, and the lists whose columns were never opened. The evaluation says what the screen is allowed to show, and where a model is too weak to drive a widget.

The relationship the printouts support is in [../data-model/README.md](../data-model/README.md): a laboratory template has many reports, a report is one order, an order is one patient and one convenio, an order has many sections, a section has many result lines.

## Model evaluation

| Model | What it can drive | What it cannot drive | Pattern |
|---|---|---|---|
| Patient and order header | The visit card and the report header | A split given-name and surname. Only one name string was printed and captured | Patient header card |
| Billing party | A second card: razón social, billing C.I., dirección | A claim that this party is always Registro de empresas | Billing card |
| Exam line on the invoice | Description, tariff choice, price column, currency, amount, status | A price printed on the clinical report. The report has no money | Line table |
| Result line | Four printed columns plus a Marca the new app adds | Analyzer id, method, previous value, who typed the cell. Those are absent from the row | Result grid |
| Reference text | A text cell, including two sexes in one cell | A mandatory numeric low and high for every analyte | Result grid |
| Price row | Five amount columns, one currency, a status word | A silent mapping onto Tipo de costo | Price matrix |
| Payment line | The instruments listed on the invoice | Cashea as a box. Cashea is a command and a sales report | Line table |
| Registry row | A name the dropdown can show | Addresses, licenses, and codes, until a form is captured | Registry table |
| Fiscal list | A titled, filtered, read-only table | Column schemas for unopened libros | Fiscal report |
| Sample | Fecha muestra on the order | Tube, barcode, rejection, aliquot | Worklist shows the date only |
| Validation | A release state and the releasing user | An electronic-signature block. One public template asks for a wet stamp | Status chip and Procesado por |
| Delivery | Channel, destination field, time, operator | The WhatsApp provider and the message body. The buttons were not pressed | Issued report actions |
| Audit | An event the new app writes | The rows inside the current Auditoría screen. That screen was not opened | Fiscal report, once a capture exists |

## Patient and order, as shown

The person is saved in Clientes. The invoice and the report show that client. They do not create a second person when the cédula already exists. **Design rule.** See [../product/02-client-flow.md](../product/02-client-flow.md).

**Observed** labels and the pattern that carries them.

| Fact | On the invoice | On the clinical report | Model rule |
|---|---|---|---|
| Nombre y apellido | One box | `PACIENTE` | One string. The card and the report use the same string |
| C.I. | Box plus a dropdown whose options were not opened | `C.I.` as digits on the October print | **Design rule:** type plus digits, or Sin verificar when both are empty. A half pair is refused. Display `V-12.345.678` |
| Fecha de nac. | On the invoice | Not in the preview header | Card only. Empty until entered |
| Edad | Separate box, was not calculated | `EDAD` in years | **Design rule:** computed from birth date and fecha muestra, shown on the card and printed. Stored age is a cache |
| Sexo | Dropdown, empty | `GÉNERO`. Masculine, feminine, or blank on the samples. The report still exists when it is blank | Masculino, Femenino, or blank. No third value. See [../product/04-edges.md](../product/04-edges.md) |
| Teléfono | On the invoice | Printed, `+58` shape on the samples | Same field for the report and for WhatsApp, until a second phone is captured. The sameness is what the invoice-plus-preview pair supports |
| Email | On the invoice | Not printed | Card and the Enviar correo destination. Off the paper |
| Motivo | On the invoice | Not printed | Card only |
| Médico | Dropdown | Not in the BIOMEG preview header | Card only. The list is Registro de médicos |
| Convenio | Company path via razón social and Ingreso empresa | One value. On the BIOMEG preview, a company name | One convenio per order. Class versus company is not collapsed. See [../data-model/convenio.md](../data-model/convenio.md) |
| Fecha muestra | Session date on the preview | Printed | Order header |
| Fecha reporte | Same day on that preview | Printed on Template A | Set at the first Liberar and updated by each later Liberar of that order. The new app allows it to differ from the sample date, because the two labels already exist |
| N° orden | Preview showed `0001` | Zero-padded short integer | Assigned at first save. Read-only after that |
| Factura N°, Control N° | Invoice only | Not on the clinical page | Billing card |

## Result line, as shown

The printed cell is text. **Observed** shapes include decimals with a comma, integers, `NEGATIVO`, `POSITIVO (+++)`, `1-3 XC`, and words such as `ESCASAS`. A numeric column alone cannot display those rows. The grid’s Resultado editor accepts text. When the reference is a closed range and the result parses as a number, the application fills Marca.

| Display question | Rule |
|---|---|
| Where does the flag sit? | Column Marca, word `ALTO` or `BAJO`, semantic background, icon |
| What if the reference lists HOMBRE and MUJER? | The cell prints both, as the hemoglobin line did. Marca is not auto-picked from sex in that case. The bioanalyst can set Marca |
| What if sex is blank? | The reference text still prints. Marca stays manual |
| What if the unit is a dot or blank? | The column remains. The cell shows the dot or stays empty |
| What if a section has no rows? | The section is omitted on screen and on paper. The order chip lists it under `INCOMPLETO` |
| Where is the previous result? | Nowhere, until Evolución de pacientes is captured. The grid shows the current value. A correction audit holds the prior text, and that prior text is visible from the row’s history action. **Design rule** |

Section order is the observed clinical order. Panel headings (`HEMATOLOGIA COMPLETA`, `QUIMICA SANGUINEA`, `PERFIL LIPIDICO`, and the others in the exam note) are heading rows. They are not priced as analytes unless the catalog stored them as orderable exams.

## Price and cost type, as shown

Two lists exist. They overlap and they are not the same list. **Observed.**

| Invoice, Tipo de costo | Price matrix column |
|---|---|
| Rutina | No column of this name |
| Seguro/Empresa | No column of this name |
| Emergencia | Emergencia |
| Hospitalizado | Hospitalizado |
| — | Particular |
| — | Aliados |
| — | Estatal |

**Design rule.** The invoice shows both the tipo de costo and the price column applied to each line. The application ships with no default mapping. A maintenance table may later store an explicit pair (tipo de costo → column). Until that pair is saved, the operator chooses the column, and a line without a column shows `SIN PRECIO`. Once it is saved, choosing another column needs a confirm and a motivo at reception.

Saturday price is a switch for the whole laboratory. **Observed** as Precio sábado: INACTIVO on a Friday capture. **Design rule:** each priced line shows `Precio sábado` or `Precio ordinario`, so the switch is visible on the line that used it.

Currency is a filter on the matrix and a pair of totals on the invoice (Total Bs, Total USD). The rate on the shell is copied onto the totals. IGTF sits with those totals, labeled as the tax on the foreign-currency payment. The October form showed IGTF and did not show the rate it would use.

## Payment, as shown

| Instrument | Fields on the invoice | Display |
|---|---|---|
| Efectivo USD | Amount | Payment line |
| Zelle | Amount | Payment line |
| Efectivo Bs | Amount | Payment line |
| T. débito | Amount | Payment line |
| T. crédito | Amount | Payment line |
| Pago móvil | Amount and a dropdown | Payment line. Dropdown options **Unknown** |
| Transferencia | Amount and a dropdown | Payment line. Dropdown options **Unknown** |
| Banco, Refer. | Beside the electronic methods | Columns on those lines |
| Cashea | Not a box | Command Cobros Cashea and report Ventas por Cashea |

Abono and Resta are totals, not instruments. Agregar abono writes an abono against the invoice and updates Resta.

## Documents that are stored because they can be reprinted

**Observed** as separate commands for the original and the copy: factura, nota de crédito, nota de débito, retenciones, orden de entrega, orden empresa.

| Document | Issue pattern | Reprint pattern |
|---|---|---|
| Factura | Billing card + line tables | Fiscal report of the stored factura, action Re-imprimir, watermark `COPIA` |
| Nota de crédito, nota de débito | A line table of adjustments against one factura | Same, with `COPIA` |
| Retención | Fields **Unknown**. The command exists, including ISLR types and IVA and ARCV outputs | Reprint does not create a second fiscal document |
| Orden | The visit | Re-imprimir orden de entrega and Re-imprimir orden empresa |

**Design rule:** a reprint stores who printed, when, and which document number. It does not allocate a new factura number or a new control number.

## Models that stay closed

These commands are real. Their internal columns are **Unknown**, so the display model is the fiscal-report or registry shell and nothing more.

- Hoja de trabajo, beyond the five minimum columns in the worklist pattern.
- Trasladar paciente. Its destination is **Unknown**, and the command is blocked.
- Modificar valores. The object (prices, references, or results) is **Unknown**, so the command is not given an editor.
- Evolución de pacientes, Estadísticas, and every unopened flyout under Reportes.
- Bacteriology masters beyond a name.
- Cost pools (insumos, salarios, reactivos). The menu proves three pools and an average. It does not prove a formula. The screens are fiscal reports with **Unknown** columns. Promedios pacientes/pruebas does not display a computed average until the formula is known.

## Why the display refuses a few common shortcuts

| Shortcut | Why the model rejects it |
|---|---|
| Hide the other sex’s reference | The BIOMEG preview’s hemoglobin and hematocrit cells, and one public hemoglobin line, print both |
| Treat age as entered | The invoice has a birth date and a separate age that did not fill |
| Treat a red result as flagged | The preview uses color and no flag column |
| Treat an empty chemistry header as “not ordered” | The preview printed the header with no rows on a partial order |
| Treat Tipo de costo as the price column’s name | The two lists differ |
| Treat the logo’s RIF as the live fiscal id | The artwork and the preview transcription disagree. The laboratory record is the source. See [01-palette.md](01-palette.md) |
