# Access control analysis

**Date:** 1 November 2026
**Covers:** Every staff, client, public, and system actor in the BIOMEG application
**Status:** Documentation only. No application is being built at this moment, so **nothing here protects real users or data yet**

This document brings the access-control analysis together in one place: what was wrong, what was decided, how the rules work, and what is still open. It adds no new rules.

| If you need | Read |
|---|---|
| The rule for a specific command, or the full edge-case wording | [product/06-access-control.md](product/06-access-control.md). It wins if this document differs |
| The evidence behind a finding, with file and line | [access-control-plan.md](access-control-plan.md), section 3. Some line references have moved since it was written |
| Each row's command names and conditions | [product/07-rule-reference.md](product/07-rule-reference.md) |

## 1. Summary

The analysis read all 78 Markdown files in the repository. There was no application code, so every finding is a defect in the specification and can be fixed before anything is built.

The documents named an actor for most commands, but they did not add up to an access model. There were four root causes:

1. **A missing role.** Administration owned the most commands but was not a defined role, so nobody could properly hold the role that creates users.
2. **Mixed rules.** Who may act and when an action is allowed were tangled together. `Enviar` hidden until `LIBERADO` is a state rule filed as a permission.
3. **Weak controls on the riskiest actions.** Merging clients, releasing results, and portal sign-in had the least protection.
4. **No server enforcement.** The documents said a button was hidden or a menu item absent. Nothing required the server to refuse the action.

| Result of the analysis | Count |
|---|---|
| Findings | 34 (4 critical, 17 high, 13 medium) |
| Workflow bottlenecks | 8 |
| Edge cases, each with a stated handling | 54 |
| Decisions | 13 in the analysis (12 accepted, legal review open), plus 4 added while removing contradictions |
| Rows in the permission table | 105, covering 125 commands |

## 2. Findings

**Critical** can harm a patient or expose results. **High** blocks the model or opens fraud. **Medium** causes daily friction or ambiguity.

The "Rule now" column is what the specification says after the corrections. These rules take effect only once an application is built.

### Critical

| ID | Problem | What could happen | Rule now |
|---|---|---|---|
| F7 | A correction did not replace what patients already had | A patient or physician keeps acting on a wrong result, and the QR still says `LIBERADO` | Releasing a correction creates a new issue, marks the old one `REEMPLAZADO`, and creates a resend task |
| F8 | Liberar had no password re-entry and no named event, and staff sessions had no idle timeout | On a shared PC, someone else releases a result that prints under a bioanalyst's name | Liberar needs a password re-entry and writes `result.release`. Staff sessions lock after 10 minutes |
| F9 | Reception could merge two clients with no undo | One person's results appear in another person's portal | Only Administración merges, with a password re-entry. Two different complete cédulas are refused. A stored map allows an undo |
| F15 | Portal sign-in needed only a cédula, which is printed on every report | Anyone holding one report reads that person's full history for three hours | Cédula and Fecha de nac. This is a stopgap, because relatives may know the date. A one-time code follows once the WhatsApp provider is known |

### High

| ID | Problem | Rule now |
|---|---|---|
| F1 | Administration was not a role | Administración is defined, and an installation procedure creates the first administrator |
| F2 | One role per user in some documents, many in others | A person may hold several staff roles. Conflicts appear in a monthly report |
| F3 | Role and state rules mixed, no server enforcement | One server decision for every action. A hidden button is a display choice |
| F10 | Unclear who may confirm an incomplete send | A bioanalyst approves with a password re-entry and names the missing sections |
| F11 | Release per exam or per visit was unresolved | Liberar works per section |
| F12 | Administration could create a false professional | Granting Bioanalista requires a license number and notifies the other bioanalysts |
| F16 | A plain hash of a cédula can be reversed by trying every number | A keyed hash, which needs a secret to reverse |
| F17 | Order numbers on the public verification page were guessable | A random token is required, with rate limiting |
| F18 | Evolución went to administration, not the clinician | Evolución moves to the bioanalyst. Clinical text in Auditoría is masked for Administración |
| F19 | A child with no cédula could not be billed or use the portal | A billing party's cédula goes on the factura, and staff deliver the results. A portal link comes later |
| F23 | Discounts had no limit, approver, or reason | Reception up to a limit, and an administrator with a motivo above it |
| F24 | Choosing a cheaper price column was an unrecorded discount | A non-default column needs a confirm and a motivo at reception |
| F25 | "Voided order" was used, but no command or actor existed | Anular orden is defined for each case, and a released result is refused |
| F26 | Nobody owned the Tasa BCV or Control N° | Reception sets the rate only when today has none, and Administración otherwise. Control N° depends on the fiscal capture |
| F29 | Staff sign-in had no lockout, idle timeout, or recovery | 5 failed attempts cause a 15-minute pause. Password reset and witnessed offline recovery are defined |
| F30 | The event list missed key acts | The missing events are named, including Liberar, void, merge, and refusals |
| F31 | The audit log was not append-only, and Administration audited itself | Append-only with a hash chain. A monthly summary goes to the owner and lead bioanalyst. Retention waits for the legal review |

