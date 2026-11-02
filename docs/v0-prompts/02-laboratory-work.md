# Stage 3: Laboratory work and delivery

[Back to the catalog](README.md)

This is the clinical core. Results are text, Liberar is the central professional act, and an unreleased value must never reach reception or the client.

Before using real data, the lead bioanalyst must confirm per-section release, auxiliary entry, self-entered values, Fecha reporte, and `SIN PRECIO` not blocking Liberar.

## V0-11. Hoja de trabajo

**Attach:** `brand/04-display-patterns.md` (Worklist), `session/hoja-de-trabajo.md`.

```text
Build Hoja de trabajo at /hoja-de-trabajo, following docs/FEATURE_TEMPLATE.md, using the Worklist pattern. Roles: Auxiliar and Bioanalista see the full list. Recepción sees status only, scope status_only, with no clinical values. Administración has no access.

Date filter defaults to the session date. Columns, and only these: N° orden, Paciente, Convenio, Fecha muestra, Estado (a chip: ABIERTA, INCOMPLETO, LIBERADO, or EN_CORRECCION), and a chip for Status de impresión (Sin imprimir or Impreso). Add no tube, barcode, or sample-status columns: those are Unknown.

Corrections left open stay listed. Filter or badge orders flagged for bioanalyst review. For Auxiliar and Bioanalista, a row opens Cargar resultados. For Recepción, a row opens nothing.

Empty: "Sin órdenes para esta fecha." Single: one row with the header kept. Error: keep the previous rows and show "No se pudo actualizar." No permission: BLOQUEADO.
```

**Check:** As Recepción, no result value is reachable, including through the response data of the page.

## V0-12. Result grid and Cargar resultados

**Attach:** `brand/04-display-patterns.md` (Result grid), `brand/05-data-display-models.md` (Result line), `brand/06-edge-cases.md` (Results), `data-model/exam-and-result.md`, `data-model/reference-interval.md`, rows R-042 to R-045 and E-26 to E-29.

```text
Build the result grid and Cargar resultados at /ordenes/[id]/resultados, following docs/FEATURE_TEMPLATE.md. Full page width. Wrap the grid in ErrorBoundary.

REGIONS. Read-only patient header card that stays put. Order chip with N° orden, Fecha muestra, Fecha reporte, and the state. Sections in clinical order, where a heading spans the grid and has no result cell. Then rows. The operator can filter to one section, and this doesn't change stored order.

COLUMNS: Descripción del examen, Resultado, Unidades, Valores de referencia, Marca. Inside a section, catalog order holds. A calculated name (V.C.M., LDL-COLESTEROL) is a normal row with no formula badge and no calculation.

RESULTADO is TEXT. It stores what is typed: 12,7, NEGATIVO, POSITIVO (+++), 1-3 XC. Never force it to a float. The value is never under 14px. It writes when the operator leaves the cell, and writes result.enter with source teclado. For an analyte marked numeric, a non-numeric entry shows "El resultado no es un número." and the previous stored value remains.

The first stored result moves an ABIERTA order to INCOMPLETO.

VALORES DE REFERENCIA is text and prints exactly as stored, including HOMBRE and MUJER together. Never hide the other sex's range. Never strip a unit repeated from the Unidades column. A dot or blank stays as is.

MARCA is ALTO, BAJO, or blank, with the chip colors and an icon. The word is what matters.
Fill it automatically only when ALL hold: the reference is a single closed numeric range, the result parses as a number, and the client's sex is not blank. Otherwise it stays blank unless the bioanalyst sets it. Both sexes in the cell: manual. One-sided, age word, or sentence: manual. A failed parse leaves Marca blank and the text as stored. Store Marca with the line. An in-range row has a blank Marca and plain primary text, never green and never a chip. Qualitative rows are never colored by matching words.

WHO MAY WRITE.
- Auxiliar and Bioanalista: an empty cell, or their own typed cell, before release.
- Overwriting another person's value or an analyzer's value: Bioanalista only, with a motivo.
- Recepción reads nothing before LIBERADO or during a correction. After release, it reads only.
- Administración never sees values. Direct access gives BLOQUEADO and no values.

CONFLICTS. Each cell has a version check. The second writer sees "guardado por [usuario] a las [hora]" with both values, and writes result.conflict.

ANALYZER. No real connection, because the protocol is Unknown. Add a demo-only fake, using system role Sistema: analyzer, which feeds one value. On an empty or analyzer-owned cell it writes with source equipo. On a typed cell, the typed value stays and the incoming value waits beside it for the bioanalyst to resolve. After release it's refused from the result, queued, and shown as a discrepancy.

OBSERVACIONES is an optional note per section of this order. It's not the home screen's Nueva observación list. Agregar nota de bacteriología is available to the bioanalyst only on an order with a bacteriology section. Otherwise the action explains that and writes nothing.

STATES.
Empty: patient card, order chip, "Sin resultados." and no section headings.
Partial: a section with no rows is OMITTED, and the chip reads INCOMPLETO and names it: "Química sanguínea: sin resultados". Never render an empty section's headers.
An empty section is never stored as a blank result.
```

