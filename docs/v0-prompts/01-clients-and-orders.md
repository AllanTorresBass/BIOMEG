# Stage 2: Clients and orders

[Back to the catalog](README.md)

The client is a master record that exists before any order. Getting this wrong creates duplicate people, so the edge cases are written out in full.

## V0-06. Clientes: list, card, create

**Attach:** `product/02-client-flow.md`, `product/04-edges.md` (Identity), `brand/04-display-patterns.md` (Patient header card).

```text
Build the Clientes screen at /clientes, following docs/FEATURE_TEMPLATE.md. Actor: Recepción creates and edits. Bioanalista and Administración read. Auxiliar reads only clients on their worklist. All through decide().

LIST. Search matches nombre or cédula. A row: name, cédula or the chip Sin verificar, Fecha de nac., Edad, status. Inactive clients are hidden unless Incluir inactivos is on (Recepción, Administración). Soft-deleted clients never appear, even with that filter.

CARD. White, 16px padding, 8px radius, a 2px burgundy rule under the title. Fields in this order: Nombre y apellido (one string, never split), C.I. (a type dropdown V, E, J, P, G and a digits field), Fecha de nac., Edad (computed, read-only), Sexo (Masculino, Femenino, or blank, no third value; blank shows an em dash), Teléfono, Email.

Empty state: Crear cliente stays disabled until Nombre and Fecha de nac. are filled. Fecha de nac. is NEVER prefilled, and there is no default date anywhere. Email stays on the card and never prints on the clinical report.

VALIDATION, on the server, in this order. Each refusal stores nothing new:
- Empty name: refused.
- Birth date empty: "Indique la fecha de nacimiento."
- Half a cédula pair (type without number, or number without type): refused. Both empty is valid, and the client is marked Sin verificar. A complete pair is marked Verificado.
- Number under 6 or over 10 digits: refused. Store digits only, without dots or hyphens. A pasted V-12.345.678 fills both fields. Typing a number still requires choosing the type.
- P-01, unique cédula: a second active or inactive client with the same type and number shows "Ya existe un paciente con esta cédula." and offers the existing client. A soft-deleted cédula does not block. Confirmation can never bypass this.
- P-03, similar name: at trigram similarity 0.85 or more on the normalized name, show the similar clients and a confirmation that this is a different person. Save only after confirmation, and record the confirmation. An exact cédula match never enters this path.

Save writes patient.save.

TWO SAVERS. Use a version check. The second save is refused, shows "[nombre del cliente] fue guardado por [usuario] a las [hora]." under pendingReview, and reloads the first version.

STATES. Empty list with an action to create. Single row keeps the header. Error keeps what the operator typed. No permission: BLOQUEADO and no values.

Build an action "Nueva orden" on the card, which goes to the order flow with this client selected. The flow itself comes later.
```

**Check:**
- Try saving with no birth date, half a cédula, and a five-digit number.
- Try the same cédula twice, and a nearly identical name.
- Confirm no date is prefilled.

## V0-07. Modify, correct, deactivate, delete, merge

**Attach:** `product/04-edges.md` (Change, merge, deactivate, delete), `product/06-access-control.md` rows R-011 to R-022, and the Clients edge cases E-16 to E-24.

```text
Add client lifecycle actions to Clientes. All go through decide() with the gestures from the matrix.

MODIFICAR (Recepción). Writes patient.save.
- Once any order exists, including a voided one, changing the type or number is refused: "No se puede cambiar la cédula de un paciente con órdenes registradas." Name, phone, email, sex, and birth date can still change.
- A rename updates the master and orders not yet issued. An issued PDF keeps its printed name.
- Changing Fecha de nac. or sex after a result: Recepción with a confirm, Bioanalista with no gesture. It flags the order for bioanalyst review, recalculates age on screen, and a released report keeps its printed age.
- Changing phone or email after Liberar: Recepción with a confirm. Stores the before and after.

CORREGIR CÉDULA (Administración, password re-entry and motivo). Shows the current and the new cédula. Refuses a cédula another client holds. Updates the master and unissued orders. The audit row keeps both. Issued documents keep what they printed.

DESACTIVAR (Recepción or Administración, confirm). Hides the client from search and from Nueva orden. Running it again changes nothing. The portal still opens for that client. Writes patient.deactivate.

ELIMINAR (Administración, confirm). Refused when an order falls in the last 30 days: "No se puede eliminar: órdenes en los últimos 30 días." Otherwise soft delete: inactive plus a deleted time. Orders stay. There is no hard delete anywhere. Writes patient.delete.

SOLICITAR FUSIÓN (Recepción). Asks Administración to act, and merges nothing.

FUSIONAR (Administración, password re-entry). Asks to retype the surviving client's name.
- Refuse: two complete, different cédulas; a retyped name that does not match; merging a client with itself; a missing client.
- Allowed, and the usual case: one row has no cédula.
- Moves orders to the surviving id, copies its name and cédula onto them, soft-deletes the source in the same action, and stores a map of the moved orders. Writes patient.merge naming both ids.

DESHACER FUSIÓN (Administración, password re-entry and motivo). Restores from the stored map. Portal access is cut until it finishes. Writes patient.unmerge.

TRASLADAR PACIENTE stays blocked for everyone: show the title and BLOQUEADO. Offer no destinations.

Rights are rechecked on each request, so a merge during an open portal session takes effect at the next request.
```