### Medium

| ID | Problem | Rule now |
|---|---|---|
| F4 | Physician had no stated account or limits | No account in the first release |
| F5 | Auxiliary's scope conflicted, and overwriting an analyzer value had no owner | Auxiliar enters empty or own cells before release. Only a bioanalyst overwrites, with a motivo |
| F6 | Analyzer, sender, and scheduler were not actors | Each is a Sistema role that cannot sign in and is limited to its own commands |
| F13 | Clinical lists were filed under administration | Bacteriology lists and notes move to the bioanalyst |
| F14 | Birth date or sex could change after results, without notice | The change flags the order for bioanalyst review |
| F20 | Pendiente rows and company access were unspecified | A pending row shows date and order number only. A company gets no access in the application |
| F21 | Contact details could change just before a send, with no trace | The confirm shows the destination, and the earlier value is stored |
| F22 | Backup was one click to an unstated path, and the mail credential was exposed | Backup needs a password re-entry, is encrypted, and goes to a fixed destination. The mail secret is write-only |
| F27 | Payments could not be reversed or closes reopened, and an absent user's drawer could not be closed | New commands cover each case. The original rows stay |
| F28 | The rate and flags were read at different moments | A rate change applies to new documents only. A switch applies to the whole laboratory from that moment |
| F32 | Concurrency was per save, but results save per cell | A version check per cell. The second person sees who saved and both values |
| F33 | Generar PDF had two owners, and reception could see unreleased values | Reception generates only when released. Only a bioanalyst generates a watermarked draft |
| F34 | Revoked rights kept working until the session expired | Rights are checked on every request |

## 3. Workflow bottlenecks

These are not security holes. The earlier assignments would have slowed the working day.

| ID | Bottleneck | Fix |
|---|---|---|
| I1 | A patient at the desk needs a factura copy, but only administration could reprint | Reception can reprint a watermarked `COPIA` |
| I2 | `SIN TASA` stops the desk until administration arrives | Reception may enter the rate when today has none |
| I3 | Precio sábado needs an administrator present on Saturday | Set by calendar, with a manual switch for Administración |
| I4 | Reception cannot answer "is mine ready?" | A status-only worklist without values |
| I5 | The bench waits on administration for organism and antibiotic lists | The bioanalyst maintains clinical lists |
| I6 | A password for every Liberar would push staff to share sessions | One re-entry covers the selected batch |
| I7 | An incomplete send needs a bioanalyst, then reception, with nothing connecting them | The approval creates a ready-to-send item |
| I8 | Nobody is told when a correction creates work for reception | The correction creates a resend task |

## 4. How a decision works

Every action, by every actor, gets one decision on the server. The questions run in order:

```text
decide(principal, command, record)

1. Session    Valid session on an active account?          no → SESSION
2. Role       Does any role grant this command?            no → ROLE
3. State      Does the record's state allow it?            no → STATE
4. Ownership  Is this person related to the record?        no → OWNERSHIP
5. Gesture    None, a confirm, or a password re-entry?     then: the action may run
```

| Outcome | Meaning |
|---|---|
| `ALLOW` | Runs now |
| `ALLOW_WITH_CONFIRM` | Runs once the person confirms |
| `ALLOW_WITH_STEP_UP` | Runs once the server has checked the re-entered password |
| `DENY` | Refused, with a reason |

| Reason | Meaning |
|---|---|
| `SESSION`, `ROLE`, `STATE`, `OWNERSHIP` | The question that failed, as above |
| `BLOCKED` | The command is closed to everyone until a capture shows what it does |
| `UNKNOWN_COMMAND` | The command is not in the table |
| `CONFIRM`, `STEP_UP`, `MOTIVO_REQUIRED` | The action is allowed, but this evidence is still missing, so it cannot run yet |

### Principles

- **Deny by default.** A missing command or a missing fact refuses.
- **The server decides.** The screen only reflects the answer.
- **Roles add up for staff.** Client, public, and system sessions never carry staff rights.
- **The table is versioned.** Each audit row stores the version that decided it.
- **Rights are checked on every request,** so a removed role stops working at once.
- **A password re-entry confirms who is at the keyboard.** It is not an electronic signature.