**Check:** Try each of these:
- A high number with a blank-sex client: Marca stays blank.
- A both-sexes reference: Marca stays blank.
- `POSITIVO (+++)`: it saves as typed.
- An order with an empty chemistry section: the heading doesn't appear.

## V0-13. Liberar per section

**Attach:** `product/02-client-flow.md` (After the order), rows R-046, E-25, E-30, E-35, E-36, and the Decisions table in `product/06-access-control.md`.

```text
Add Liberar to the result grid. Bioanalista only.

A release bar pinned to the bottom of the card, not to the viewport. Liberar works per section, with checkboxes for sections with state CARGADO. One password re-entry covers the selected batch. It is NOT an electronic signature, so never label it as one.

On success: those results become LIBERADO and frozen, Procesado por is the releasing user's display name, Fecha reporte is written at the first Liberar and updated by each later Liberar of the order. The order becomes LIBERADO when every section is, and stays INCOMPLETO otherwise. Writes result.release. Cells become read-only.

Rules:
- Requires a signed-in user, so Procesado por can never be empty.
- A SIN PRECIO line does not block Liberar. Money owed does not block it either.
- A bioanalyst may release values they typed. This is allowed, recorded, and listed in a report. There is no second reviewer.
- Two bioanalysts releasing at once: the first succeeds and the second is told. Procesado por is the first.
- Bioanalyst absent, patient waiting: no override exists. Do not add one.
- A failed re-entry writes step_up.failed and releases nothing.

Row history: an action on a released row, showing prior text, new text, operator, and time from the audit trail. Add no previous-result column.
```

**Check:**
- No other role can release, even by calling the action directly.
- The page doesn't use the word "firma".
- A `SIN PRECIO` line releases normally.

## V0-14. Liberar corrección

**Attach:** `product/04-edges.md` (Liberar corrección), rows R-047 to R-049, E-31 to E-34, and Record states in `product/06-access-control.md`.

```text
Add corrections for released results. Bioanalista only. A correction works on one released section.

OPEN: password re-entry and motivo. The section's results move to EN_CORRECCION. A fully released order moves to EN_CORRECCION with them. An INCOMPLETO order stays INCOMPLETO. The prior text is captured. Writes result.correct.open.

WHILE OPEN:
- Portal and QR page read "En revisión" and show no grid.
- Sends are refused. Enviar is hidden.
- Recepción can't read the values.
- The correction stays listed on the worklist if abandoned.

EDIT OR CANCEL: no password. Cancel restores the released text with no new version, and writes result.correct.cancel.

RELEASE: password re-entry. In one transaction: the results return to LIBERADO as a new version; a new issue is created at once; the old issue becomes REEMPLAZADO; a resend task is created from the earlier deliveries. Writes result.correct.release, report.superseded, and delivery.resend.task. A different bioanalyst may do it: Procesado por becomes the new one, and the trail keeps both.

Add an Issue record with states VIGENTE and REEMPLAZADO. The old PDF is not deleted or altered.

Previous and new text, motivo, operator, and time are in the audit history, and visible in row history. Administración sees clinical before-and-after text masked.
```

**Check:** Run the whole cycle and confirm the following:
- Open a correction, and the portal stops showing a grid.
- Release it, and a new issue exists and the old one reads `REEMPLAZADO`.
- A resend task appears.

## V0-15. Issued report, preview, PDF

**Attach:** `brand/04-display-patterns.md` (Issued report), `brand/02-brand-style.md` (Print).

