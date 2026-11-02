# Access control: analysis and plan

**Status:** Analysis behind [product/06-access-control.md](product/06-access-control.md). The recommendations in section 8 were accepted on 1 November 2026, and that page is now the rule. Sections 3 to 11 are the record of the analysis as proposed, so they can differ from that page, which wins. See section 12 for the current status. This file sits outside the three layers in [README.md](README.md), so it does not win over [product/](product/) or [brand/](brand/).  
**Scope:** Every staff, client, public, and system actor in the BIOMEG application.  
**Basis:** All 78 Markdown files in this repository. There is no application code, so every finding is a defect in the specification, not in running software.

Labels used below: **Proposed** is a recommendation in this file. Other labels keep the meaning given in [product/README.md](product/README.md).

## 1. Summary

The documents assign an actor to most commands, but they do not yet add up to an access model. There are four root causes:

1. **The role that owns the most commands does not exist.** Administration is the actor on 33 catalog rows, plus the registries and most reports. It is not in the role table, and new users can only receive "the published set," which excludes it. As written, no one can legally hold the role that creates users.
2. **Who and when are mixed.** The "No permission" states combine role rules with record-state rules. `Enviar` is hidden until `LIBERADO`, which is a state rule filed as a permission.
3. **The riskiest acts have the weakest controls.** A receptionist can merge two people's clinical histories with no undo. Anyone who knows a cédula can read that person's results for three hours. Liberar, the central professional act, has no named audit event.
4. **Enforcement is only described on screen.** The documents say a menu item is "absent" or a button is "hidden." No sentence requires the server to refuse the action.

**The framework is deliberately simple.** One laboratory with four staff permission sets does not need a policy engine, attribute-based access control, or machine learning. Those would add failure points and audit difficulty without covering any case this table misses. What makes it strong is that every decision goes through one function, uses one versioned table, is tested exhaustively, and leaves a record, including the refusals.

## 2. What the evidence can and cannot support

| Fact | Consequence |
|---|---|
| The vendor publishes no permission matrix ([modules/users-and-concurrent-work.md:27](modules/users-and-concurrent-work.md)) | Every actor in the catalog is a design rule, so all of them can be changed |
| Nuevo usuario, Clave, Auditoría, Hoja de trabajo, and Cargar resultados were never opened ([session/gaps-and-edge-cases.md](session/gaps-and-edge-cases.md)) | How the current program controls access is unknown. One capture of Nuevo usuario could settle much of it |
| The captured session shows one user, titled LCDA., with all seven menus open ([session/README.md](session/README.md)) | This suggests, without proving, that one person may do desk, bench, and admin work. A one-role-per-user model may not fit this laboratory |
| MediLab is cited as a source and is not in this repository | MediLab rules were read only as BIOMEG's documents quote them |
| How the new application is hosted is not stated | The plan is independent of technology stack. Whether it is a LAN or an internet deployment changes the portal risk |

## 3. Findings

Severity: **Critical** can harm a patient or expose results. **High** blocks the model or opens fraud. **Medium** causes daily friction or ambiguity.

### Model

| ID | Severity | Finding | Evidence | Consequence |
|---|---|---|---|---|
| F1 | High | Administration is not a role, yet it owns the most commands. A third name, "maintenance," is also used | [product/01-application-type.md:18](product/01-application-type.md), [brand/08-data-lifecycle.md:8](brand/08-data-lifecycle.md), [brand/07-feature-catalog.md:183](brand/07-feature-catalog.md), [brand/04-display-patterns.md:305](brand/04-display-patterns.md) | No one can legally hold the role. There is no first-administrator path |
| F2 | High | One role per user in the catalog and lifecycle. Many-to-many in the research dossier | [brand/08-data-lifecycle.md:155](brand/08-data-lifecycle.md), [sicoexc-research.md:278](sicoexc-research.md) | A bioanalyst covering the desk needs two accounts, which invites shared logins |
| F3 | High | Role and state rules are mixed, and server enforcement is never required | [brand/04-display-patterns.md:244](brand/04-display-patterns.md), [brand/04-display-patterns.md:420](brand/04-display-patterns.md), [brand/03-documentation-standard.md:67](brand/03-documentation-standard.md) | A hidden button is treated as a control. A direct request could still succeed |
| F4 | Medium | Physician appears as a person with no stated account, screen, or row limit | [product/01-application-type.md:24](product/01-application-type.md), [brand/08-data-lifecycle.md:19](brand/08-data-lifecycle.md), [architecture/data-store.md:67](architecture/data-store.md) | The builder must guess. If guessed as staff, a physician could read every patient |
| F5 | Medium | Auxiliary's scope conflicts: Hoja de trabajo only, or possibly result entry. Overwriting an analyzer value has no owner | [product/01-application-type.md:22](product/01-application-type.md), [modules/users-and-concurrent-work.md:33](modules/users-and-concurrent-work.md), [workflow/04-produce-the-result.md:41](workflow/04-produce-the-result.md) | The main bench split is undefined |
| F6 | Medium | Analyzer, sender, and scheduler are never treated as actors | [brand/08-data-lifecycle.md:67](brand/08-data-lifecycle.md) | `result.enter` needs an operator, and an import has no person |

### Clinical safety