The analysis recommends against a policy engine or machine learning. One laboratory with four staff permission sets would gain failure points and audit difficulty without covering any case this table misses.

## 5. Roles and record states

| Role | Who holds it | Scope | Table rows | Of those, read only | Confirm | Password re-entry |
|---|---|---|---|---|---|---|
| Recepción | Receptionist, secretary | Clients, orders, payments, delivery of released results | 37 | 7 | 9 | 0 |
| Auxiliar | Auxiliary, assistant | Worklist and result entry. Never releases | 11 | 5 | 0 | 0 |
| Bioanalista | Licensed bioanalyst | Release, corrections, clinical lists | 36 | 8 | 4 | 5 |
| Administración | Owner, administrator | Money, registries, users, backup. No clinical values | 62 | 5 | 5 | 21 |
| Cliente | Portal session | Own orders only | 4 | 3 | 0 | 0 |
| Público | Holder of the paper | Verification page, with the token | 1 | 1 | 0 | 0 |
| Sistema | Analyzer link, sender, scheduler | One command set each. Cannot sign in | 3 | 0 | 0 | 0 |

Seven rows are closed to everyone. Three are blocked until a capture explains them: Trasladar paciente, Reversar relación, and Modificar valores. Four are permanent refusals, such as voiding an order with a released result or disabling the last administrator.

```text
Order:  BORRADOR → ABIERTA → INCOMPLETO → LIBERADO ⇄ EN_CORRECCION
                     └────────────┴──→ ANULADA (no result released)

Result: PENDIENTE → CARGADO → LIBERADO → EN_CORRECCION → LIBERADO (new version)

Issue:  VIGENTE → REEMPLAZADO (once a correction is released)
```

An order is `LIBERADO` when every section is released. Until then it is `INCOMPLETO`, and released sections can be read.

## 6. Decisions

All were accepted on 1 November 2026 on the instruction to apply the recommendations. **That instruction is not the clinical or legal confirmation shown in the last column.**

| Decision | Rule | Still needs |
|---|---|---|
| Unit of release | Per section | Lead bioanalyst |
| License | Number stored. Expiry tracked only if the Colegio requires renewal | Lead bioanalyst |
| Auxiliary | Enters before release, never releases | Lead bioanalyst |
| Physician | No account in the first release | |
| Minors and representatives | Billing party's cédula and staff delivery | Legal review |
| Two different cédulas | Merge refused. A wrong cédula goes through Corregir cédula | |
| Self-entered values | No second reviewer. Recorded and reviewed | Lead bioanalyst |
| Money owed | Does not block the portal or the release | |
| `SIN PRECIO` | Blocks the fiscal issue, not Liberar. **Replaces the earlier rule** | Lead bioanalyst |
| Precio sábado | By calendar, with a manual switch | |
| Discount limit | Reception up to a limit, administrator above it | **Owner sets the percent. It starts at 0, so any discount needs an administrator** |
| Portal credential | Cédula and Fecha de nac., then a one-time code, required before real clients use the portal | Legal review |
| Fecha reporte under per-section release | Written at the first Liberar and updated by each later Liberar | Lead bioanalyst |
| Same cédula on several rows | Only rows brought over from the current program, until Fusionar joins them | Owner |
| Default price column | Until a saved pair sets a default, the operator chooses. After that, another column needs a confirm and a motivo | |
| Motivo on Anular orden | Every void needs a motivo, including one by Administración | |
| Legal duties | Health data, retention, and minors | **Open. Venezuelan counsel has not reviewed this** |

## 7. Edge cases