**Check:**
- As Recepción, Fusionar and Eliminar aren't available, and calling them directly is refused.
- Merge two complete, different cédulas: it must refuse.
- Undo a merge and confirm the orders return.

## V0-08. Nueva orden: Cliente and Exámenes

**Attach:** `product/02-client-flow.md`, `product/04-edges.md` (Visit attachment), `brand/04-display-patterns.md` (Patient header card, Billing card, Line table), `brand/05-data-display-models.md` (Price and cost type), `session/facturacion.md`.

```text
Build Nueva orden at /ordenes/nueva, following docs/FEATURE_TEMPLATE.md, as a four-step flow: 1 Cliente, 2 Exámenes, 3 Personal, 4 Pago. Build steps 1 and 2 now. Ingreso particular and Ingreso empresa both open it at step 1. Particular starts with no convenio. Empresa requires an active convenio before Pago can be saved. Tipo de costo is chosen on the order and never implied by which button was used.

The unsaved flow is state BORRADOR and is not listed anywhere else. The patient header card stays in place above the scroll.

STEP 1, CLIENTE. Find or create the client through the Clientes components. This never creates a second person. Siguiente stays disabled until a client is selected. An inactive, missing, or soft-deleted client shows "Paciente no encontrado o inactivo." and does not open Exámenes. Under the selected client: Motivo (free text) and Fecha muestra (DD/MM/YYYY, defaults to the session date only after the operator confirms a new visit).

STEP 2, EXÁMENES.
Billing card above the lines, titled Facturación: Factura N° (empty until save), Control N° (Pendiente), Tipo de costo (Rutina, Seguro/Empresa, Emergencia, Hospitalizado, one selected), C.I., Razón social, Dirección. On a Particular visit with an empty razón social, the card reads "Facturado al paciente."

Line table: an adder (Indique examen, a catalog list filtered as the operator types, which can be limited by category), then chosen lines in the order added. Sticky header. 36px rows, alternating white and --surface-page. Footer count such as "3 exámenes". Adding a line writes order.line.add, and removing one writes order.line.remove. Columns: Examen, Tipo de costo, Columna de precio (Particular, Aliados, Hospitalizado, Emergencia, or Estatal), Moneda, Precio, Status (Disponible or No disp.).

CRITICAL RULES:
- Tipo de costo and Columna de precio are DIFFERENT lists. Never map one to the other. There is no default mapping. Until a saved pair exists, the operator chooses the column. A line with no column shows SIN PRECIO.
- If a saved default exists, choosing another column needs a confirm and a motivo from Recepción (R-026).
- Each priced line shows Precio sábado or Precio ordinario. The value is read when the line is priced and stored on the line.
- A No disp. exam can be added only after a confirm that names the exam.
- SIN PRECIO blocks the fiscal issue. It does not block saving or Liberar.
- A line with an unresolved column or currency shows SIN PRECIO. A stored zero shows 0,00.

Empty table: header plus "Sin exámenes en esta orden." Siguiente is disabled, and Guardar is later refused.

SAME DAY, SAME EXAM. The same client, the same day (America/Caracas), and a shared exam shows a warning naming the repeated exam and a motivo field. It refuses to continue while the motivo is blank. A voided order does not trigger it. A different exam the same day does not trigger it.

Show the running total under the table: USD, the shell's Tasa BCV, and bolívares.
```

**Check:**
- Confirm no code maps Tipo de costo to a price column.
- Pick the same exam twice in one day for one client: the motivo must be required.
- With the shell at `SIN TASA`, priced actions stay disabled.

