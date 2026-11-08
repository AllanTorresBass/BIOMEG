# Access control

**Type:** [01-application-type.md](01-application-type.md)
**Analysis and evidence:** [../access-control-plan.md](../access-control-plan.md)
**Row conditions and command names:** [07-rule-reference.md](07-rule-reference.md)  
**Table version:** 7. Each change to the table raises it, and each audit row stores the version that decided it

This page says who may run each command, in which state, with which gesture, and what is recorded. If an actor on another page differs, this page wins. All of it is a **design rule**. The vendor published no permission matrix, and the screens that would show the current program’s rules were not opened.

## The rule

Every action, by every actor, gets one decision on the server. A hidden button is a display choice and never a control.

| Order | Question | Refused with |
|---|---|---|
| 1 | Is this a valid session on an active account? | `SESSION` |
| 2 | Does any of this person’s roles grant the command? | `ROLE` |
| 3 | Does the record’s state allow it? | `STATE` |
| 4 | Is this person related to the record as required? | `OWNERSHIP` |

An allowed action then asks for its gesture: none, a confirm, or a password re-entry. Some also require a typed motivo.

- A command not in the table is refused. So is a command that needs a fact the caller did not supply.
- A person may hold several staff roles. The conflict is recorded and reviewed, because a small laboratory cannot always separate jobs.
- A client, public, or system session never carries staff rights.
- Rights are checked on each request, so a removed role or a merged client stops working at once.
- The password re-entry confirms who is at the keyboard. It is not an electronic signature, which stays out of the application.

## Roles

| Role | Who holds it | Note |
|---|---|---|
| Recepción | Receptionist, secretary | One permission set. The job title can differ |
| Auxiliar | Auxiliary, assistant | Enters results before release. Never releases |
| Bioanalista | Licensed bioanalyst | The grant requires a license number and notifies the other bioanalysts |
| Administración | Owner, administrator | Money, registries, users, and backup. No clinical values |
| Cliente | Portal session | Own orders only |
| Público | Holder of the paper | Verification page, with the token in the code |
| Sistema | Analyzer link, sender, scheduler | Cannot sign in. Limited to its own commands |

The physician has no account in the first release. The physician stays a name on the order and a reader of the delivered report.

## Decisions

Accepted on 1 November 2026, on the instruction to apply the recommendations.