| ID | Severity | Finding | Evidence | Consequence |
|---|---|---|---|---|
| F7 | Critical | A correction does not replace what patients already have. A new issue exists "only when someone generates the PDF again." What the portal serves, and what happens to sent copies, is undefined | [product/05-data.md:40](product/05-data.md), [brand/08-data-lifecycle.md:71](brand/08-data-lifecycle.md), [workflow/06-report.md:73](workflow/06-report.md) | The patient and physician can keep acting on a wrong result, and the QR still says `LIBERADO` |
| F8 | Critical | Liberar has no named event and no re-authentication. It only requires "a signed-in bioanalyst," and staff sessions have no idle timeout | [brand/08-data-lifecycle.md:80](brand/08-data-lifecycle.md), [brand/08-data-lifecycle.md:171](brand/08-data-lifecycle.md) | On a shared bench PC, someone else can release under the bioanalyst's name. The report would print that name |
| F9 | Critical | Fusionar belongs to reception and has no undo. The only check is a retyped name. It copies the survivor's cédula onto moved orders | [brand/07-feature-catalog.md:36](brand/07-feature-catalog.md), [product/04-edges.md:65](product/04-edges.md) | A wrong merge attaches one person's results to another and shows them in that person's portal |
| F10 | High | Who may confirm an incomplete send conflicts: "a bioanalyst" or just the operator | [brand/04-display-patterns.md:420](brand/04-display-patterns.md), [brand/08-data-lifecycle.md:84](brand/08-data-lifecycle.md), [brand/06-edge-cases.md:64](brand/06-edge-cases.md) | Reception may send partial clinical results without professional review |
| F11 | High | Release per exam or per visit is unresolved. The product has `LIBERADO` and `INCOMPLETO`, but not their combination | [workflow/05-validate.md:20](workflow/05-validate.md), [product/04-edges.md:148](product/04-edges.md) | The rule for what reception and the portal may see cannot be written until this is settled |
| F12 | High | Administering users can create a false professional. Administration may assign Bioanalista, and no license field exists | [brand/07-feature-catalog.md:183](brand/07-feature-catalog.md), [data-model/validation-and-staff.md:25](data-model/validation-and-staff.md) | A person who is not a bioanalyst can release results that print as validated |
| F13 | Medium | Clinical content is filed under administration: bacteriology masters, Crear perfiles, and Agregar nota de bacteriología, which has no actor | [brand/07-feature-catalog.md:96](brand/07-feature-catalog.md), [brand/07-feature-catalog.md:111](brand/07-feature-catalog.md), [brand/07-feature-catalog.md:180](brand/07-feature-catalog.md) | Non-clinical staff edit clinical lists, and the bench must ask them for changes |
| F14 | Medium | Reception can change Fecha de nac. and sex after results exist. A name-edit rule conflicts between layers | [brand/04-display-patterns.md:83](brand/04-display-patterns.md), [product/04-edges.md:56](product/04-edges.md) | Age and reference reading can shift under a bioanalyst's review without notice |

### Privacy

| ID | Severity | Finding | Evidence | Consequence |
|---|---|---|---|---|
| F15 | Critical | The portal authenticates with a cédula and no secret. The cédula is printed on each report, and the session lasts three hours | [product/01-application-type.md:37](product/01-application-type.md), [product/05-data.md:16](product/05-data.md), [product/05-data.md:63](product/05-data.md) | Relatives, employers, or anyone with a photo of one report can read the person's entire history. A stated design rule, so it needs an owner decision |
| F16 | High | A plain hash of a cédula protects little. The number space is small enough to try every value | [product/04-edges.md:117](product/04-edges.md), [product/05-data.md:18](product/05-data.md) | The login log can be reversed into real cédulas. A keyed hash is needed |
| F17 | High | The verification page is public and order numbers are short zero-padded integers, so they are easy to guess. Nothing says the "verification word" is required or unguessable | [brand/04-display-patterns.md:406](brand/04-display-patterns.md), [brand/05-data-display-models.md:48](brand/05-data-display-models.md) | A sweep could reveal each order's existence, date, and status |
| F18 | High | Evolución de pacientes goes to administration, not the bioanalyst. Auditoría also exposes clinical before-and-after text to administration | [brand/07-feature-catalog.md:135](brand/07-feature-catalog.md), [brand/07-feature-catalog.md:154](brand/07-feature-catalog.md), [brand/08-data-lifecycle.md:165](brand/08-data-lifecycle.md), [workflow/08-review.md:41](workflow/08-review.md) | The clinician who needs the trend cannot see it, and the role that does not need it can |
| F19 | High | Portal rules do not cover minors or representatives. A person with no cédula cannot pass Pago, and cédulas must be unique | [product/04-edges.md:28](product/04-edges.md), [product/04-edges.md:34](product/04-edges.md) | A young child with no cédula cannot be billed or get portal access, which pushes staff to invent numbers |
| F20 | Medium | A Pendiente row's content is unspecified, and company access to employee results under a convenio is not ruled out | [product/04-edges.md:134](product/04-edges.md), [product/02-client-flow.md:45](product/02-client-flow.md) | Exam names can reveal a condition before any result exists |
| F21 | Medium | Reception can edit phone or email right before a send. `patient.save` stores no before-and-after value | [brand/08-data-lifecycle.md:166](brand/08-data-lifecycle.md), [brand/07-feature-catalog.md:166](brand/07-feature-catalog.md) | Results can go to the wrong person with no trace of the earlier number |
| F22 | Medium | Backup is one click by administration with an unstated path, and Registro de correo holds a credential | [brand/07-feature-catalog.md:182](brand/07-feature-catalog.md), [brand/07-feature-catalog.md:184](brand/07-feature-catalog.md) | A full copy of all patient data can leave without control |

### Money

