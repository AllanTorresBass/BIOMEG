# Audit log

**Who may read it:** [06-access-control.md](06-access-control.md), rows R-130 and R-131  
**Record:** [08-logical-data-model.md](08-logical-data-model.md#audit)  
**Display:** [../brand/04-display-patterns.md](../brand/04-display-patterns.md#fiscal-and-list-report)

The audit log is the permanent record of who did what in the application, including what was refused. It lets the laboratory reconstruct a result, a payment, or a permission change after the fact, and detect tampering.

All of this is a design rule, and no application implements it. The current program has an Auditoría command, and that screen was never opened, so it's **Unknown**. This page doesn't describe it.

**How to read this page.** [06-access-control.md](06-access-control.md) wins if this page differs, and its Decisions table records what still needs confirming. Everything here was accepted on 1 November 2026, on the instruction to apply the recommendations, and still needs the confirmation of the owner and the lead bioanalyst. No part of this page is legal advice, and Venezuelan counsel hasn't reviewed it.

## What it is not

| Audit log | Application log |
|---|---|
| Business and security record, kept long term | Technical diagnostics, kept briefly |
| Holds who, what, and why | Holds errors and performance |
| Can hold a corrected result, for clinical roles | Never holds a name, cédula, phone, birth date, email, or result |
| Append-only, and read through Auditoría | Read by whoever maintains the system |

An error in the application log refers to an audit row by its request id, and never copies its content.

## What gets recorded

**The rule.** Every decision by every actor writes one row: staff, client, public, and system. An allowed action, a refusal, and a failure all count.

**Routine reads.** Taken literally, this rule would also log each chip refresh in the shell, for every desk, which buries real events in noise. So rows follow three tiers:

| Tier | What | How it's recorded |
|---|---|---|
| Full | Every write, gesture, sign-in, refusal, and failure. Every read of clinical values, identity, money, reports, or the audit log | One row each |
| Summary | Allowed reads of `shell.view` and of catalogs and registries that hold no patient data | One row per user per day, with a count |
| Flood | Repeated refusals from one address with no session, after the rate limit is reached | One row per address per minute, with a count |

A refusal is never summarized when a session exists. The cost is that a summarized read shows how many times, and not each moment, which is why these reads never include patient data.

## Fields

One row, with these fields.

| Question | Field | Rule |
|---|---|---|
| Who | User id, display name, roles held, session id | The session id is a record number, never the cookie value. A client is recorded by client id. Público has no identity |
| What | Command, event name, record type, record id, record state | See [Events](#events) |
| When | Server time | The browser's clock is never used. Shown in America/Caracas |
| Where | Channel, workstation, address | Channel is staff, portal, public, or system |
| How | Gesture and source | Confirm, step-up, `teclado`, `equipo` |
| Why | Motivo where required, policy version, rule id | The version is the permission table's |
| Result | Allowed, refused with reason code, or failed | Example: `DENY:STATE` |
| Change | Before and after, for corrections and sensitive edits | Clinical text is masked outside clinical roles. Identity changes are shown to Administración |

**Further fields.**

| Field | Why |
|---|---|
| Sequence number | Gaps become visible, with no reliance on timestamps |
| Request id | Joins all the rows from one operator action, and links to the application log |
| Severity | See [Severity](#severity) |
| Count, period | Used only by Summary and Flood rows |
| Row format version | Old rows stay readable after the format changes |
| Prior hash, row hash | See [Protecting the log](#protecting-the-log) |

### What must never be recorded

| Never | Instead |
|---|---|
| Passwords, step-up values, session cookies, confirm tokens, the keyed-hash secret, the mail secret | Nothing |
| A verification token in full | A hash prefix |
| Cédula digits or results on a refused event | The record id, if there is one |
| Portal attempt digits | The keyed hash. Logs keep a prefix |
| Report file contents, stack traces | The file's id. Stack traces go to the application log, without personal data |

**Free text.** A motivo is stored as its own structured field, limited to 500 characters, with control characters removed. It's escaped when displayed, so typed text can't forge a row or run in the screen. If a field is malformed, only that field is replaced, and the row is still written.

## Events

The command comes from [07-rule-reference.md](07-rule-reference.md). The event is the business name.

**When no event is named, the event is the command name.** For example, `client.cedula.correct` and `verify.read` have no separate event, so that's what they record. Commands and events don't always share a word: `client.create` records `patient.save`. Both fields are stored.

| Group | Event | From | Severity |
|---|---|---|---|
| Session | `session.enter`, `session.leave`, `session.lock`, `session.timeout` | R-001, E-11 | Info |
| Session | `password.change` | R-001 | Notice |
| Session | `password.reset` | R-127. Critical when the person holds Bioanalista or Administración | Notice |
| Session | `session.enter.failed` | E-10 | Warning |
| Session | `access.denied` | E-14, E-15 | Warning |
| Session | `step_up.failed` | Every `S` gesture | Critical |
| Users | `user.create`, `user.disable` | R-120, R-123 | Notice |
| Users | `user.role.change` | R-124, R-126 | Notice |
| Users | `user.grant.temporary` | R-125 | Notice |
| Clients | `patient.save` | R-012 to R-014 | Info |
| Clients | `patient.deactivate`, `patient.delete` | R-017, R-018 | Notice |
| Clients | `patient.merge`, `patient.unmerge` | R-020, R-021 | Notice |
| Orders | `order.open`, `order.line.add`, `order.line.remove` | R-023, R-027 to R-029 | Info |
| Orders | `order.line.change.discount` | R-024, R-025 | Notice |
| Orders | `order.void` | R-030 to R-034 | Notice |
| Orders | `order.save.refused` | Two savers | Info |
| Results | `result.enter` | R-042, R-043, R-145 | Info |
| Results | `bacteriology.note.add` | R-050 | Notice |
| Results | `result.conflict` | E-29 | Notice |
| Results | `result.release` | R-046 | Notice |
| Results | `result.correct.open`, `result.correct.cancel`, `result.correct.release` | R-047 to R-049 | Notice |
| Reports | `report.issue`, `report.pdf`, `report.superseded` | R-049, R-110, R-111 | Notice |
| Reports | `report.view`, `report.print`, `report.export` | R-100 to R-105, R-130, R-131 | Info |
| Delivery | `delivery.whatsapp`, `delivery.email` | R-112, R-114, R-115 | Notice |
| Delivery | `delivery.incomplete.approved`, `delivery.resend.task` | R-113, R-049 | Notice |
| Portal | `portal.login`, `portal.download` | Sign-in, R-141, R-142 | Info |
| Portal | `portal.login.failed`, `portal.code.failed` | Sign-in | Warning |
| Portal | `portal.code.sent` | R-148 | Info |
| Portal | `verify.file.read` | R-149 | Notice |
| Money | `payment.record` | R-060 | Info |
| Money | `payment.reverse` | R-061 | Notice |
| Money | `cash.close`, `cash.reopen`, `month.close` | R-062 to R-065 | Notice |
| Money | `note.issue`, `document.reprint`, `control.assign` | R-066, R-068 to R-071 | Notice |
| Configuration | `rate.change`, `price.change`, `price.print` | R-003, R-085 to R-087 | Notice |
| Configuration | `setting.qr.change`, `setting.saturday.change` | R-004 | Notice |
| Configuration | `registry.create`, `registry.update` | R-080 to R-083 | Info |
| Configuration | `mail.config.change`, `policy.publish` | R-128, table version | Notice |
| Configuration | `backup.run` | R-129 | Notice |
| Configuration | `backup.restore` | E-53 | Critical |

A failed send writes its delivery event with the result failed. A refused second save and a refused portal sign-in are events too.

**Further events.**

| Event | When | Severity |
|---|---|---|
| `audit.verify` | The chain check ran and passed | Info |
| `audit.verify.failed` | The chain check found a broken row or a gap | Critical |
| `audit.anchor` | The latest hash was copied outside the database | Info |
| `audit.write.failed` | An audit row could not be written | Critical |
| `system.start`, `system.stop` | The application started or stopped, which makes a logging gap visible | Notice |
| `data.import` | Data was brought over from SICOEXC, once a migration is defined | Critical |

### Severity

| Level | Means | Response |
|---|---|---|
| Info | Normal work | Available on search |
| Notice | Sensitive and allowed | Counted in reviews |
| Warning | Possibly a problem by repetition | Alert past a threshold |
| Critical | Integrity, or someone trying a colleague's session | Alert at once |

## How a row is written

1. **Together with the change.** The audit row and the business change are in one transaction. Neither exists without the other.
2. **Refusals and failures survive.** A refused or failed action rolls back its change, and its row is written separately. Refused events store no cédula digits and no results.
3. **Outside calls.** The intent is recorded before a send, and the result after it. A crash between them reads as unconfirmed, never as sent.
4. **If the row can't be written, the action doesn't happen.** This applies to writes, and to reads of clinical values. A short outage then stops that work, which is the safer failure for a clinical record. The operator sees "No se pudo registrar la acción. No se guardó ningún cambio." This wording is new, so the laboratory should check it. The failure writes to the application log and raises an alert, and `audit.write.failed` is recorded once writing recovers.
5. **The server decides what's recorded.** The person, the time, and the record state never come from the request.

## Protecting the log

| Threat | Protection |
|---|---|
| The application edits or deletes a row | Application accounts can't update or delete |
| Someone alters a row in the database | Each row includes a hash of the prior row |
| A database administrator rewrites the whole chain | The latest hash is kept somewhere else |
| A restored backup removes recent rows | The log records the gap, and the outside copy shows it |
| A flood fills the store | Rate limits and Flood rows |
| Reading the log out of curiosity | Each view is logged, and views per user are reviewed |

**How the chain works.**
- A row's hash covers its full content in a fixed canonical form, plus the prior hash. The first row uses a fixed starting value.
- Rows are written one at a time, so the chain can't fork.
- Writing uses a dedicated database account that can only insert. Reading uses another, through views that apply the masks. The application's main account has no access to the table.
- Database triggers reject update, delete, and truncate as a second barrier.

**The outside copy.** Once a day, the latest sequence number and hash go somewhere the database administrator can't change, such as write-once storage. Each monthly summary also prints them, so the owner holds a paper copy. Where that storage lives depends on the deployment model, which is still waiting on the laboratory.

**Checking.** The full chain is checked daily, and against the outside copy. A check also runs after any restore. A failed check doesn't try to repair anything: it writes `audit.verify.failed`, raises an alert, and keeps all the data as evidence.

**Time.** The server clock is synchronized to a common time source, and times are stored in UTC. Sequence numbers, not timestamps, decide order.

**Backups.** Backups hold the audit log, with the same encryption and the same limited access as the rest of the store.

## Reading it

### Who

| Role | Sees | Source |
|---|---|---|
| Administración | All events. Clinical before-and-after text and the motivo on clinical events are masked. Identity changes are shown, because it runs Corregir cédula. The view is logged | R-130, E-54 |
| Bioanalista | Clinical events, unmasked | R-131 |
| Recepción, Auxiliar | Nothing | R-130, R-131 |
| Cliente, Público, Sistema | Nothing | R-130, R-131 |
| Owner, lead bioanalyst | A monthly summary, so administration doesn't only review itself | `06-access-control.md` |

**Clinical events** are `result.*`, `report.issue`, `report.pdf`, `report.superseded`, `order.line.remove` with a result, `bacteriology.note.add`, `verify.file.read`, and views of Evolución de pacientes.

### The Auditoría screen

**Purpose.** Reconstruct what happened to one record, or what one person did.  
**Actor.** Administración and Bioanalista, as above.  
**Record.** Audit rows.  
**Pattern.** Fiscal report.

**Fields or columns.** Built from the fields above: Fecha y hora, Evento, Usuario, Registro, Resultado, Motivo. A row opens its detail, with the full fields and the masked or unmasked change.

**Filters.** Desde and Hasta, defaulting to the session day. Also Evento, Usuario, Severidad, Resultado, and record id. Searching by name or cédula isn't offered, so that the audit screen doesn't become a way to look people up. Sorted newest first, by sequence number.

**States.**

| State | Display |
|---|---|
| Empty | Filters kept. "Sin movimientos en este rango." |
| Single | One row. No totals row, because this report has no money |
| Partial | Masked text reads as masked, and never looks empty |
| Error | Keeps the previous rows and shows "No se pudo actualizar." |
| No permission | Menu item absent. A direct route shows the title and `BLOQUEADO`, with no values |

**Write.** Nothing changes. Viewing writes `report.view` and printing writes `report.print`, including the filters used.  
**Audit.** See Write.  
**Evidence.** The current program's screen was not opened. See [../session/mantenimiento.md](../session/mantenimiento.md).

**Export.** The brand pattern offers Imprimir only, and adds no other export unless a named output implies one. A copy for an investigation or an authority is an administrative procedure, itself recorded.

## Reviewing it

The review schedule below uses plain thresholds, not machine learning. The signals are from [06-access-control.md](06-access-control.md#what-the-data-will-reveal), and the alert values are starting values, to adjust after the pilot.

| Signal | Cadence | Starting alert | Reviewer |
|---|---|---|---|
| `step_up.failed` on Liberar | At once | 1 | Lead bioanalyst |
| `audit.verify.failed`, `audit.write.failed`, `backup.restore` | At once | 1 | Owner |
| Portal failures by address | Daily | 20 in an hour | Administration |
| Staff `session.enter.failed` | Daily | One pause | Administration |
| Repeated `DENY:ROLE` by person and command | Weekly | 5 in a week | Administration |
| Discounts and non-default price columns per user | Weekly | Reviewed by reading | Owner |
| Same-user payment reversals | Weekly | Reviewed by reading | Owner |
| Time from correction to resend | Weekly | Open past 2 days | Lead bioanalyst |
| Corrections per bioanalyst, per exam, after delivery | Monthly | Reviewed by reading | Lead bioanalyst |
| Evolución and audit views per user | Monthly | Reviewed by reading | Owner |
| Exports and patient record reads per user | Monthly | Reviewed by reading | Owner |
| Roles held together | Monthly | Each person listed | Owner |
| Activity outside usual hours or workstation | Monthly | Reviewed by reading | Owner |

Alerts go by email to the owner, and to the lead bioanalyst for clinical events, and also show to Administración in the shell. See [10-security-baseline.md](10-security-baseline.md#a09-security-logging-and-alerting-failures).

**Incident steps.**
1. Keep everything. Change and delete nothing.
2. Tell the owner, and the lead bioanalyst if results are involved.
3. Copy the log and the outside hashes to a safe place.
4. Compare, and find the first affected row.
5. Check the affected results and documents.
6. Record what was found, and any duty to notify, with counsel's advice.

## Retention

**Nothing deletes audit rows at this time.** Retention waits for the legal review. Fiscal records are subject to a six-year expectation, whose source is still an open question.

**Questions for Venezuelan counsel.**

| Class | Question |
|---|---|
| Clinical events | Must they be kept at least as long as the results they describe? |
| Fiscal events | Which period applies, and what is its legal source? |
| Security events | What's a reasonable period, including addresses? |
| Soft-deleted clients | Audit rows keep the client id. Is that compatible with any right to deletion? |

Once periods exist, old rows are moved to an archive, with their hashes kept, so the chain can still be checked. A disposal is itself recorded.

## Checks a build must pass

- [ ] Every command in [07-rule-reference.md](07-rule-reference.md) writes a row, or is listed as a Summary read.
- [ ] A refused action leaves a row and no data change.
- [ ] An action whose audit write fails leaves no change.
- [ ] Update, delete, and truncate on the table fail for the application's accounts.
- [ ] Changing one stored value makes the check report that row.
- [ ] Deleting the newest rows makes the check against the outside copy report a gap.
- [ ] No password, token, or cookie appears in any row, in any test.
- [ ] A refused row holds no cédula digits and no results.
- [ ] Administración's response holds no clinical text and no motivo on clinical events, in the raw data as well as on screen. It does hold identity changes.
- [ ] A motivo with line breaks and markup can't forge a row or run on the screen.
- [ ] A burst of portal failures produces Flood rows and doesn't slow staff work.
- [ ] A view of Auditoría writes `report.view`.

## Open questions

Confirmations of the accepted rules are in the Decisions table of [06-access-control.md](06-access-control.md#decisions). The questions below are also in [section 9 of the workspace guide](../workspace-guide.md#decisions-still-needed).

| Question | Recommendation | Who decides |
|---|---|---|
| Where does the outside copy of the hash live? | Depends on the deployment model | Laboratory, owner |
| How long is each class kept? | See [Retention](#retention) | Venezuelan counsel |

## Best-practice sources

Checked on 1 November 2026. The two US rules don't apply to a Venezuelan laboratory, and are here only as well-known reference points. Following them is not a claim of compliance with anything.

| Source | What this page takes from it |
|---|---|
| [OWASP Logging Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html) | Which events to record, when, where, who, and what. Data to exclude. Injection defense. Tamper detection. A dedicated account. Failure and flood testing. Scoping logging to risk |
| [NIST SP 800-92](https://csrc.nist.gov/pubs/sp/800/92/final) | Synchronized clocks, and a policy on protecting and disposing of logs |
| [21 CFR 11.10(e)](https://www.law.cornell.edu/cfr/text/21/11.10) | Secure, time-stamped trails. Changes don't obscure prior information. Trails are kept as long as the records they describe |
| [45 CFR 164.312](https://www.law.cornell.edu/cfr/text/45/164.312) | Mechanisms that record and examine activity, and protection from improper alteration |
