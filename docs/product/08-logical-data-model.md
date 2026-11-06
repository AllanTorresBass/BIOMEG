# Logical data model

**Type:** [01-application-type.md](01-application-type.md)  
**When each fact is written:** [05-data.md](05-data.md), [../brand/08-data-lifecycle.md](../brand/08-data-lifecycle.md)  
**Who may act:** [06-access-control.md](06-access-control.md)  
**What the current program shows:** [../data-model/README.md](../data-model/README.md)

This page gathers, in one place, every record the new application keeps and every field the other pages already require. It adds no behavior. If it differs from the page it cites, that page wins, so fix this one.

It is logical, not physical: these are facts, not column names, types, or keys. Where a type is stated, a rule forces it. The labels are the ones used in this folder: **Observed**, **Design rule**, and **Unknown**. A field with no label is a **Design rule**. **Open** means no page settles it yet, and it's listed in [Open questions](#open-questions).

## How the records relate

```text
Client 1──* Order *──0..1 Convenio
                  *──0..1 Physician
Order 1──1 Invoice 1──* Payment
                   1──* Credit or debit note
Order 1──* Exam line *──1 Exam
Order 1──* Section 1──* Result line
                   1──0..* Observation
Order 1──* Issue 1──* Delivery
Order 1──* Resend task
Portal session *──* Client
Merge 1──* Moved order
User *──* Role
Every decision ──► Audit row
```

