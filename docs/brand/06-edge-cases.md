# Edge cases

**Standard:** [03-documentation-standard.md](03-documentation-standard.md)  
**Display:** [04-display-patterns.md](04-display-patterns.md)

Each case below was seen, or was left open, in the 30 October 2026 session and the data-model notes. The rule is how the new application shows it. The current program is the evidence, not the specification.

## Intake and identity

### Birth date must be entered

**Observed.** A blank invoice shows Fecha de nac. `07/10/2012`, and Edad stays empty. Saving without editing the date would store a false birth date. See [../session/gaps-and-edge-cases.md](../session/gaps-and-edge-cases.md).

**Design rule.** A new client leaves Fecha de nac. empty. Guardar in Clientes refuses a client whose birth date is still empty, with “Indique la fecha de nacimiento.” The application never writes 7 October 2012 on its own. A missing cédula does not refuse this save. The client is marked Sin verificar, and Pago refuses that client until the cédula, or the billing party’s complete cédula, is present. See [../product/04-edges.md](../product/04-edges.md).

### Age is shown from the birth date

**Observed.** Edad is a separate empty box and did not fill from the prefilled date. The report prints age as years.

**Design rule.** Edad on the card and `EDAD` on the report are computed from Fecha de nac. and Fecha muestra. Under two years the card shows months. The figure updates when either date changes. A stored age may be cached for the print file. If the birth date is corrected later, the card recomputes, and a released report keeps the age it printed, with the correction visible in the audit history.

### Sex may be blank

**Observed.** Template B reports left sex empty and still printed. The invoice dropdown can be empty.

**Design rule.** Sex is optional. The only values are Masculino, Femenino, and blank. MediLab’s third value is not used. The card shows an em dash when sex is blank. The report prints `GÉNERO` with a blank value. Reference text is unchanged. Automatic Marca does not run off a blank sex. The full client rules for merge, deactivate, the 30-day delete, and the portal are in [../product/04-edges.md](../product/04-edges.md).

### One name string

**Observed.** Nombre y apellido is one box. The report prints `PACIENTE` as one string.

**Design rule.** The card uses one field. A transfer or a modification edits that string. Issued reports keep the string they were issued with.

### Particular and Empresa stay separate paths

**Observed.** Toolbar and Pacientes both split Ingreso particular and Ingreso empresa. Tipo de costo is a second choice on the same invoice: Rutina, Seguro/Empresa, Emergencia, Hospitalizado.

**Design rule.** Ingreso particular and Ingreso empresa both open Nueva orden at the Cliente step. Particular starts with no convenio. Empresa requires an active convenio before Pago. Tipo de costo is still chosen on the order and is not implied by which toolbar button was used. How the current program combines them was not shown. The new screen shows both choices at once.

### Modify and transfer stay separate

**Observed.** Modificar pacientes and Trasladar paciente are different commands. Neither form was opened.

**Design rule.** Modificar opens the patient header card for an existing person and writes `patient.save`. Trasladar is blocked for everyone until a capture names the destination, which is **Unknown**. It does not offer invented targets such as “another branch.”

## Results

### Color is not the flag

**Observed.** At least one result on the BIOMEG preview is red. There is no high/low column. A monochrome copy can lose the signal.

**Design rule.** Marca prints `ALTO` or `BAJO` in words, with the semantic fill and an icon. In-range rows have an empty Marca. Qualitative rows are not painted high or low by color matching.

### An empty section does not print

**Observed.** QUIMICA SANGUINEA printed its four column headers and no rows, on an order that did have hematology results.

**Design rule.** A section with no result rows is omitted from the grid and from the paper. The order chip and the draft banner list it: “Química sanguínea: sin resultados.” Status is `INCOMPLETO`.

### Sending an incomplete order is explicit

**Observed.** The preview can be opened on a partial order. The delivery buttons are on that preview. They were not pressed.