| Decision | Rule | Still needs |
|---|---|---|
| Unit of release | Liberar is per section | Lead bioanalyst to confirm |
| License | A bioanalyst’s license number is stored. Expiry is tracked only if the Colegio requires renewal | Lead bioanalyst to confirm |
| Auxiliary | Enters results before release. Never releases | Lead bioanalyst to confirm |
| Physician | No account in the first release | |
| Minors and representatives | A billing party’s cédula on the factura, and staff delivery. A portal link comes later | Legal review |
| Two different cédulas | A merge is refused. A wrong cédula goes through Corregir cédula | |
| Reactivar | Same roles and confirm as Desactivar (R-017). Soft-deleted clients stay hidden | |
| Administración creates clients | R-014 also grants Administración create and Modificar, so the owner account can cover reception | |
| Self-entered values | No second reviewer. Recorded and reviewed | Lead bioanalyst to confirm |
| Money owed | Does not block the portal or the release | |
| `SIN PRECIO` | Blocks the fiscal issue. Does not block Liberar. This replaces the earlier rule | Lead bioanalyst to confirm |
| Precio sábado | By calendar, with a manual switch for Administración | |
| Discount limit | Reception up to a limit, and an administrator with a motivo above it | **Owner to set the percent. It starts at 0, so any discount needs an administrator** |
| Portal credential | Cédula and Fecha de nac., then a one-time code to the phone on file. The portal doesn't open to real clients until the code works. Email isn't used for the code. Fecha de nac. alone is weak against relatives. This replaces the earlier rule, where the code came later | Legal review |
| Fecha reporte under per-section release | Written at the first Liberar and updated by each later Liberar of that order | Lead bioanalyst to confirm |
| Same cédula on several rows | A new save cannot create them. They can only be rows brought over from the current program, until Fusionar joins them. A portal session holds only the rows that also match Fecha de nac. This replaces the earlier rule, which held every row with that cédula | Owner to confirm |
| Default price column | Until a saved pair sets a default, the operator chooses the column. After that, another column needs a confirm and a motivo | |
| Motivo on Anular orden | Every void needs a motivo, including one by Administración | |
| Routine reads in the audit log | Three tiers. Every write, gesture, sign-in, refusal, and failure, and every read of clinical values, identity, money, reports, or the audit log, writes its own row. Allowed reads of `shell.view` and of catalogs and registries with no patient data become one row per user per day. Repeated refusals with no session, past the rate limit, become one row per address per minute. This narrows "every decision" | Owner to confirm |
| Audit row can't be written | The action doesn't happen, for writes and for reads of clinical values | Owner and lead bioanalyst to confirm |
| Clinical events in Auditoría | `result.*`, `report.issue`, `report.pdf`, `report.superseded`, `order.line.remove` with a result, `bacteriology.note.add`, `verify.file.read`, and views of Evolución de pacientes | Lead bioanalyst to confirm |
| Masking in Auditoría | Administración sees identity changes, because it runs Corregir cédula. Clinical text stays masked, and so does the motivo on clinical events, because free text can hold a value | Owner to confirm. **Showing identity changes also needs legal review** |
| Granting Bioanalista | Only through R-126, with a license. A new user, a role change, or temporary cover can't include it. Absence of a bioanalyst still has no override (E-36) | Owner and lead bioanalyst to confirm |
| Resetting another user's Clave | Ends their sessions, and notifies them and the owner | Owner to confirm |
| What the QR page proves | By itself, the state only, and it says so. An optional value check lets the holder open the original report, using a second code printed on the paper, for 90 days. **It stays off until confirmed** | Owner, lead bioanalyst, and legal review, before it's turned on |
| How a report is sent | A portal link once the one-time code works. An attachment only with recorded consent, before then or for a client who can't use the portal | Owner and legal review |
| Outage | [11-outage-procedure.md](11-outage-procedure.md) is a draft, with proposed targets | Owner to set them, and lead bioanalyst and accountant to complete their parts |
| Order states | `BORRADOR` and the move to `INCOMPLETO`, as under Record states | Lead bioanalyst and owner to confirm |
| Procesado por on the report | A name per section when different bioanalysts released them | Lead bioanalyst to confirm |
| Staff sign-in and roles | BIOMEG manages all of it itself: accounts, passwords, sessions, roles, and every permission decision. No outside identity service such as Auth0 | Decided on 1 November 2026 |
| Convenio record | A convenio is a row in Registro de empresas, with its Status and Requiere titular. The titular is stored on the order | Owner to confirm |
| Reviewing this table | With no application or test to enforce it, a person reviews each change. A build must run the permission tests in V0-03 | Owner to confirm |
| Audit log practices | Everything in [09-audit-log.md](09-audit-log.md), and its starting values | Owner and lead bioanalyst to confirm |
| Security baseline | [10-security-baseline.md](10-security-baseline.md), including a second factor for Administración and Bioanalista | Owner to confirm |
| Legal duties | Health data, retention, and minors | **Open. Venezuelan counsel has not reviewed this page** |

## Record states

```text
Order:  BORRADOR → ABIERTA → INCOMPLETO → LIBERADO ⇄ EN_CORRECCION
                     └────────────┴──→ ANULADA (no result released)

Result: PENDIENTE → CARGADO → LIBERADO → EN_CORRECCION → LIBERADO (new version)

Issue:  VIGENTE → REEMPLAZADO (once a correction is released)
```

`BORRADOR` is the unsaved Nueva orden, and isn't listed anywhere outside it. Guardar moves it to `ABIERTA`. The first stored result moves it to `INCOMPLETO`. Liberar works per section. An order is `LIBERADO` when every section is released. Until then it is `INCOMPLETO`, and released sections can be read.

A correction works on one released section, and that section’s results move to `EN_CORRECCION`. A fully released order moves to `EN_CORRECCION` with them. An `INCOMPLETO` order stays `INCOMPLETO`, and the section under correction shows “En revisión” until it is released again.

## Permission matrix

**Key.** `●` allowed. `C` needs a confirm. `S` needs a password re-entry. `R` read only. `—` refused. The ID joins a row to its command names and conditions in [07-rule-reference.md](07-rule-reference.md). A change to a row goes in this table, and a change to its conditions also goes on that page.