```text
Build the issued report. It's a document, separate from the screen chrome. Build an on-screen preview and a server-rendered PDF from the same data and the same layout component rules.

PAPER, in order:
1. Laboratory block: the full lockup from report-header.png on white, the RIF from the laboratory record as data, and at the upper right a QR only if the QR setting is ACTIVO. Inactive removes the code and leaves the rest of the page. Do not retype the wordmark. Do not edit the logo.
2. Patient and order block, these exact labels and no others: PACIENTE, C.I., EDAD, GÉNERO, TELÉFONO, CONVENIO, FECHA MUESTRA, FECHA REPORTE, N° ORDEN. Email, birth date, médico, and motivo are NOT printed. A blank sex prints GÉNERO with a blank value.
3. Result grid: DESCRIPCIÓN DEL EXAMEN, RESULTADO, UNIDADES, VALORES DE REFERENCIA, MARCA. ALTO or BAJO prints as a word next to the value, and the fill is optional and never needed for the meaning. A section heading with no rows is omitted. Both-sex reference text prints in full.
4. Page mark: "1 de 1", or "2 de N" when the grid flows. The footer carries the page count and the RIF.
5. Procesado por: the releasing user's display name. If different bioanalysts released different sections, show a name per section.
6. Only if the value check deployment setting is on: Código de consulta, near the QR, and never inside it.

No money or fiscal numbers on this page. No SICOEXC credit. Black and white printing must keep every meaning.

CHROME around the preview, above the paper, not part of the PDF: Generar PDF, Enviar WhatsApp, Enviar correo, Salir. Actions are next prompt.

The patient card stays above the scroll on this screen.

COMMANDS.
- Imprimir por paciente: every section with rows. Imprimir prueba individual: one analyte and its heading. Bioanalista, and Recepción only when Liberado.
- Generar PDF stores the file on the order, with its printed values. Later edits to the client never rewrite it: a rename, a birth-date change, or a correction leaves it unchanged. Writes report.pdf and report.issue.

STATES.
Empty: refuse with "Sin resultados para emitir."
Partial: only a Bioanalista generates a draft. A banner INCOMPLETO crosses the top of the paper, listing the missing exams, and the draft is watermarked. Recepción is refused a draft.
Error: keep clinical values unchanged. PDF generation can be retried.
```

**Check:** Print to grayscale:
- `ALTO` still reads.
- Email and birth date are absent.
- Compare the labels with `session/print-preview.md` yourself. Do not attach that page.

## V0-16. Delivery and resend

**Attach:** rows R-110 to R-115, E-24, E-38, E-46 from `product/06-access-control.md`, `brand/08-data-lifecycle.md` (Delivery), `brand/06-edge-cases.md` (Sending an incomplete order).

```text
Wire the preview actions. Real WhatsApp and email providers are Unknown, so build a DeliveryProvider interface and a fake that records and can be told to fail. Never call a real service and don't add a provider SDK.

ENVIAR WHATSAPP / ENVIAR CORREO. Recepción or Bioanalista with a confirm that shows the destination. WhatsApp uses Teléfono. Correo uses Email. Enabled when the order is LIBERADO. Hidden during a correction. Stores channel, destination, time, operator, order number, and whether the order was incomplete, BEFORE the send is called complete. Writes delivery.whatsapp or delivery.email. Message body: plain Spanish, with the order number and the laboratory name as text. Email uses email-header.png.

MODE. A setting says whether the portal's code works. If it does, and the client can use the portal, the message is a link to Ingresar, with no token, order detail, or attachment. Otherwise it's an attachment, and only with recorded consent. Consent sits on the client card, by channel, with the operator and the time, and can be withdrawn. Without it, refuse with STATE (E-62). The file name holds the order number and no person's name. For a resend by attachment, say that the earlier report was replaced. Store the mode on the delivery row.

A second send is a new delivery row and does not erase the first.

A failed send stores the failure, leaves the order as it was, and shows "El envío no salió. La orden sigue guardada."

INCOMPLETE. Enviar stays hidden until a Bioanalista approves "Enviar incompleto" with a password re-entry. The dialog names the missing sections, creates a ready-to-send item, and writes delivery.incomplete.approved. Then Recepción or Bioanalista sends with a confirm that repeats the missing sections. Recepción can never approve.

RESEND. After a correction, a task lists earlier deliveries. Recepción or Bioanalista resends with a confirm.

SENDER. As the Sistema: sender role, it reads the file for one approved delivery and writes its result, nothing more.

A company asking for an employee's result gets nothing through the application. Add no company access.

A delivery list on the order shows channel, destination, time, operator, and result.
```

**Check:**
- Force a failure and confirm the order is unchanged.
- As Recepción on an incomplete order, confirm no way to approve exists.
- Confirm nothing calls an external service.