**Design rule.** Generar PDF on an incomplete order produces a draft with the banner `INCOMPLETO`. Reception can send only after a bioanalyst approves with a password re-entry. Enviar WhatsApp and Enviar correo ask for a confirm that repeats the missing sections. The event stores that the send was incomplete.

### Both sexes may appear in one reference cell

**Observed.** Hemoglobin and hematocrit on the preview include HOMBRE and MUJER ranges in the same cell, and the patient’s sex is also printed.

**Design rule.** The reference cell prints the stored text, including both branches. The application does not hide the other sex’s range. When the text is a single closed numeric range, Marca can be computed. When both sexes are in the cell, Marca stays blank until a bioanalyst sets it.

### Reference text is not a pair of numbers

**Observed.** Cells contain one-sided limits, age words, interpretations (“Favorable menor de 4.5”), units repeated inside the cell, and dots.

**Design rule.** The column is text. Parsing runs only for Marca, and only on a closed range. A failed parse leaves Marca blank and leaves the text as stored.

### Calculated names look like any other row

**Observed.** `V.C.M.`, lipid ratios, globulin, and indirect bilirubin print in the same four columns. The page does not say they were calculated.

**Design rule.** The grid does not badge them as formulas. A later formula engine may fill the cell. The display stays a result line.

### Released results change through a correction

**Observed.** The report shows the current value. Procesado por can be empty on public templates. No previous-result column exists.

**Design rule.** After `LIBERADO`, cells are read-only. Liberar corrección asks a bioanalyst for a password re-entry and a motivo, writes the prior text into the audit event, opens En revisión, and then allows the edit. Releasing it replaces the issue and creates a resend task. The row history shows prior text, new text, operator, and time. Evolución de pacientes, the menu command, stays a separate report and is still **Unknown** in its columns.

## Money

### Price column and tipo de costo are both visible

**Observed.** The lists differ. Emergencia and Hospitalizado appear in both. Particular, Aliados, and Estatal are only on the price list. Rutina and Seguro/Empresa are only on the invoice. The invoice does not show which column it used.

**Design rule.** Each exam line shows Tipo de costo and Columna de precio. There is no implicit mapping. `SIN PRECIO` blocks the fiscal issue. It does not block Liberar.

### The rate used is on the total

**Observed.** The shell showed Tasa BCV `889,26`. The invoice totals include IGTF and both currencies. The form does not show that it used `889,26`.

**Design rule.** The totals card prints the rate and the words “tasa usada en este total.” A later rate change on the shell does not rewrite a saved invoice. The invoice keeps the rate it stored. The shell chip is the rate for new documents.

### A missing control number reads Pendiente

**Observed.** Control N° is an empty box beside Factura N° on the blank form. How it is assigned was not shown.

**Design rule.** After save, Factura N° shows the assigned number. Control N° shows a number or the word `Pendiente`. Issue to the patient of a fiscal copy is refused while the control number is pending, with “Falta el número de control.” The clinical report does not carry either number.

### Zero is not the same as an empty price

**Observed.** The blank invoice totals are zero because nothing has been charged. The price list’s amounts were not copied into the notes. A status `No disp.` exists inside a Disponible filter.

**Design rule.** An untouched price cell is `SIN PRECIO`. A stored zero displays `0,00`. A `No disp.` row inside a Disponible filter remains visible with the caption “Excepción en el filtro.”

### Saturday price covers the whole laboratory, and the line says so

**Observed.** Precio sábado is a shell switch, INACTIVO on that Friday. What the Saturday price changes was not shown.

**Design rule.** The shell chip states “Aplica a todo el laboratorio.” A calendar can turn it on, and Administración keeps the manual switch. Each priced line on an invoice opened while the switch is Activo shows `Precio sábado`. Lines priced while it was Inactivo keep `Precio ordinario` if they are reopened. The application does not describe a Saturday formula it has not been given.

### Reprint is a copy