### Session and shell

| ID | Command | Recepción | Auxiliar | Bioanalista | Administración | Note |
|---|---|---|---|---|---|---|
| R-001 | Entrar, Cerrar sesión, Salir, Clave | ● | ● | ● | ● | Own account only |
| R-002 | View Tasa BCV, QR, Precio sábado | R | R | R | R |  |
| R-003 | Set Tasa BCV | ● today only | — | — | ● | Reception only when today has no rate. Later changes are administration's |
| R-004 | Switch QR, Precio sábado | — | — | — | C | Applies to the whole laboratory from that moment. Audited |
| R-005 | Nueva observación, Mostrar, Ocultar, Buscar | ● | ● | ● | ● | Content unknown. No patient data until captured |

### Clients and orders

| ID | Command | Recepción | Auxiliar | Bioanalista | Administración | Note |
|---|---|---|---|---|---|---|
| R-010 | Clientes: search, read | ● | R on own worklist | R | R |  |
| R-011 | Change cédula through Modificar after an order exists | — | — | — | — | Refused for everyone. See Corregir cédula |
| R-012 | Change Fecha de nac. or sex after a result | C | — | ● | — | Flags the order for bioanalyst review |
| R-013 | Change phone or email after Liberar | C | — | — | — | Stores the value before and after |
| R-014 | Create client, Modificar pacientes | ● | — | — | ● | Administración covers reception when needed |
| R-015 | Corregir cédula after an order exists | — | — | — | S + motivo | New command. Issued documents keep what they printed |
| R-016 | Incluir inactivos | ● | — | — | ● |  |
| R-017 | Desactivar, Reactivar | C | — | — | C | Same gesture for both. Soft-deleted clients stay out of Reactivar |
| R-018 | Eliminar | — | — | — | C | The 30-day rule stays |
| R-019 | Request Fusionar | ● | — | — | — | New command. Reception asks and administration acts |
| R-020 | Fusionar | — | — | — | S | Two complete, different cédulas are refused |
| R-021 | Deshacer fusión | — | — | — | S + motivo | New command. Restores from the stored map of moved orders |
| R-022 | Trasladar paciente | — | — | — | — | Blocked until a capture names the destination |
| R-023 | Ingreso particular, Ingreso empresa, Facturar consulta | ● | — | — | — |  |
| R-024 | Discount | ● to limit | — | — | ● | The limit is a setting. It starts at 0 percent until the owner sets it |
| R-025 | Discount above the limit | — | — | — | ● + motivo | Administrator approval and motivo |
| R-026 | Price column other than the default | C + motivo | — | — | ● | Applies once a saved pair sets a default. Until then the operator chooses |
| R-027 | Add exam line | ● | — | — | — |  |
| R-028 | Remove line, no results | ● | — | — | ● |  |
| R-029 | Remove line, result exists | — | — | S | — | Clinical correction. Money follows through a note |
| R-030 | Anular orden: result released | — | — | — | — | Refused. Correct it instead |
| R-031 | Anular orden: payment exists | — | — | — | S + motivo | Requires a credit note. A fiscal number is never reused |
| R-032 | Anular orden: no payment, no result | C + motivo | — | — | ● + motivo | New command |
| R-034 | Anular orden: unreleased results, no payment | — | — | — | S + motivo | Added in review. The plan left this case with no owner |
| R-033 | Presupuesto, Generar presupuesto | ● | — | — | ● |  |

### Work and results

| ID | Command | Recepción | Auxiliar | Bioanalista | Administración | Note |
|---|---|---|---|---|---|---|
| R-040 | Hoja de trabajo | status only | ● | ● | — | No values for reception |
| R-041 | Status de impresión | R | ● | ● | — |  |
| R-042 | Cargar resultados: empty or own typed cell | — | ● | ● | — | Before release only |
| R-043 | Overwrite analyzer or another's value | — | — | ● + motivo | — |  |
| R-044 | Read grid before release | — | ● | ● | — | Reception cannot read values under correction either |
| R-045 | Read grid after release | R | R | R | — | Administration has no need for clinical values |
| R-046 | Liberar | — | — | S | — | Per section. One re-entry covers the selected batch. Not an electronic signature |
| R-047 | Liberar corrección: open | — | — | S + motivo | — | Opens EN_CORRECCION |
| R-048 | Edit or cancel an open correction | — | — | ● | — | Cancel restores the released text with no new version |
| R-049 | Liberar corrección: release | — | — | S | — | Creates a new issue, replaces the old one, and creates the resend task |
| R-050 | Agregar nota de bacteriología | — | — | ● | — | Bacteriology orders only. Moved out of Mantenimiento |
| R-051 | Imprimir por paciente, Imprimir prueba individual | ● Liberado | — | ● | — |  |
| R-052 | Imprimir referidos | ● | — | — | ● |  |