| ID | Severity | Finding | Evidence | Consequence |
|---|---|---|---|---|
| F23 | High | % de Descuento is on the invoice and has no limit, approver, or reason | [session/facturacion.md:66](session/facturacion.md), [brand/04-display-patterns.md:193](brand/04-display-patterns.md) | Unlimited discount at the desk |
| F24 | High | Reception chooses the price column with no default mapping, so a cheaper column is an unrecorded discount | [brand/05-data-display-models.md:80](brand/05-data-display-models.md), [brand/08-data-lifecycle.md:132](brand/08-data-lifecycle.md) | The same exam can be underpriced with no flag |
| F25 | High | "Voided order" is used as a real state, but no command, actor, or event exists | [product/04-edges.md:54](product/04-edges.md), [product/04-edges.md:98](product/04-edges.md), [product/04-edges.md:136](product/04-edges.md) | The build cannot implement it, and cancellation with money attached has no rule |
| F26 | High | No one owns the Tasa BCV or Control N°. `SIN TASA` disables priced actions, and a pending control number refuses the fiscal copy | [brand/04-display-patterns.md:62](brand/04-display-patterns.md), [brand/08-data-lifecycle.md:91](brand/08-data-lifecycle.md), [workflow/01-admit-and-bill.md:54](workflow/01-admit-and-bill.md) | The front desk can stop with no one able to fix it, or anyone may change the rate |
| F27 | Medium | A payment cannot be reversed. A close has no reopen path, and an absent user's drawer cannot be closed | [product/03-processes.md:15](product/03-processes.md), [brand/06-edge-cases.md:164](brand/06-edge-cases.md) | A typing error or an absence leaves a permanent wrong total |
| F28 | Medium | The rate and flags are copied at sign-in in one place and read at save in others | [brand/04-display-patterns.md:66](brand/04-display-patterns.md), [product/05-data.md:27](product/05-data.md), [brand/08-data-lifecycle.md:130](brand/08-data-lifecycle.md) | Two desks can charge different rates. Whether a switch is per session or global is unclear |

### Identity, audit, and flow

| ID | Severity | Finding | Evidence | Consequence |
|---|---|---|---|---|
| F29 | High | Staff sign-in has no lockout, failed-attempt event, idle timeout, password reset, or recovery. The portal has several of these | [brand/07-feature-catalog.md:26](brand/07-feature-catalog.md), [brand/04-display-patterns.md:63](brand/04-display-patterns.md) | Patients' sign-in is logged more carefully than staff's. A locked-out sole admin stops the laboratory |
| F30 | High | The event list misses key acts: Liberar, void, merge, deactivate, delete, user and role changes, switches, and refused actions | [brand/08-data-lifecycle.md:171](brand/08-data-lifecycle.md), [product/04-edges.md:65](product/04-edges.md), [brand/08-data-lifecycle.md:163](brand/08-data-lifecycle.md) | The documents require audit rows that have no name, and the riskiest acts are invisible |
| F31 | High | The audit log is not required to be append-only. It has no retention rule, and its only reader is the role it should watch | [brand/08-data-lifecycle.md:165](brand/08-data-lifecycle.md), [modules/exam-traceability.md:65](modules/exam-traceability.md) | Administration audits itself. SENIAT's six-year expectation may also apply to fiscal records ([modules/billing-and-payments.md:45](modules/billing-and-payments.md)) |
| F32 | Medium | Concurrency is defined per save, but results save per cell on leaving the field | [product/04-edges.md:106](product/04-edges.md), [brand/04-display-patterns.md:246](brand/04-display-patterns.md) | "Second save refused" does not define two people, or a person and an analyzer, on one cell |
| F33 | Medium | Generar PDF has two different owners, and reception's result visibility before release is unclear | [brand/07-feature-catalog.md:165](brand/07-feature-catalog.md), [brand/08-data-lifecycle.md:106](brand/08-data-lifecycle.md), [brand/08-data-lifecycle.md:69](brand/08-data-lifecycle.md), [brand/04-display-patterns.md:198](brand/04-display-patterns.md) | Unreleased values could be read aloud at the desk |
| F34 | Medium | Live portal and staff sessions keep their rights after a merge, delete, role change, or deactivation | [product/05-data.md:63](product/05-data.md) | Revoked access keeps working until expiry |

### Hidden inefficiencies

These are not security holes. The current assignments would slow the working day.

| ID | Bottleneck | Proposed fix |
|---|---|---|
| I1 | A patient at the desk needs a factura copy, but Re-imprimir factura is administration only. The copy is watermarked and allocates no number | Allow reception, with the existing `document.reprint` event |
| I2 | `SIN TASA` stops the desk when administration is not in yet | Reception may enter the rate only when today has none. Later changes are administration's |
| I3 | Precio sábado depends on someone with administration rights being present on Saturday | Schedule it by calendar, keeping the manual switch for administration |
| I4 | Reception cannot answer "is mine ready?" because it has no worklist access | A status-only view without values |
| I5 | The bench waits on administration for organism and antibiotic lists | Move clinical masters to the bioanalyst |
| I6 | Re-entering a password for each Liberar would be resisted, and resistance leads to shared sessions | One re-entry covers all orders selected in that release action |
| I7 | An incomplete send needs a bioanalyst, then reception, with nothing connecting them | The bioanalyst's approval appears as a ready-to-send item for reception |
| I8 | Correcting a result creates work for reception that no one is told about | The correction creates a resend task listing earlier deliveries |

## 4. The framework

Every action, by every actor, gets one server-side decision:

```text
decide(principal, command, record) →
    ALLOW | ALLOW_WITH_CONFIRM | ALLOW_WITH_STEP_UP | DENY(reason)
```

It asks four questions, in this order. The first failure ends the decision.

| Order | Question | Example | Reason code |
|---|---|---|---|
| 1 | Is this a valid session on an active account? | Account disabled five minutes ago | `SESSION` |
| 2 | Does any of the person's roles grant this command? | Auxiliar tries Nota de crédito | `ROLE` |
| 3 | Does the record's state allow it? | Enviar before `LIBERADO` | `STATE` |
| 4 | Is the person related to this record as required? | Client asks for another cédula's order. A receptionist closes another person's drawer | `OWNERSHIP` |

Then, for allowed actions, it applies the gesture the table requires: nothing, a confirm, or a password re-entry (`STEP_UP`). Some commands also require a typed motivo (`MOTIVO_REQUIRED`).