## V0-09. Nueva orden: Personal, Pago, Guardar

**Attach:** `product/02-client-flow.md`, `product/05-data.md`, `brand/04-display-patterns.md` (Line table, Totals), `brand/06-edge-cases.md` (Money), R-023 to R-026 from `product/06-access-control.md`.

```text
Build steps 3 and 4 of Nueva orden.

STEP 3, PERSONAL. Médico is optional: a dropdown of active rows from Registro de médicos.

STEP 4, PAGO.
Payment line table, in this fixed order, one row each: Efectivo USD, Zelle, Efectivo Bs, T. débito, T. crédito, Pago móvil, Transferencia. Each row has Monto. Banco and Referencia apply to the electronic methods. Do not add a Forma de pago dropdown, options for it, or a Cashea row, because those were never captured. Keep Referencia as free text.

Convenio appears when the path is Empresa, and only active convenios can be chosen. A convenio requiring a titular shows a titular field and refuses to save without one. Particular never asks for a titular. Empresa requires a razón social before Guardar. Store the convenio id and the printed name.

Discount: % de descuento. Recepción up to the limit in settings, which starts at 0, so any discount needs an administrator. Above the limit: Administración with a motivo. Writes order.line.change.discount.

Totals card, read-only, in this order: Sub total, Total exento, Total base imp., I.V.A., IGTF, Desc., Total Bs, Total USD, Abono, Resta. Repeat Tasa BCV with the words "tasa usada en este total." Desc. shows the chosen percent. IGTF is labeled as the tax on the foreign-currency payment.
IVA and IGTF rates come from laboratory settings, which start empty. While a rate is empty, compute 0,00 and show a caption under pendingReview saying the rate is not configured. Do not hardcode a tax rate from your own knowledge.

GUARDAR, on the server, in one transaction:
- Requires a selected client and at least one exam. An order for an inactive client is not created.
- A Sin verificar client passes only with the billing party's complete cédula on the factura.
- Assigns N° orden, zero-padded, and Factura N°. Control N° shows Pendiente.
- Stores the client id (never a retyped person), tipo de costo and price column on each line, and copies the BCV rate. A later rate change never rewrites a saved order. If the rate changed while the order was open, warn at Guardar.
- Moves the state to ABIERTA. Writes order.open, and payment.record for each amount.

A failure shows "La orden no se guardó." and keeps what the operator typed. The client stays saved.

TWO SAVERS. The second save shows "Esta orden fue guardada por [usuario] a las [hora]." and reloads the first version. The losing edit isn't written. Writes order.save.refused.

BUTTONS as on the October form: Nuevo, Guardar, Cancelar, Salir, in sentence case. Nuevo clears the order form and never invents a birth date. Cancelar discards unsaved order edits and leaves the client and the last saved order stored.

After saving, show the order with its chip and N° orden.
```

**Check:**
- Search the code for hardcoded `16` or `3` tax rates.
- Save with a Sin verificar client and no billing cédula: it must refuse.
- Change the rate after saving: the saved order keeps the old rate.

## V0-10. Anular, remove a line, Presupuesto

**Attach:** `product/04-edges.md` (Anular orden), rows R-027 to R-034 and E-50 from `product/06-access-control.md`.

```text
Add these order actions, all through decide(). These commands share a name and depend on facts, so read the rows in table order, and let decide() choose. Do not reimplement the conditions in the UI.

ANULAR ORDEN. Always needs a motivo, including for Administración.
- A result is released: refused for everyone. The screen says to correct it instead.
- A payment exists: Administración only, password re-entry and motivo. Requires a credit note. A fiscal number is never reused.
- No payment, no result: Recepción with a confirm and motivo. Administración with a motivo.
- Unreleased results, no payment: Administración only, password re-entry and motivo.
The state becomes ANULADA. The order stays stored. Writes order.void. A voided order is omitted from the portal and doesn't trigger the same-day warning.

REMOVE A LINE.
- No results on it: Recepción or Administración.
- A result exists: Bioanalista only, password re-entry. It's a clinical correction and keeps the audit row. Money follows through a note.

PRESUPUESTO and GENERAR PRESUPUESTO (Recepción, Administración). Billing card plus line table, no Factura N° allocated. It's a quote, not an order. Does not create a worklist entry.

REIMPRESIÓN of an order is handled later.
```

**Check:**
- Void an order in each of the four situations, as each role.
- Confirm the fiscal number isn't reused.
- A quote never appears on the worklist.