### Money

| ID | Command | Recepción | Auxiliar | Bioanalista | Administración | Note |
|---|---|---|---|---|---|---|
| R-060 | Record payment, Agregar abono | ● | — | — | ● |  |
| R-061 | Reverse payment | same day, own, C + motivo | — | — | S + motivo | New command. The original row stays |
| R-062 | Cierre de caja: own | ● | — | — | ● |  |
| R-063 | Cierre de caja: another user's | — | — | — | S + motivo |  |
| R-064 | Reopen a close | — | — | — | S + motivo | New command |
| R-065 | Cierre mensual | — | — | — | S |  |
| R-066 | Nota de crédito, Nota de débito | — | — | — | S |  |
| R-067 | Reversar relación | — | — | — | S | Blocked until "relación" is known |
| R-068 | Re-imprimir factura | ● | — | — | ● | COPIA, audited |
| R-069 | Re-imprimir orden de entrega, orden empresa | ● | — | — | ● |  |
| R-070 | Re-imprimir notas, retenciones | — | — | — | ● |  |
| R-071 | Assign Control N° | — | — | — | ● or Sistema | Depends on the fiscal capture |
| R-072 | Registro de pagos | R own | — | — | ● |  |
| R-073 | Cobros Cashea, Cuentas por cobrar, Cuentas por pagar | — | — | — | ● |  |
| R-074 | Relación de referidos, Generar relación de paciente | — | — | — | ● |  |
| R-075 | Tipos de retenciones, Órdenes de compra | — | — | — | ● |  |
| R-076 | Restar inventario | — | — | C | C | The bench consumes the reagents |

### Masters, prices, and costs

| ID | Command | Recepción | Auxiliar | Bioanalista | Administración | Note |
|---|---|---|---|---|---|---|
| R-080 | Registro de médicos, empresas | R | — | R | ● |  |
| R-081 | Registro de proveedores | — | — | — | ● |  |
| R-082 | Registro de reactivos y servicios, equipos | — | R | R | ● |  |
| R-083 | Parásitos, antibióticos, microorganismo, muestra and observaciones de bacteriología | — | R | ● | R | Clinical lists |
| R-084 | Crear perfiles | — | — | ● | ● | Clinical members, commercial use |
| R-085 | Lista de precios | R | — | R | R |  |
| R-086 | Precio exámenes | — | — | — | C |  |
| R-087 | Aplicar aumento general | — | — | — | S | The preview stays |
| R-088 | Insumos, servicios y otros, Costos reactivos, Promedios pacientes/pruebas, and their Lista reports | — | — | — | ● |  |
| R-089 | Salarios de personal, Lista de salarios | — | — | — | S | Sensitive pay data |
| R-090 | Modificar valores | — | — | — | — | Blocked for everyone |

### Reports

| ID | Command | Recepción | Auxiliar | Bioanalista | Administración | Note |
|---|---|---|---|---|---|---|
| R-100 | Lista de pacientes, Lista de paciente por fecha | ● | — | ● | ● | Export audited |
| R-101 | Lista de médicos, empresas | ● | — | ● | ● |  |
| R-102 | Lista de proveedores, reactivos y servicios, inventario de reactivos, equipos | — | — | R | ● |  |
| R-103 | Lista de ventas, compras, retenciones, pagos realizados, cuentas por pagar, cuentas por cobrar, presupuestos, and their flyouts | — | — | — | ● | Bioanalysts do not need the libros |
| R-104 | Evolución de pacientes | — | — | ● | — | Moved to the clinician. Each open is logged |
| R-105 | Estadísticas | — | — | ● | ● aggregates only | Small groups suppressed so a person cannot be identified |

### Delivery