**Rules of the framework:**

1. **Deny by default.** A command missing from the table is refused.
2. **The screen only reflects the decision.** It asks the same function what to show. Absent menu items and `BLOQUEADO` stay as the display rule.
3. **Roles are additive.** A person may hold several. Conflicts are recorded and reviewed, not technically blocked, because a small laboratory cannot always separate them.
4. **The table is versioned data.** Each audit row stores the version that decided it.
5. **Rights are checked on every request,** so revocation takes effect immediately (F34).

**Proposed record states.** These replace the implied states.

```text
Order:  BORRADOR → ABIERTA → INCOMPLETO → LIBERADO ⇄ EN_CORRECCION
                     └────────────┴──→ ANULADA (no results released)

Result: PENDIENTE → CARGADO → LIBERADO → EN_CORRECCION → LIBERADO (new version)

Issue:  VIGENTE → REEMPLAZADO (once a correction is released)
```

## 5. Proposed roles

| Permission set | Who holds it | Note |
|---|---|---|
| Recepción | Receptionist, secretary | Secretary "follows reception" in the documents, so one set is enough. The job title can differ |
| Auxiliar | Auxiliary, assistant | The documents suggest these may be one job |
| Bioanalista | Licensed bioanalyst | Requires a license number and an audited grant (F12) |
| Administración | Owner, administrator | Newly defined. Holds no clinical rights by default |
| Sistema | Analyzer link, sender, scheduler | Non-human. Limited to its own commands. Cannot sign in |
| Cliente | Portal session | Separate population and separate session. Never mixed with staff |
| Público | Holder of the paper | Verification page only |

Physician gets no account in the first release (D4). The physician stays a name on the order and a reader of the delivered report.

## 6. Proposed permission matrix

**Key.** `●` allowed. `C` needs a confirm. `S` needs a password re-entry. `R` read only. `—` refused. **Δ** differs from the current document, and the reason is in the Rule column.

### Session and shell

| Command | Recepción | Auxiliar | Bioanalista | Administración | Rule |
|---|---|---|---|---|---|
| Entrar, Cerrar sesión, Salir, Clave | ● | ● | ● | ● | Own account only |
| View Tasa BCV, QR, Precio sábado | R | R | R | R | |
| Set Tasa BCV Δ | ● today only | — | — | ● | Reception only when today has no rate (F26, I2) |
| Switch QR, Precio sábado | — | — | — | C | Global, audited. Shell makes the scope explicit (F28) |
| Nueva observación, Mostrar, Ocultar, Buscar | ● | ● | ● | ● | Content unknown. No patient data until captured |

### Clients and orders

| Command | Recepción | Auxiliar | Bioanalista | Administración | Rule |
|---|---|---|---|---|---|
| Clientes: search, read | ● | R on own worklist | R | R | |
| Create client, Modificar pacientes | ● | — | — | — | Contact change after Liberar needs C, and stores before and after (F21) |
| Change Fecha de nac. or sex after a result Δ | C | — | ● | — | Flags the order for bioanalyst review (F14) |
| Incluir inactivos | ● | — | — | ● | |
| Desactivar | C | — | — | C | |
| Eliminar Δ | — | — | — | C | 30-day rule stays. Moved from reception |
| Fusionar Δ | — | — | — | S | Reception can request. Two complete, different cédulas: refused, see D6 (F9) |
| Trasladar paciente | — | — | — | — | Blocked until a capture names the destination |
| Ingreso particular, Ingreso empresa, Facturar consulta | ● | — | — | — | |
| Discount Δ | ● to limit | — | — | ● | Above limit: administrator approval and motivo (F23) |
| Price column other than the default Δ | C + motivo | — | — | ● | (F24) |
| Add exam line | ● | — | — | — | |
| Remove line, no results | ● | — | — | ● | |
| Remove line, result exists Δ | — | — | S | — | Clinical correction. Money follows through a note |
| Anular orden: no payment, no result Δ | C + motivo | — | — | ● | New command (F25) |
| Anular orden: payment exists Δ | — | — | — | S + motivo | Requires a credit note |
| Anular orden: result released | — | — | — | — | Refused. Correct it instead |
| Presupuesto, Generar presupuesto | ● | — | — | ● | |

### Work and results

| Command | Recepción | Auxiliar | Bioanalista | Administración | Rule |
|---|---|---|---|---|---|
| Hoja de trabajo Δ | status only | ● | ● | — | No values for reception (I4) |
| Status de impresión | R | ● | ● | — | |
| Cargar resultados: empty or own typed cell Δ | — | ● | ● | — | Before release, subject to D3 (F5) |
| Overwrite analyzer or another's value Δ | — | — | ● + motivo | — | (F5) |
| Read grid before release Δ | — | ● | ● | — | (F33) |
| Read grid after release | R | R | R | — Δ | Administration has no need for clinical values |
| Liberar Δ | — | — | S | — | One re-entry covers the selected batch (F8, I6) |
| Liberar corrección | — | — | S + motivo | — | Opens `EN_CORRECCION` (F7) |
| Agregar nota de bacteriología Δ | — | — | ● | — | Bacteriology orders only. Move out of Mantenimiento (F13) |
| Imprimir por paciente, Imprimir prueba individual | ● Liberado | — | ● | — | Δ reception added |
| Imprimir referidos | ● | — | — | ● | |

### Money