**Observed.** Nota de crédito and Re-imprimir nota de crédito are both commands, and the same pair exists for debit notes, invoices, retentions, and orders.

**Design rule.** The issue action allocates the document. The reprint action opens the stored document, marks the paper `COPIA`, and writes `document.reprint` with the operator and the time. It does not allocate a new number.

### Cashea stays a command until the payment list shows it

**Observed.** Cobros Cashea and Ventas por Cashea exist. The blank invoice’s payment boxes are cash, Zelle, debit, credit, pago móvil, and transfer. Forma de pago was not opened.

**Design rule.** The payment line table lists the observed instruments. A Cashea line appears when an operator selects Cashea from Forma de pago, after that option is confirmed to exist. Until then the catalog points staff to Cobros Cashea for collections and to Ventas por Cashea for the report.

### Abono does not close the invoice by itself

**Observed.** Totals include Abono and Resta. Agregar abono is a command.

**Design rule.** An abono increases Abono and reduces Resta. The invoice remains open while Resta is not zero. Cierre de caja lists open invoices separately from paid ones.

## Session switches and unopened tools

### QR off means no code

**Observed.** The shell said QR: ACTIVO and the preview carried a QR. Mantenimiento has a QR command. The payload was not decoded.

**Design rule.** Inactivo removes the code from the preview and the PDF and leaves the rest of the page. Activo places the code at the upper right. The verification page shows order number, laboratory name, report date, release state, and whether the issue was replaced. It does not add a cédula or a phone on the strength of an unread image. It says that it doesn’t confirm the printed values.

### Modificar valores has no editor yet

**Observed.** The command exists under Mantenimiento. The name does not say whether it edits prices, reference text, or results.

**Design rule.** The menu item opens a blocked panel: “Este comando no tiene una pantalla capturada. No cambia precios, referencias ni resultados.” Price edits go through Precio exámenes. Result edits go through the result grid. Reference-text edits stay closed until a screen shows them.

### Cut-off labels stay cut off

**Observed.** Generar relación de paciente is cut at the edge of the menu. A few report labels are slightly cut and still readable.

**Design rule.** The catalog and the menu use “Generar relación de paciente” and do not complete the phrase. Other labels that were readable despite a tight crop use the readable words (Lista de inventario de reactivos, Libro de compras, Órdenes de compra).

### Two closes

**Observed.** Cierre de caja is on the toolbar and under Administrativo. Cierre mensual is a further command.

**Design rule.** Cierre de caja closes the session day’s payments for the signed-in user and shows Total USD, Total Bs, the rate, and Resta still open. Cierre mensual is a month action and does not silently run the daily close. Administración can close an absent user’s drawer, with a motivo. Neither screen was opened, so their extra fields are **Unknown**. The totals above are the minimum the invoice already contains.

### Backup and audit exist as commands

**Observed.** Respaldo de la BD and Auditoría are maintenance commands. Engine, path, schedule, and the audit columns are **Unknown**.

**Design rule.** Respaldo asks for a password re-entry and writes `backup.run` with the operator and the time. It does not claim a path. Auditoría opens a fiscal report. The columns of the current program’s screen are **Unknown**. The new application’s columns and events are in [../product/09-audit-log.md](../product/09-audit-log.md).

### Concurrent edits

**Observed.** Several roles use the system at the same time. Record locking is not defined. See [../modules/users-and-concurrent-work.md](../modules/users-and-concurrent-work.md).

**Design rule.** The second save of the same order shows “Esta orden fue guardada por [usuario] a las [hora].” and reloads that version. The losing edit is not written. The message names the other user because the shell already shows Usuario activo as a shared fact.

## Version banner

**Observed.** The wallpaper advertises version 10. The services page says 9.0. The title bar does not state the running build.

**Design rule.** The shell shows the running application’s version in the caption under the user name. A marketing banner is not a version. The October advertisement is not copied onto the new shell.