| ID | Command | Recepción | Auxiliar | Bioanalista | Administración | Note |
|---|---|---|---|---|---|---|
| R-110 | Generar PDF, Liberado | ● | — | ● | — |  |
| R-111 | Generar PDF, draft `INCOMPLETO` | — | — | ● | — | Watermarked |
| R-112 | Enviar WhatsApp, Enviar correo, Liberado | C | — | C | — | The confirm shows the destination. An attachment needs recorded consent |
| R-113 | Approve incomplete send | — | — | S | — | Names the missing sections. Creates a ready-to-send item |
| R-114 | Enviar after that approval | C | — | C | — | An attachment needs recorded consent |
| R-115 | Resend after a correction | C | — | C | — | Task created automatically. An attachment needs recorded consent |

### System maintenance

| ID | Command | Recepción | Auxiliar | Bioanalista | Administración | Note |
|---|---|---|---|---|---|---|
| R-120 | Nuevo usuario | — | — | — | S | A person who leaves is disabled, never deleted. Can't include Bioanalista |
| R-121 | Own access: disable self, change own roles, temporary cover, Bioanalista grant | — | — | — | — | Refused |
| R-122 | Disable or demote the last active administrator | — | — | — | — | Refused. There is always one |
| R-123 | Disable another user | — | — | — | S | Sessions end immediately |
| R-124 | Change another user's roles | — | — | — | S | Roles are replaced, not added to. Can't add Bioanalista |
| R-125 | Temporary cover | — | — | — | S + motivo | Ends on its own. Can't include Bioanalista |
| R-126 | Grant Bioanalista | — | — | — | S + license | The only way to grant it. Notifies existing bioanalysts and the owner |
| R-127 | Reset another user's Clave | — | — | — | S | Temporary, forced change at next sign-in. Ends their sessions, and notifies them and the owner |
| R-128 | Registro de correo | — | — | — | S | The secret is write-only and never shown back |
| R-129 | Respaldo de la BD | — | — | — | S | Encrypted, fixed destination |
| R-130 | Auditoría: all events | — | — | — | R | Clinical before-and-after text, and the motivo on clinical events, masked. Identity changes shown |
| R-131 | Auditoría: clinical events | — | — | R | — | Bioanalysts see the clinical trail. The list is under Decisions |

### Client, public, and system

| ID | Command | Actor | Allowed | Note |
|---|---|---|---|---|
| R-140 | Mis visitas, one row | Cliente | R | A voided order is omitted. A pending row has no exam names |
| R-141 | Portal grid and Descargar informe, Liberado | Cliente | R |  |
| R-142 | Portal grid and Descargar informe, released sections of a partial order | Cliente | R |  |
| R-143 | Portal Salir | Cliente | ● |  |
| R-144 | Verification page | Público | R | Order number, laboratory, report date, state, and whether the issue was replaced. Says that it doesn't confirm printed values |
| R-149 | Verification: open the original report | Público | R | Off until confirmed. Needs the printed code, a current issue, and a `LIBERADO` order, within 90 days |
| R-145 | Analyzer import | Sistema: analyzer | ● | A typed value stays. The incoming value waits beside it |
| R-146 | Sender: read the file for one approved delivery and write its result | Sistema: sender | ● |  |
| R-147 | Scheduler: Saturday calendar | Sistema: scheduler | ● | The manual switch stays with administration |
| R-148 | Sender: send a portal sign-in code | Sistema: sender | ● | Only to the phone on file, after the credentials match |

## Edge cases

### Accounts and sessions