| Command | Recepción | Auxiliar | Bioanalista | Administración | Rule |
|---|---|---|---|---|---|
| Record payment, Agregar abono | ● | — | — | ● | |
| Reverse payment Δ | same day, own, C + motivo | — | — | S + motivo | New command. Original row stays (F27) |
| Cierre de caja: own | ● | — | — | ● | |
| Cierre de caja: another user's Δ | — | — | — | S + motivo | (F27) |
| Reopen a close Δ | — | — | — | S + motivo | New command (F27) |
| Cierre mensual | — | — | — | S | |
| Nota de crédito, Nota de débito | — | — | — | S | |
| Reversar relación | — | — | — | S | Blocked until "relación" is known |
| Re-imprimir factura Δ | ● | — | — | ● | `COPIA`, audited (I1) |
| Re-imprimir orden de entrega, orden empresa | ● | — | — | ● | |
| Re-imprimir notas, retenciones | — | — | — | ● | |
| Assign Control N° Δ | — | — | — | ● or Sistema | Depends on the fiscal capture (F26) |
| Registro de pagos | R own | — | — | ● | |
| Cobros Cashea, Cuentas por cobrar, Cuentas por pagar | — | — | — | ● | |
| Relación de referidos, Generar relación de paciente | — | — | — | ● | |
| Tipos de retenciones, Órdenes de compra | — | — | — | ● | |
| Restar inventario | — | — | C Δ | C | The bench consumes the reagents |

### Masters, prices, and costs

| Command | Recepción | Auxiliar | Bioanalista | Administración | Rule |
|---|---|---|---|---|---|
| Registro de médicos, empresas | R | — | R | ● | |
| Registro de proveedores | — | — | — | ● | |
| Registro de reactivos y servicios, equipos Δ | — | R | R | ● | |
| Parásitos, antibióticos, microorganismo, muestra and observaciones de bacteriología Δ | — | R | ● | R | Clinical lists (F13, I5) |
| Crear perfiles Δ | — | — | ● | ● | Clinical members, commercial use |
| Lista de precios | R | — | R | R | |
| Precio exámenes | — | — | — | C | |
| Aplicar aumento general | — | — | — | S | Preview stays |
| Insumos, servicios y otros, Costos reactivos, Promedios pacientes/pruebas, and their Lista reports | — | — | — | ● | |
| Salarios de personal, Lista de salarios | — | — | — | S | Sensitive pay data |
| Modificar valores | — | — | — | — | Blocked for everyone, per [brand/06-edge-cases.md:152](brand/06-edge-cases.md) |

### Reports

| Command | Recepción | Auxiliar | Bioanalista | Administración | Rule |
|---|---|---|---|---|---|
| Lista de pacientes, Lista de paciente por fecha | ● | — | ● | ● | Export audited |
| Lista de médicos, empresas | ● | — | ● | ● | |
| Lista de proveedores, reactivos y servicios, inventario de reactivos, equipos | — | — | R | ● | |
| Lista de ventas, compras, retenciones, pagos realizados, cuentas por pagar, cuentas por cobrar, presupuestos, and their flyouts | — | — | — | ● | Bioanalysts do not need the libros |
| Evolución de pacientes Δ | — | — | ● | — | Moved to the clinician (F18). Each open is logged |
| Estadísticas Δ | — | — | ● | ● aggregates only | Small groups suppressed so a person cannot be identified |

### Delivery

| Command | Recepción | Auxiliar | Bioanalista | Administración | Rule |
|---|---|---|---|---|---|
| Generar PDF, Liberado | ● | — | ● | — | Settles F33 |
| Generar PDF, draft `INCOMPLETO` | — | — | ● | — | Watermarked |
| Enviar WhatsApp, Enviar correo, Liberado | C | — | C | — | Confirm shows the destination |
| Approve incomplete send Δ | — | — | S | — | Names the missing sections (F10, I7) |
| Enviar after that approval | C | — | C | — | |
| Resend after a correction Δ | C | — | C | — | Task created automatically (I8) |

### System maintenance

| Command | Recepción | Auxiliar | Bioanalista | Administración | Rule |
|---|---|---|---|---|---|
| Nuevo usuario, disable user | — | — | — | S | See E-05 to E-09 |
| Grant Bioanalista Δ | — | — | — | S + license | Notifies existing bioanalysts (F12) |
| Reset another user's Clave Δ | — | — | — | S | Temporary, forced change at next sign-in |
| Registro de correo | — | — | — | S | Secret is write-only and never shown back |
| Respaldo de la BD | — | — | — | S | Encrypted, fixed destination (F22) |
| Auditoría: all events | — | — | — | R | Clinical before-and-after text masked Δ |
| Auditoría: clinical events | — | — | R | — | Bioanalysts see the clinical trail Δ (F18) |

### Client, public, and system

| Actor | Allowed | Refused |
|---|---|---|
| Cliente | Ingresar, Mis visitas, Descargar informe when Liberado, Salir | Any other client's order. Voided orders. An unreleased grid. Any write beyond the session and audit |
| Público | Verification page with a valid token: order number, laboratory name, report date, state, and whether the issue was replaced | Valid-looking number without the token. Cédula, phone, or result |
| Sistema: analyzer | Write `CARGADO` values with source `equipo`, to unreleased results | Overwriting a typed value. Liberar. Writing to a released result |
| Sistema: sender | Read the issued file for one approved delivery. Write its result | Reading anything else |
| Sistema: scheduler | Saturday switch, if D10 approves | Anything else |

## 7. Edge-case register

Each case states the proposed result. **Event** names are proposed where section 9 adds them.

### Accounts and sessions

