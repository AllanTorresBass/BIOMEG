# Edge cases

**Flow:** [02-client-flow.md](02-client-flow.md)  
**Display rules for the October defects:** [../brand/06-edge-cases.md](../brand/06-edge-cases.md)

The client cases are the ones MediLab enforces when a person is created, changed, attached to a visit, or signed in to the portal. BIOMEG has one laboratory, so a “same sede” check is this laboratory. Codes are kept so a builder can trace them to MediLab. The October laboratory cases follow the client catalog.

For each client case: what is shown, what is stored, and what is refused.

## Identity

### Name

**Shown.** The display name in title case for `es-VE`.  
**Stored.** That display name, plus a key with spaces collapsed, accents removed, and letters uppercased.  
**Refused.** An empty name.

### Cédula pair

**Shown.** Type `V`, `E`, `J`, `P`, or `G`, and the number grouped for reading (`V-12.345.678`).  
**Stored.** Type and digits, with no dots or hyphens. Both empty, or both filled. A complete pair is marked Verificado. Both empty is marked Sin verificar.  
**Refused.** A type without a number, or a number without a type. Fewer than 6 digits or more than 10. A pasted `V-12.345.678` is accepted as type `V` and the digits. A pasted digit string with no letter is read as `V` only by the paste parser. Typing the number in the form still requires the operator to choose the type.

### Unique cédula (P-01)

**Shown.** “Ya existe un paciente con esta cédula.” The existing client is offered.  
**Stored.** Nothing new.  
**Refused.** A second active or inactive client with the same type and number. A soft-deleted cédula does not block the new client. Confirmación of a similar name does not bypass this refusal.

### Sin verificar

**Shown.** The badge Sin verificar on the client card.  
**Stored.** A client with nombre, Fecha de nac., and no cédula.  
**Refused.** Portal sign-in. Pago on an order, unless the billing party’s complete cédula is on the factura.

### Similar name (P-03)

**Shown.** The similar clients, and a confirmación that this is a different person.  
**Stored.** The new client, with the confirmation recorded, only after the operator confirms. The threshold is 0.85 on the normalized name, the same threshold MediLab uses.  
**Refused.** The save, until that confirmation. An exact cédula match is never part of this path.

### Sex, birth date, age

**Shown.** Sex as Masculino, Femenino, or an em dash. Edad computed beside Fecha de nac.  
**Stored.** The birth date. Age is a cache for display and for the issued report.  
**Refused.** A create with no birth date. A typed age as the source of truth. MediLab’s typed `edad` is not copied. A third sex value is not offered. Sex may be blank.

## Change, merge, deactivate, delete

### Cédula after an order

**Shown.** “No se puede cambiar la cédula de un paciente con órdenes registradas.”  
**Stored.** The previous cédula.  
**Refused.** Any change of type or number through Modificar once an order exists, including a voided order. Corregir cédula is the only path. Name, phone, email, sex, and birth date can still change.

### Rename

**Shown.** The new name on the client and on open orders.  
**Stored.** The new name on the master and on orders that have not been issued.  
**Refused.** Rewriting an issued PDF. That file keeps the printed name.

### Corregir cédula

**Shown.** The current and the new cédula, a motivo field, and a password re-entry.  
**Stored.** The new cédula on the master and on orders that are not issued, with an audit row that keeps both.  
**Refused.** Anyone but Administración. A cédula another client already holds. Rewriting an issued PDF.

### Fusionar

**Shown.** A field that asks for the surviving client’s name.  
**Stored.** Orders moved to the surviving id, with that client’s name and cédula copied onto them. The source is soft-deleted in the same action. An audit row names both ids, and a stored map lets Deshacer fusión restore the orders.  
**Refused.** Anyone but Administración. Two complete, different cédulas, which may be two people. A retyped name that does not match the survivor. A merge of a client with themselves. A missing client.

### Desactivar

**Shown.** The client disappears from the default search and from Nueva orden. Incluir inactivos brings the row back.  
**Stored.** Active set to false. No deleted time.  
**Refused.** Nothing if it is run again. The portal is not refused: an inactive client with orders can still sign in.

### Eliminar (M-02)

**Shown.** “No se puede eliminar: órdenes en los últimos 30 días.” when that is the case.  
**Stored.** When it is allowed: inactive, plus a deleted time. Orders stay.  
**Refused.** Anyone but Administración. The delete when any order falls in the last 30 days. A hard delete in every case. Soft-deleted clients stay out of search, out of Incluir inactivos, and out of the portal.

### Opening an order

**Shown.** “Paciente no encontrado o inactivo.”  
**Stored.** Nothing.  
**Refused.** Exámenes, when the id is missing, inactive, or soft-deleted.

## Visit attachment

### Empty steps

**Shown.** Siguiente disabled.  
**Stored.** Nothing for that step.  
**Refused.** Leaving Cliente with no client. Leaving Exámenes with no exam.