| ID | Case | Handling |
|---|---|---|
| E-01 | Very first administrator | Created once by an installation procedure, then disabled. Writes `user.create` with source `instalación` |
| E-02 | Last active administrator is disabled or demoted | Refused. Must always have one |
| E-03 | Sole administrator forgets the password | Documented offline recovery, witnessed and audited. No back-door account |
| E-04 | Self-administration | Cannot change own roles, disable self, or reset own password through admin tools |
| E-05 | Person changes job | Roles replaced, not added to. `user.role.change` with before and after |
| E-06 | Person leaves | Disabled, never deleted. Name stays on historical records. Sessions end immediately |
| E-07 | Person holds several roles | Allowed. Listed in a monthly conflict report |
| E-08 | Temporary cover | Time-limited grant with an end date and motivo. Ends on its own |
| E-09 | Bioanalyst's license is removed or lapsed | Role suspended, past releases unaffected. Store the number. Expiry is tracked only if the Colegio requires renewal |
| E-10 | Failed staff sign-ins | After 5 attempts, a 15-minute pause for that account from that address. `session.enter.failed`. One generic message. See E-57 |
| E-11 | Unattended workstation | Locks after 10 minutes, and re-entry returns the same user to the same screen. Unsaved cell text stays |
| E-12 | Shared PC at shift change | Fast user switch. The previous session ends and never carries over |
| E-13 | Same user on two PCs | Allowed. Cierre de caja counts all of that user's payments, which are labeled by workstation |
| E-14 | Role removed mid-session | Next request is refused with `BLOQUEADO`, and the menu refreshes |
| E-15 | Direct URL or API call without the right | Refused on the server, `BLOQUEADO`, no values, `access.denied` event |

### Clients

| ID | Case | Handling |
|---|---|---|
| E-16 | Merge, one row has no cédula | Administration, S. The usual duplicate-cleanup case |
| E-17 | Merge, two different complete cédulas | Refused. They may be two people. A wrong cédula goes through Corregir cédula |
| E-18 | Wrong merge discovered | `patient.unmerge` restores from a stored map of moved orders. Portal access is cut until this finishes |
| E-19 | Merge while one has an open portal session | Rights rechecked at the next request |
| E-20 | Deactivated client signs in | Still allowed, per the existing rule. The client's own results remain theirs |
| E-21 | Young child with no cédula | A billing party’s cédula on the factura. The child stays Sin verificar, without portal access |
| E-22 | Representative wants a minor's results | Staff send to a recorded representative. Portal access waits for a defined link |
| E-23 | Birth date changed after a result | Recalculates age on screen, flags the order for review, released report keeps its printed age |
| E-24 | Phone changed just before a send | Confirm shows the destination, and `patient.save` keeps the prior value |

### Results

| ID | Case | Handling |
|---|---|---|
| E-25 | Bioanalyst releases a value they typed | Allowed. Recorded and reported. A one-person shift cannot have a second reviewer |
| E-26 | Auxiliary's typed value awaits release | Stays `CARGADO`. Never reaches reception or the portal |
| E-27 | Analyzer value arrives on a typed cell | Typed value stays. The incoming value is shown beside it for the bioanalyst to resolve |
| E-28 | Analyzer value arrives after release | Refused from the result. Queued and shown as a discrepancy |
| E-29 | Two people on one cell | Per-cell version check. The second sees "guardado por [usuario] a las [hora]" and both values |
| E-30 | Two bioanalysts release at once | First succeeds. Second is told. `Procesado por` is the first |
| E-31 | Correction opened and abandoned | Stays `EN_CORRECCION`, listed on the worklist. Cancelling restores the prior released text with no new version |
| E-32 | Correction by a different bioanalyst | Allowed. New `Procesado por`, and the trail keeps both |
| E-33 | Portal or QR during a correction | Portal shows "En revisión" with no grid. QR says the same |
| E-34 | Correction released | New issue is created automatically. Old one is `REEMPLAZADO`. Earlier deliveries appear as a resend task |
| E-35 | Result with `SIN PRECIO` line | Liberar is allowed. The fiscal issue stays blocked until the line has a price |
| E-36 | Bioanalyst absent, patient waiting | No override. Non-bioanalysts cannot release. Draft is refused for reception |

### Delivery, portal, and verification

| ID | Case | Handling |
|---|---|---|
| E-37 | Partial release of an order | Portal shows only the released sections, labeled partial. With none released, Pendiente |
| E-38 | Send fails | Stored failure, order unchanged, existing rule |
| E-39 | Portal with money still owed | Download is allowed. A billing state does not hold a clinical result |
| E-40 | Portal on a shared device | Visible Salir, 15-minute idle timeout within the three-hour limit, no cached PDF |
| E-41 | Guessing cédulas from one address | Existing failure window by hash and by address, with a keyed hash. A one-time code is still required after a correct guess |
| E-42 | Pendiente row content | Date and order number only, no exam names |
| E-43 | Scanning a corrected report's QR | "Esta versión fue reemplazada" and the date, no values |
| E-44 | Scanning a voided order's QR | "No disponible" |
| E-45 | Verification-page sweep | Random token is required, with rate limiting. An order number alone reveals nothing |
| E-46 | Company asks for an employee's result | No access in the application. Delivery only to the client unless consent is recorded |