All 54 are written out in [the product page](product/06-access-control.md#edge-cases).

| Group | IDs | Examples |
|---|---|---|
| Accounts and sessions | E-01 to E-15 | First administrator, last administrator, unattended workstation, direct URL without the right |
| Clients | E-16 to E-24 | Wrong merge, child with no cédula, birth date changed after a result |
| Results | E-25 to E-36 | Two people on one cell, analyzer value after release, abandoned correction, bioanalyst absent |
| Delivery, portal, verification | E-37 to E-46 | Partial release, scanning a corrected report's QR, company asking for an employee's result |
| Money and configuration | E-47 to E-54 | Same user reverses own payment, rate changed mid-day, restoring a backup |
| Security | E-55 to E-63 | Bioanalista granted another way, a reset of a bioanalyst's password, lockout abuse, two birth dates on one cédula, consent, the value check |

## 8. What gets recorded

Each decision, including each refusal, leaves one record:

| Question | Fields |
|---|---|
| Who | User, roles held, session |
| What | Command, record type, id, and state |
| When | Server time, America/Caracas |
| Where | Channel, workstation, address |
| How | Gesture and source, such as `teclado` or `equipo` |
| Why | Motivo where required, policy version, rule id |
| Result | Allowed, refused with a reason, or failed |
| Change | Before and after, for corrections and sensitive edits |

The log is append-only, and each row includes a hash of the row before it, so tampering can be detected. A refusal stores no before-and-after value. A cédula is never stored in plain form.

This data shows where the workflow slows down and where something looks wrong:

| Measure | What it can show |
|---|---|
| Refusals by role and command | A table error, or someone probing |
| Time from `CARGADO` to Liberar | Where release waits |
| Corrections per bioanalyst, per exam, and after delivery | A quality or training pattern |
| Time from correction to resend | Patients left holding a wrong result |
| Discounts and non-default price columns per user | Hidden discounting |
| Same-user payment reversals | Possible cash skimming |
| Activity outside a person's usual hours or workstation | Shared passwords |
| Portal failures by address | Guessing |
| Password re-entry failures on Liberar | Someone trying a colleague's session |
| Evolución and audit views per user | Curiosity browsing of records |

## 9. How the rules were checked

The rules were checked once with temporary reference code, which has since been removed because the project is documentation only. A table of 103 rows was run through 50 tests covering every role, command, and state combination, the clinical rules, the portal, accounts, the state machines, and the audit log. The rules and code were also broken on purpose in 34 ways to confirm that the tests caught them, and all 34 were caught after one test was added.

**That check has limits.** It covered the permission logic only, not a working application. It also came before the 1 November contradiction fixes, so the added motivo on Anular orden and the price-column condition were not tested. No automatic check now keeps the matrix correct, so a change to it needs a manual review against [product/07-rule-reference.md](product/07-rule-reference.md).

| Starting setting | Value |
|---|---|
| Discount limit | 0 percent, until the owner sets it |
| Failed staff sign-ins before a pause | 5 |
| Staff pause | 15 minutes |
| Staff idle lock | 10 minutes |
| Portal session | 3 hours |
| Portal idle timeout | 15 minutes |

The numbers other than the discount limit are starting values to adjust after the pilot.

## 10. Plan status

| Phase | Status | What it needs |
|---|---|---|
| 0. Evidence from the lab | Not run | Captures of the unopened forms, a shift interview, the deployment model |
| 1. Decisions | Mostly done | The confirmations and legal review in section 6 |
| 2. Correct the documents | Done | |
| 3. Core permission system | Specified only | A decision to build an application |
| 4. Sign-in and accounts | Not started | A decision to build an application |
| 5. High-risk controls | Rules only | A decision to build an application |
| 6. Portal and public pages | Rules only | A decision to build an application, then an independent penetration test |
| 7. Pilot and tuning | Not started | A pilot at the laboratory |

## 11. Limits of this analysis

- **Unopened screens.** Nuevo usuario, Clave, Auditoría, Hoja de trabajo, Cargar resultados, and Forma de pago were never opened in the current program. Captures may change rows in the table.
- **Actual job split.** The captured session shows one user with all seven menus open, which suggests one person may do several jobs. A shift interview has not confirmed this.
- **Deployment.** Whether the application runs on a LAN or the internet is not stated, and that changes the portal risk.
- **MediLab.** It is cited as a source but is not in this repository, so its rules were read only as BIOMEG's documents quote them.
- **Not legal advice.** The documents do not establish Venezuelan duties for health data, retention, or minors.
- **Audit protection.** Append-only rules stop the application, not a database administrator or a restored backup. The hash chain must be checked regularly, with its latest hash kept somewhere else.
- **The plan is a record.** Sections 3 to 11 of the plan show the analysis as proposed. For example, plan case E-35 has `SIN PRECIO` blocking Liberar, while the product page, which wins, allows it.

## 12. What is still needed

| Who | What |
|---|---|
| Owner | Set the discount percent, and confirm the rule for several rows with the same cédula |
| Owner | Choose the application's technology, when the decision to build is made |
| Lead bioanalyst | Confirm per-section release, the license rule, auxiliary entry, self-entered values, Fecha reporte, and `SIN PRECIO` no longer blocking Liberar |
| Venezuelan counsel | Review health data, retention, minors, and the portal credential |
| Laboratory | Provide screen captures, a shift interview, and the deployment model |
| Before the portal goes public | One-time code and an independent penetration test |