### Same day, same exam

**Shown.** A warning that names the repeated exam, and a motivo field.  
**Stored.** The order, including the motivo, after the operator fills it.  
**Refused.** Continuing while the motivo is empty. A voided order does not trigger the warning. A different exam the same day does not trigger it.

### Convenio

**Shown.** Only active convenios, from Registro de empresas. A titular field when that convenio requires one.  
**Stored.** The convenio id, the printed name, and any titular on the order. Status and Requiere titular are on the Registro de empresas row.  
**Refused.** An inactive convenio. A required titular left empty. Particular does not ask for a titular.

### Two savers

**Shown.** “Esta orden fue guardada por [usuario] a las [hora].” The same sentence is used for the client, with the client’s name.  
**Stored.** The first save only.  
**Refused.** The second save. The screen reloads the first version. A result cell uses the same check per cell, and shows both values.

## Portal

### Sign-in

**Shown.** One generic error.  
**Stored.** A failed attempt against a keyed hash of laboratory, type, and number, and against the address. The log keeps a hash prefix, not the digits.  
**Refused.** An incomplete cédula. Sin verificar. An unknown cédula. A wrong Fecha de nac. A client with zero orders. A wrong type on a right number. A soft-deleted client. A client with no phone on file. Further attempts after the failure window fills. The screen does not say which of these it was.

**One-time code.** After the type, number, and Fecha de nac. match, a six-digit code goes to the phone on file. The screen says the same thing whether or not they matched. The code lasts 10 minutes and works once, and five wrong entries cancel it. See [10-security-baseline.md](10-security-baseline.md#portal).

### Several rows, one cédula

**Shown.** One Mis visitas list.  
**Stored.** A session that holds every non-deleted client id with that cédula and that Fecha de nac.  
**Refused.** A row with a different Fecha de nac., which stays out of the list and is listed for staff review (E-59). Otherwise nothing, as long as at least one of those clients has an order. This covers rows with the same cédula brought over from the current program, until Fusionar joins them. A new save cannot create them.

### Session

**Shown.** Ingresar again after three hours, or after 15 idle minutes.  
**Stored.** The session expiry. No password is stored.  
**Refused.** Mis visitas after expiry.

### List and download

**Shown.** Todos, Con resultado, and Pendientes. A Pendiente card with the date and order number only. An En revisión card during a correction. The released sections of a partial order, labeled partial. “No disponible” for a foreign or unknown order and for a result that is not released.  
**Stored.** An audit view on download, with the order id. No new clinical result.  
**Refused.** Voided orders in the list. The grid of a section before its Liberar. A link that belongs to another cédula.

## Voiding and correcting

### Anular orden

**Shown.** A motivo field. Administración also re-enters the password when the order has a payment or a result.  
**Stored.** State Anulada, with the motivo. The order stays. A fiscal number is never reused, and a payment is answered with a credit note.  
**Refused.** An order with a released result, which is corrected instead. Reception, once the order has a payment or a result.

### Liberar corrección

**Shown.** En revisión on the portal and the QR page while it is open. A resend task after it is released.  
**Stored.** The previous and the new text, the motivo, the operator, and the time. Releasing it creates a new issue at once and marks the old one Reemplazado.  
**Refused.** Anyone but a bioanalyst. A send, a staff read by reception, or a portal grid while it is open.

## October laboratory cases

These are the defects and splits from the 30 October session. The widget for each one is [../brand/06-edge-cases.md](../brand/06-edge-cases.md). The process consequence is here.

| Case | Process consequence |
|---|---|
| Prefilled birth date `07/10/2012` | A new client does not receive that date. Create without a birth date is refused |
| Age left blank beside a birth date | Edad is shown from the birth date and the sample date |
| Sex blank on an issued report | The report still issues. The blank stays visible. Automatic Marca does not use a blank sex |
| HOMBRE and MUJER in one reference cell | Both ranges print. Marca stays manual for that cell |
| Chemistry header with no rows | The section is omitted. The order stays Incompleto. The portal shows released sections labeled partial, or Pendiente when none is released |
| Red result and no flag column | Marca prints ALTO or BAJO in words |
| Tipo de costo and the five price columns | Both appear on the exam line. No silent mapping |
| Tasa BCV on the shell, not on the total | The total repeats the rate it used. A later shell rate does not rewrite a saved order |
| Empty Control N° | The field reads Pendiente, and a fiscal copy is refused until a number exists |
| Precio sábado and QR as laboratory switches | The shell says they cover the whole laboratory. A priced line says whether Saturday price applied. QR off removes the code |
| Reprint next to the original command | Reprint marks COPIA and does not allocate a number |
| Two people, one order | The second save is refused. See the client case above |
| Modificar valores | The command writes nothing. Prices go through Precio exámenes. Results go through the result grid |