### Money and configuration

| ID | Case | Handling |
|---|---|---|
| E-47 | Same user takes and reverses a payment | Same-day own reversal allowed, with motivo, and reported. Otherwise administration |
| E-48 | Payment after the drawer is closed | Goes to the next open period, keeping its real time |
| E-49 | Reception away at end of shift | Administration closes, S and motivo, naming whose drawer |
| E-50 | Voiding an order with a fiscal number | Number is never reused. Note issued. Original stays |
| E-51 | Rate changed mid-day | New documents only. Saved documents are unchanged. Open unsaved orders are warned at Guardar |
| E-52 | Switch changed while others are working | Global from that moment. Each desk's chip refreshes. Each line records what applied |
| E-53 | Restoring a backup | Admin procedure, outside normal operation. Writes `backup.restore`, and the log records the gap |
| E-54 | Audit read shows clinical text | Masked for administration. The view is logged |

### Security

| ID | Case | Handling |
|---|---|---|
| E-55 | Administrator gives Bioanalista through a new user, a role change, or temporary cover | Refused with `STATE`. Only R-126 grants it |
| E-56 | Administrator resets a bioanalyst's Clave | Allowed, with step-up. Sessions end. The person and the owner are notified. Reviewed at once |
| E-57 | Someone keeps failing one staff account from several addresses | 20 failures in an hour raise an alert and slow further attempts, so that a person can't lock out the only bioanalyst |
| E-58 | Repeated wrong password re-entry | 5 in one session end the session and raise an alert |
| E-59 | Same cédula on two rows with different birth dates | The session holds only the row that matches. The other stays out, and is listed for staff review |
| E-60 | Client with no phone on file | No portal, with the same generic answer. Staff delivery still works |
| E-61 | Rate limiter is down | Staff sign-in, portal, and verification refuse with their generic message. Signed-in staff keep working |
| E-62 | Attachment with no recorded consent | Refused with `STATE`. The result stays stored. Staff can print it, or record consent |
| E-63 | Wrong code, a replaced issue, or more than 90 days on the value check | "No disponible". Five wrong codes pause that token for 15 minutes. The state page still works |

## How, when, where, and why

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
| Change | Before and after, for corrections and sensitive edits | Clinical text is masked outside clinical roles. Identity changes are shown to Administración |

The full specification, including best practices awaiting confirmation, is in [09-audit-log.md](09-audit-log.md).

**Rules for this data:** Routine reads are summarized, as listed under Decisions. If an audit row can't be written, the action doesn't happen. Append-only. Application accounts cannot update or delete it. Each row includes a hash of the prior row, so tampering is detectable. Refused events store no cédula digits and no results. Retention waits for the legal review. Fiscal records are subject to the six-year expectation noted in [../modules/billing-and-payments.md](../modules/billing-and-payments.md).

### Events to add

The names in [../brand/08-data-lifecycle.md](../brand/08-data-lifecycle.md) stay. These are added. `result.correct` is replaced by the three `result.correct` events below:

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
| Portal code, proposed on 1 November 2026, owner to confirm | `portal.code.sent`, `portal.code.failed` |
| Audit and system, proposed on 1 November 2026, owner to confirm | `audit.verify`, `audit.verify.failed`, `audit.anchor`, `audit.write.failed`, `system.start`, `system.stop`, `data.import` |

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

Who reviews the reviewer: a monthly summary goes to the owner and lead bioanalyst, not only to administration .

## Starting values

These numbers are starting values to adjust after the pilot: 5 failed staff sign-ins before a 15-minute pause, a 10-minute staff idle lock, and a 15-minute portal idle timeout inside the three-hour session. The discount limit starts at 0 percent until the owner sets it. Further starting values are in [10-security-baseline.md](10-security-baseline.md).

## Not yet settled

Forms that were never opened may change rows here: Nuevo usuario, Clave, Auditoría, Hoja de trabajo, Cargar resultados, and Forma de pago. Trasladar paciente, Reversar relación, and Modificar valores stay blocked until a capture says what they do.