Whether one exam line produces several result lines is **Open**. See [Open questions](#open-questions).

## Record states

Defined in [06-access-control.md](06-access-control.md#record-states), and repeated here only as names.

| Record | States |
|---|---|
| Order | `BORRADOR`, `ABIERTA`, `INCOMPLETO`, `LIBERADO`, `EN_CORRECCION`, `ANULADA` |
| Result | `PENDIENTE`, `CARGADO`, `LIBERADO`, `EN_CORRECCION` |
| Issue | `VIGENTE`, `REEMPLAZADO` |

## People

### Client

| Field | Rule | Source |
|---|---|---|
| Display name | One string, title case for `es-VE`, required. **Observed** as one box | `04-edges.md` |
| Duplicate key | Spaces collapsed, accents removed, uppercase | `04-edges.md` |
| Cédula type | `V`, `E`, `J`, `P`, `G`. Filled together with the number, or both empty | `04-edges.md` |
| Cédula number | 6 to 10 digits, stored without punctuation. Unique among clients not soft-deleted | `04-edges.md` |
| Verification mark | Verificado with a complete pair, Sin verificar with both empty | `04-edges.md` |
| Fecha de nac. | Required, never prefilled | `04-edges.md`, `brand/06` |
| Edad | Computed from Fecha de nac. and Fecha muestra. A stored age is only a cache | `04-edges.md` |
| Sexo | Masculino, Femenino, or blank | `04-edges.md` |
| Teléfono | Delivery destination for WhatsApp, printed on the report | `05-data.md` |
| Email | Destination for correo, never printed | `05-data.md` |
| Delivery consent | By channel, with operator and time. Can be withdrawn. Needed for an attachment | `10-security-baseline.md` |
| Similar-name confirmation | Recorded when the operator confirms a different person | `04-edges.md` |
| Activo | False hides the client from search and Nueva orden. The portal still opens | `04-edges.md` |
| Deleted time | Soft delete. There is no hard delete | `04-edges.md` |

### Merge

| Field | Rule | Source |
|---|---|---|
| Surviving client, source client | Both ids, on the audit row | `04-edges.md` |
| Map of moved orders | Lets Deshacer fusión restore them | `04-edges.md`, E-18 |
| Request | Reception asks and administration acts | R-019 |

### User

| Field | Rule | Source |
|---|---|---|
| Display name | Stays on historical records | E-06 |
| Roles | One or more of Recepción, Auxiliar, Bioanalista, Administración. A change replaces them. Bioanalista comes only through R-126 | E-05, E-07, E-55 |
| Password | Never shown back, never printed. Stored with Argon2id | `brand/08`, `10-security-baseline.md` |
| Second factor | For Administración and Bioanalista. Recovery codes stored hashed | `10-security-baseline.md` |
| Activo | A person who leaves is disabled, never deleted | E-06 |
| License number | Required to grant Bioanalista. Expiry only if the Colegio requires renewal | Decisions |
| Temporary cover | End date and motivo. Ends on its own | E-08 |

The physician has no account, and is a registry row and a name on the order.

## Catalog and masters

### Exam and price

| Field | Rule | Source |
|---|---|---|
| Examen | Catalog name, with spelling kept as stored. **Observed** | `brand/04` |
| Categoría | **Observed** as a filter. Whether it equals a report section is **Open** | `session/lista-de-precios.md` |
| Status | `Disponible` or `No disp.` **Observed**. No other status is added | `brand/04` |
| Price per column | Particular, Aliados, Hospitalizado, Emergencia, Estatal. **Observed** | `brand/04` |
| Currency | USD or Bs, one at a time on the matrix. **Observed** as a filter | `brand/04` |
| Empty price | `SIN PRECIO`, which is different from a stored `0,00` | `brand/06` |
| Pair of tipo de costo and column | Optional, saved in a maintenance table. None ships by default | `brand/05` |
| Analytes, units, reference text | **Open**. They appear on the report, and no command maintains them | `brand/06` |
| Profile members | **Unknown** | `brand/07` |

### Registries

Each has a name and Status (`Activo` or `Inactivo`), and shows Actualizado. All other fields are **Unknown**. A retired row leaves the dropdowns and stays on old orders.

Médicos, empresas (with Razón social as its name), proveedores, reactivos y servicios, equipos, parásitos, antibióticos, microorganismo, muestra de bacteriología, observaciones de bacteriología.

### Convenio

| Field | Rule | Source |
|---|---|---|
| Name | **Observed** as a word, or as a company name | `../data-model/convenio.md` |
| Active | Only active convenios can be chosen | `04-edges.md` |
| Requires titular | When true, the order can't be saved without one | `04-edges.md` |
| Which record holds these | A row in Registro de empresas, with Status and Requiere titular | `04-edges.md`, `brand/08` |

### Laboratory settings

| Field | Rule | Source |
|---|---|---|
| Name, address, phones, email | Printed. **Observed** on public reports | `../data-model/laboratory-and-template.md` |
| RIF | The live fiscal value, printed as data. The logo is not a source. The correct value is waiting on the laboratory | `brand/01` |
| Tasa BCV, with its date | Copied onto each new document | `brand/04` |
| QR, Precio sábado | Whole laboratory. Saturday has a calendar and a manual switch | R-004, R-147 |
| Discount limit | Starts at 0 percent | Decisions |
| IVA, IGTF rates | **Design rule** (Gate B Received 06/11/2026): IVA **16%**; IGTF **3%** on the foreign-currency payment amount when collected. Money rounds to two decimals, half-up | Gate B, `session/facturacion.md` |
| Mail account | **Unknown** beyond "the account Enviar correo uses". The secret is write-only | R-128 |

## The visit

### Order

| Field | Rule | Source |
|---|---|---|
| N° orden | At least four digits, zero-padded, assigned at Guardar. **Observed** shape | `05-data.md` |
| Client | The id, never a retyped person | `05-data.md` |
| State | See above. `BORRADOR` is the unsaved flow, and isn't stored as an order | `06-access-control.md` |
| Tipo de costo | Rutina, Seguro/Empresa, Emergencia, Hospitalizado. **Observed**. Never implied by the button used | `02-client-flow.md` |
| Convenio | Id and printed name | `04-edges.md` |
| Titular | Required by some convenios. Stored on the order | `04-edges.md` |
| Physician | Optional. Id and printed name | `brand/08` |
| Motivo | Free text, on the card. **Observed** on the invoice | `brand/04` |
| Fecha muestra | `DD/MM/YYYY` | `brand/04` |
| Fecha reporte | Written at the first Liberar, updated by each later Liberar | Decisions |
| BCV rate | Copied at save. A later rate change doesn't rewrite it | `05-data.md` |
| Same-day motivo | When a shared exam repeats the same day | `05-data.md` |
| Void motivo | Every void needs one | Decisions |
| Review flag | Set when Fecha de nac. or sex changes after a result | R-012 |
| Print status | `Sin imprimir`, `Impreso` | `brand/07` |
| Who saved and when | Lets the second saver be told, and refused | `04-edges.md` |

### Exam line

| Field | Rule | Source |
|---|---|---|
| Exam | Catalog description | `brand/04` |
| Tipo de costo | The order's choice, repeated | `brand/04` |
| Columna de precio | Stored, and never mapped silently from tipo de costo | `05-data.md` |
| Moneda, Precio | Empty means `SIN PRECIO`, which blocks the fiscal issue and not Liberar | `brand/08` |
| Status | `Disponible` or `No disp.`. Adding `No disp.` needs a confirm | `brand/08` |
| Saturday mark | `Precio sábado` or `Precio ordinario`, read when priced | `brand/05` |

### Section

| Field | Rule | Source |
|---|---|---|
| Heading | Clinical order. **Observed**, including sub-groups such as `SERIE ROJA` | `brand/04` |
| Released state | Liberar works per section | `06-access-control.md` |
| Procesado por | The releasing user. Stored per section, and printed per section when the names differ | `02-client-flow.md`, `brand/04` |
| Observaciones | Optional note. **Observed**. Different from the home list | `brand/04` |
| Bacteriology note | Only on an order with a bacteriology section | R-050 |

An empty section is not stored as a blank result.

### Result line

| Field | Rule | Source |
|---|---|---|
| Descripción del examen | **Observed** | `brand/04` |
| Resultado | **Text**, so a number and a word share the column. Written on leaving the cell | `05-data.md` |
| Unidades | May be blank or a dot. **Observed** | `brand/04` |
| Valores de referencia | **Text**, including both sexes in one cell. **Observed** | `brand/05` |
| Marca | `ALTO`, `BAJO`, or blank. Stored with the line. Set automatically only on a closed range with a non-blank sex | `05-data.md`, `brand/05` |
| Source | `teclado` or `equipo` when known | `brand/08` |
| Who entered it | Needed for "empty or own typed cell" | R-042 |
| Waiting analyzer value | Shown beside a typed cell. A second numeric channel is **Unknown** | E-27, `brand/04` |
| Correction history | Previous text, new text, motivo, operator, time, in the audit trail | `04-edges.md` |

## What leaves the laboratory

### Issue

| Field | Rule | Source |
|---|---|---|
| State | `VIGENTE`, then `REEMPLAZADO` when a correction is released | `06-access-control.md` |
| File | Stored with the order. Keeps the name, age, and values it printed | `05-data.md`, `brand/08` |
| QR token | Random, at least 128 bits, stored hashed. The order number alone reveals nothing. The October payload is **Unknown** | E-45, `brand/04`, `10-security-baseline.md` |
| File hash | Lets a changed file be detected | `10-security-baseline.md` |
| Código de consulta | Only when the value check is on. Stored hashed, usable for 90 days | R-149 |

### Delivery

| Field | Rule | Source |
|---|---|---|
| Channel | WhatsApp or correo. Provider **Unknown** | `05-data.md` |
| Mode | A portal link, or an attachment | `10-security-baseline.md` |
| Destination, time, operator, order number | Stored before the send counts as complete | `brand/08` |
| Incomplete mark | Whether the order was incomplete, and the bioanalyst's approval | `brand/08`, R-113 |
| Result | A failure is stored, and the order is unchanged | `05-data.md` |

A second send is a new row. A released correction creates a resend task from earlier deliveries.

### Portal session and attempts

| Field | Rule | Source |
|---|---|---|
| Client ids | Every non-deleted client with that cédula and that Fecha de nac. | `04-edges.md` |
| One-time code | Stored hashed. Valid for 10 minutes, single use, cancelled by five wrong entries | `10-security-baseline.md` |
| Display cédula, name | For the header | `05-data.md` |
| Expiry | Three hours ahead, plus 15 idle minutes | `05-data.md` |
| Failed attempt | Keyed hash of laboratory, type, and number, plus the address. The log keeps a prefix, never the digits | `04-edges.md` |

No password is stored.

## Money

### Invoice

| Field | Rule | Source |
|---|---|---|
| Factura N° | Assigned at Guardar. Never reused | `05-data.md`, `04-edges.md` |
| Control N° | A number, or `Pendiente`. A fiscal copy waits for it. **Design rule** (Gate B): nullable until assigned; the app does not invent a printer number. Fiscal emission medium remains G4 / Gate C | `brand/06`, R-071, Gate B |
| Billing party | C.I., Razón social, Dirección. **Observed**. Empresa requires a razón social | `brand/04` |
| Totals | Sub total, Total exento, Total base imp., I.V.A., IGTF, Desc., Total Bs, Total USD, Abono, Resta. **Observed** | `brand/04` |
| Rate used | Repeated beside the totals | `brand/06` |
| Discount percent | Up to the limit, or an administrator with a motivo above it | R-024, R-025 |

### Payment

| Field | Rule | Source |
|---|---|---|
| Instrument | Efectivo USD, Zelle, Efectivo Bs, T. débito, T. crédito, Pago móvil, Transferencia. **Observed** | `02-client-flow.md` |
| Monto, Banco, Referencia | **Observed**. The dropdown options beside two instruments are **Unknown** | `brand/04` |
| Operator, workstation, time | A payment after a close goes to the next period and keeps its real time | E-13, E-48 |
| Reversal | A new row with a motivo. The original stays | `03-processes.md` |

### Documents and closes

| Record | Known facts | Unknown |
|---|---|---|
| Credit or debit note | A new document against one factura | Line fields |
| Reprint | Who printed, when, which number. Marked `COPIA`. Allocates nothing | |
| Cierre de caja | User, day, Total USD, Total Bs, rate, Resta still open, time | Other fields |
| Cierre mensual | A separate event | Other fields |
| Quote (Presupuesto) | Billing card and lines, no Factura N° | Other fields |

## Audit

One row for every decision: who, what, when, where, how, why, result, and change. Full fields and protections are in [09-audit-log.md](09-audit-log.md). It's append-only, with a hash of the prior row. Refused events store no cédula digits and no results. Retention waits for the legal review.

## What gets copied, and when

A saved or issued document keeps the value it had. A later change never rewrites it.

| Value | Copied onto | When |
|---|---|---|
| Tasa BCV | Order and invoice | Guardar |
| Saturday mark | Exam line | When the line is priced |
| Price | Exam line | Guardar |
| Physician name, convenio name | Order | Guardar |
| Client name, age, cédula | Issue | Issue |
| Result text, Marca | Issue | Issue |

## Records with a real command and no known fields

These commands exist. Their fields stay **Unknown** until a form is captured, and the screens say so.

Órdenes de compra, inventory and Restar inventario, cuentas por cobrar and por pagar, tipos de retenciones, retention documents, relación de referidos, Cobros Cashea, the libros, insumos, salarios, costos de reactivos, Promedios pacientes/pruebas, Evolución de pacientes, Estadísticas, Nueva observación on the home screen beyond date, author, and text.

Blocked until a capture says what they do: Trasladar paciente, Reversar relación, Modificar valores.

## Deliberately not modeled

Tube, barcode, and sample record beyond Fecha muestra. Appointments, electronic signature, physician commissions, medical-history chart, several sites, nómina, honorarios, finiquitos.

## Open questions

Each is also in [section 9 of the workspace guide](../workspace-guide.md#decisions-still-needed).

| Question | Why it matters to the model | Who decides |
|---|---|---|
| How the catalog is structured (G1): one exam to many analytes, whether Categoría is a section, and where units and reference text are kept | A panel prints many rows, and nothing yet creates those rows. Modificar valores is blocked, and Crear perfiles has **Unknown** members | Lead bioanalyst, laboratory — [../gates/gate-c.md](../gates/gate-c.md) |
| What is brought over from SICOEXC (G3) | The rules assume migrated rows, and no page defines a migration | Owner — [../gates/gate-c.md](../gates/gate-c.md) |