| ID | Case | Proposed handling |
|---|---|---|
| E-01 | Very first administrator | Created once by an installation procedure, then disabled. Writes `user.create` with source `instalación` |
| E-02 | Last active administrator is disabled or demoted | Refused. Must always have one |
| E-03 | Sole administrator forgets the password | Documented offline recovery, witnessed and audited. No back-door account |
| E-04 | Self-administration | Cannot change own roles, disable self, or reset own password through admin tools |
| E-05 | Person changes job | Roles replaced, not added to. `user.role.change` with before and after |
| E-06 | Person leaves | Disabled, never deleted. Name stays on historical records. Sessions end immediately |
| E-07 | Person holds several roles | Allowed. Listed in a monthly conflict report |
| E-08 | Temporary cover | Time-limited grant with an end date and motivo. Ends on its own |
| E-09 | Bioanalyst's license is removed or lapsed | Role suspended, past releases unaffected. Lapse tracking depends on D2 |
| E-10 | Failed staff sign-ins | After 5 attempts, a 15-minute pause. `session.enter.failed`. One generic message |
| E-11 | Unattended workstation | Locks after 10 minutes, and re-entry returns the same user to the same screen. Unsaved cell text stays |
| E-12 | Shared PC at shift change | Fast user switch. The previous session ends and never carries over |
| E-13 | Same user on two PCs | Allowed. Cierre de caja counts all of that user's payments, which are labeled by workstation |
| E-14 | Role removed mid-session | Next request is refused with `BLOQUEADO`, and the menu refreshes |
| E-15 | Direct URL or API call without the right | Refused on the server, `BLOQUEADO`, no values, `access.denied` event |

### Clients

| ID | Case | Proposed handling |
|---|---|---|
| E-16 | Merge, one row has no cédula | Administration, S. The usual duplicate-cleanup case |
| E-17 | Merge, two different complete cédulas | Refused by default. They may be two people (D6) |
| E-18 | Wrong merge discovered | `patient.unmerge` restores from a stored map of moved orders. Portal access is cut until this finishes |
| E-19 | Merge while one has an open portal session | Rights rechecked at the next request |
| E-20 | Deactivated client signs in | Still allowed, per the existing rule. The client's own results remain theirs |
| E-21 | Young child with no cédula | D5. Proposed: a billing party's cédula on the factura, and the child stays Sin verificar without portal access |
| E-22 | Representative wants a minor's results | D5. Proposed: staff send to a recorded representative. Portal access waits for a defined link |
| E-23 | Birth date changed after a result | Recalculates age on screen, flags the order for review, released report keeps its printed age |
| E-24 | Phone changed just before a send | Confirm shows the destination, and `patient.save` keeps the prior value |

### Results

| ID | Case | Proposed handling |
|---|---|---|
| E-25 | Bioanalyst releases a value they typed | Allowed. Recorded and reported (D7) |
| E-26 | Auxiliary's typed value awaits release | Stays `CARGADO`. Never reaches reception or the portal |
| E-27 | Analyzer value arrives on a typed cell | Typed value stays. The incoming value is shown beside it for the bioanalyst to resolve |
| E-28 | Analyzer value arrives after release | Refused from the result. Queued and shown as a discrepancy |
| E-29 | Two people on one cell | Per-cell version check. The second sees "guardado por [usuario] a las [hora]" and both values |
| E-30 | Two bioanalysts release at once | First succeeds. Second is told. `Procesado por` is the first |
| E-31 | Correction opened and abandoned | Stays `EN_CORRECCION`, listed on the worklist. Cancelling restores the prior released text with no new version |
| E-32 | Correction by a different bioanalyst | Allowed. New `Procesado por`, and the trail keeps both |
| E-33 | Portal or QR during a correction | Portal shows "En revisión" with no grid. QR says the same |
| E-34 | Correction released | New issue is created automatically. Old one is `REEMPLAZADO`. Earlier deliveries appear as a resend task |
| E-35 | Result with `SIN PRECIO` line | Liberar stays blocked, per [brand/08-data-lifecycle.md:60](brand/08-data-lifecycle.md). Reconsider in D9, since a price gap should not delay urgent care |
| E-36 | Bioanalyst absent, patient waiting | No override. Non-bioanalysts cannot release. Draft is refused for reception |

### Delivery, portal, and verification

| ID | Case | Proposed handling |
|---|---|---|
| E-37 | Partial release of an order | Portal shows only the released sections, labeled partial, if D1 is per section. Otherwise Pendiente |
| E-38 | Send fails | Stored failure, order unchanged, existing rule |
| E-39 | Portal with money still owed | D8. Documents allow download regardless of Resta |
| E-40 | Portal on a shared device | Visible Salir, 15-minute idle timeout within the three-hour limit, no cached PDF |
| E-41 | Guessing cédulas from one address | Existing failure window by hash and by address, with a keyed hash (F16) |
| E-42 | Pendiente row content | Date and order number only, no exam names |
| E-43 | Scanning a corrected report's QR | "Esta versión fue reemplazada" and the date, no values |
| E-44 | Scanning a voided order's QR | "No disponible" |
| E-45 | Verification-page sweep | Random token is required, with rate limiting. An order number alone reveals nothing |
| E-46 | Company asks for an employee's result | No access in the application. Delivery only to the client unless consent is recorded |

### Money and configuration

| ID | Case | Proposed handling |
|---|---|---|
| E-47 | Same user takes and reverses a payment | Same-day own reversal allowed, with motivo, and reported. Otherwise administration |
| E-48 | Payment after the drawer is closed | Goes to the next open period, keeping its real time |
| E-49 | Reception away at end of shift | Administration closes, S and motivo, naming whose drawer |
| E-50 | Voiding an order with a fiscal number | Number is never reused. Note issued. Original stays |
| E-51 | Rate changed mid-day | New documents only. Saved documents are unchanged. Open unsaved orders are warned at Guardar |
| E-52 | Switch changed while others are working | Global from that moment. Each desk's chip refreshes. Each line records what applied |
| E-53 | Restoring a backup | Admin procedure, outside normal operation. Writes `backup.restore`, and the log records the gap |
| E-54 | Audit read shows clinical text | Masked for administration. The view is logged |

## 8. Decisions needed

Each changes what gets built. The recommendation is the default if the owner has no strong preference.

| ID | Decision | Recommendation | Owner |
|---|---|---|---|
| D1 | Liberar per exam, per section, or per visit | Per section, because the October cases already reason in sections | Lead bioanalyst |
| D2 | Must a bioanalyst's license number be stored, and does it expire | Store it and print it if the laboratory wants it. Track expiry only if the Colegio requires renewal | Lead bioanalyst |
| D3 | May Auxiliar enter results | Yes before release, never release | Lead bioanalyst |
| D4 | Physician account in the first release | No | Owner |
| D5 | Minors and representatives | Billing party's cédula on the factura and staff delivery first. Portal link later | Owner, legal |
| D6 | Merging two different complete cédulas | Refuse. Fix a wrong cédula through a separate audited administrator action | Owner |
| D7 | Second reviewer for self-entered values | No, recorded and reviewed instead. A one-person shift cannot comply | Lead bioanalyst |
| D8 | Does owing money block portal access | No, because a clinical result should not be held by a billing state. Confirm with the owner | Owner |
| D9 | Should `SIN PRECIO` block Liberar | No. It should block the fiscal issue only. This changes a current rule | Owner, lead bioanalyst |
| D10 | Precio sábado by calendar | Yes, with a manual override | Administration |
| D11 | Discount limit, and who approves above it | Set a percent, with administrator approval above it | Owner |
| D12 | **Portal credential.** Stated rule is cédula only (F15) | Cédula plus Fecha de nac. as the immediate minimum, because the date is required on the client and is not printed on the report. It is weak against relatives. Add a one-time code once the WhatsApp provider is known | Owner, legal |
| D13 | Legal review | Have Venezuelan counsel confirm duties for health data, retention, and minors. These documents do not establish them, and this plan is not legal advice | Owner |

## 9. Granular data: how, when, where, why

### One record for each decision

| Question | Field | Example |
|---|---|---|
| Who | User id, display name, roles held, session id | Recepción, session 8841 |
| What | Command, record type, record id, record state | `order.void`, order 0142, `ABIERTA` |
| When | Server time, America/Caracas | 01/11/2026 09:14:22 |
| Where | Channel, workstation, address | Staff, RECEPCION-2 |
| How | Gesture and source | Confirm, step-up, `teclado`, `equipo` |
| Why | Motivo where required, policy version, rule id | "Paciente desistió," v3, R-114 |
| Result | Allowed, refused with reason code, or failed | `DENY:STATE` |
| Change | Before and after, for corrections and sensitive edits | Masked outside clinical roles |

**Rules for this data:** Append-only. Application accounts cannot update or delete it. Each row includes a hash of the prior row, so tampering is detectable. Refused events store no cédula digits and no results. Retention is set per D13, with fiscal records subject to the six-year expectation already noted in the documents.

### Events to add

Existing names stay. These fill the gaps in [brand/08-data-lifecycle.md:171](brand/08-data-lifecycle.md):

| Group | Events |
|---|---|
| Sessions and access | `session.enter.failed`, `session.lock`, `session.timeout`, `access.denied`, `step_up.failed`, `password.change`, `password.reset` |
| Users | `user.create`, `user.disable`, `user.role.change`, `user.grant.temporary` |
| Clients | `patient.merge`, `patient.unmerge`, `patient.deactivate`, `patient.delete` |
| Orders | `order.void`, `order.save.refused`, `order.line.change.discount` |
| Results | `result.release`, `result.correct.open`, `result.correct.cancel`, `result.correct.release`, `result.conflict` |
| Issue and delivery | `report.superseded`, `delivery.incomplete.approved`, `delivery.resend.task` |
| Money | `payment.reverse`, `cash.close`, `cash.reopen`, `month.close`, `note.issue`, `rate.change`, `control.assign` |
| Configuration | `setting.qr.change`, `setting.saturday.change`, `mail.config.change`, `backup.restore`, `policy.publish` |

### What the data will reveal

| Measure | Signal | Response |
|---|---|---|
| Refusals by role and command | Repeated `DENY:ROLE` shows a matrix error, or someone probing | Fix the table or look into the person |
| Time from `CARGADO` to Liberar | Where release waits | Staffing or workflow |
| Corrections per bioanalyst, per exam, and after delivery | Quality or training pattern | Review |
| Time from correction to resend | Patients left holding a wrong result | Alert past a limit |
| Discounts and non-default price columns per user | Hidden discounting | Weekly review |
| Same-user payment reversals | Possible cash skimming | Weekly review |
| Sign-ins and actions outside a person's usual hours or workstation | Shared passwords | Review. Use plain thresholds, not a machine-learning model |
| Portal failures by address | Guessing | Tighten limits |
| Step-up failures on Liberar | Someone trying a colleague's session | Immediate review |
| Evolución and audit views per user | Curiosity browsing of records | Monthly review |

Who reviews the reviewer: a monthly summary goes to the owner and lead bioanalyst, not only to administration (F31).

## 10. Step-by-step plan

Order matters. Each phase has a condition for finishing it. Work begins only when the previous phase's condition is met.

### Phase 0: Close evidence gaps

1. Capture Nuevo usuario, Clave, Auditoría, Hoja de trabajo, Cargar resultados, and Forma de pago in the current program.
2. Interview the laboratory: who actually does which job per shift, who covers absences, and what happens on Saturdays.
3. Confirm the deployment model, LAN or internet, because it sets the portal risk.

**Done when:** A real shift map exists, and the Unknown labels that affect access are replaced or knowingly kept.

### Phase 1: Decide

1. The owner and lead bioanalyst work through D1 to D13.
2. Start with D12 and D1, because the most other rules depend on them.

**Done when:** Each decision has a named owner and a recorded answer.

### Phase 2: Correct the specification

1. Move the accepted content into `product/06-access-control.md` and add it to the reading order in [product/README.md](product/README.md).
2. Add Administración to [product/01-application-type.md](product/01-application-type.md) and make "published set" in the catalog read "the application's roles."
3. Resolve the conflicts:

| Conflict | Files |
|---|---|
| Name edit until release vs always | [brand/04-display-patterns.md:83](brand/04-display-patterns.md), [product/04-edges.md:56](product/04-edges.md) |
| Generar PDF owner | [brand/07-feature-catalog.md:165](brand/07-feature-catalog.md), [brand/08-data-lifecycle.md:106](brand/08-data-lifecycle.md) |
| Incomplete-send approver | [brand/04-display-patterns.md:420](brand/04-display-patterns.md), [brand/06-edge-cases.md:64](brand/06-edge-cases.md) |
| Rate at sign-in vs at save | [brand/04-display-patterns.md:66](brand/04-display-patterns.md), [product/05-data.md:27](product/05-data.md) |
| One role vs many | [brand/08-data-lifecycle.md:155](brand/08-data-lifecycle.md), [sicoexc-research.md:278](sicoexc-research.md) |
| Who reads clinical review reports | [brand/07-feature-catalog.md:135](brand/07-feature-catalog.md), [workflow/08-review.md:41](workflow/08-review.md) |

4. Add the new commands: Anular orden, reverse payment, reopen close, set rate, unmerge, reset password.
5. Add the event list from section 9 to the lifecycle page.

**Done when:** Each catalog command has one actor rule, and no two pages disagree.

### Phase 3: Build the core, before any screen

1. Create the permission table as versioned data, matching section 6 row for row.
2. Build the single server-side `decide` function, denying by default.
3. Build the state machines from section 4.
4. Build the append-only audit store, then the decision record.
5. Generate tests from the table (section 11).

**Done when:** All matrix tests pass, and no route can reach data without `decide`.

### Phase 4: Identity

1. Staff accounts, many roles per user, Clave, reset, and recovery.
2. Lockout, idle lock, fast user switch, and step-up.
3. Installation procedure for the first administrator, and the last-administrator guard.
4. Immediate revocation.

**Done when:** E-01 to E-15 pass.

### Phase 5: High-risk gates, in risk order

1. Liberar with step-up and `result.release`.
2. Liberar corrección, supersession, and the resend task.
3. Fusionar under administration, with stored mapping and unmerge.
4. Incomplete-send approval.
5. Discount limits, price-column rule, void, reversal, and close handling.
6. Tasa BCV ownership and global switch behavior.

**Done when:** E-16 to E-36 and E-47 to E-54 pass.

### Phase 6: Portal and public boundary

1. Separate session type, with no way to reach staff routes.
2. D12's credential, keyed hash, and limits.
3. Per-request ownership checks on every list, detail, and download.
4. Random verification tokens, version-aware QR, and limits.
5. An independent penetration test of these two surfaces before anything is public.

**Done when:** E-37 to E-46 pass, and the test has no open critical or high findings.

### Phase 7: Measure and tune

1. Build Auditoría views and the section 9 measures.
2. Pilot at the real laboratory on real shifts, logging refusals.
3. Review refusals weekly. Each repeated refusal is a table change or a training issue. Table changes are versioned.
4. Begin monthly reviews by the owner and lead bioanalyst.

**Done when:** A full month passes without a legitimate task being blocked, and with no shared-login workarounds.

## 11. Verification

| Test | Method |
|---|---|
| Matrix | Generated from the table: each role × each command × each state × each ownership case, and the expected decision. New commands fail until they are added |
| Default deny | A route with no table entry is refused |
| Screen agreement | Menus and buttons match `decide` for each role |
| Direct access | Each refused command is called directly, bypassing the screen |
| Foreign record | Each portal route is tried with another client's id |
| Invariants | No unreleased value ever reaches reception, portal, QR, or a sender. Only Bioanalista creates `result.release`. There is always an active administrator. No application account can alter audit rows |
| Concurrency | Two users, and a user with an analyzer, on the same cell, release, and close |
| Revocation | A role is removed during an action, and the next request is refused |
| Audit completeness | Each allowed, refused, and failed command leaves exactly one matching record |
| Restore | A backup restores, and audit-chain checks still pass or expose the gap |

## 12. Execution status

As of 1 November 2026. Line references in sections 3 and 10 point at the documents as they were before these corrections, so some lines have moved.

| Phase | Status | What happened, or what it needs |
|---|---|---|
| 0. Close evidence gaps | **Not run** | Needs the laboratory: captures of the unopened forms, a shift interview, and the deployment model |
| 1. Decide | **Mostly done** | D1 to D12 accepted as recommended. The owner must set the discount percent, which starts at 0. The lead bioanalyst should confirm D1, D2, D3, D7, and D9. D13, the legal review, is open |
| 2. Correct the specification | **Done** | [product/06-access-control.md](product/06-access-control.md) added, and the conflicts in `product/` and `brand/` resolved. Evidence layers were left as they are, because they record what was seen |
| 3. Build the core | **Specified only** | The table, the decision, and the state machines are in [product/06-access-control.md](product/06-access-control.md) and [product/07-rule-reference.md](product/07-rule-reference.md). A temporary reference version was used to check the rules, then removed, because the project is documentation only at this moment |
| 4. Identity | **Not started** | Needs an application. The decision rules for self-administration and the last administrator exist. Sign-in, lockout, and sessions do not |
| 5. High-risk gates | **Rules only** | The permissions are enforced by the table. The features themselves, such as supersession and unmerge, need an application |
| 6. Portal and public boundary | **Rules only** | Needs an application, then an independent penetration test |
| 7. Measure and tune | **Not started** | Needs a pilot at the laboratory |

**One addition to the plan:** Rule R-034. The plan left an order with unreleased results and no payment with no one able to void it. Administración now can, with a password re-entry and a motivo.

**No application is being built at this moment.** Phases 3 to 7 wait until that changes.
