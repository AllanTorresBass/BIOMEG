# BIOMEG build plan

**Date:** 4 November 2026
**Purpose:** A step-by-step plan to build the BIOMEG application from the documentation in this repository, with an analysis of what the documentation settles, where it is thin, and where the workflow hides inefficiencies and edge cases.
**Authority:** This plan sets no rules. It orders work. If it differs from [product/](product/), [brand/](brand/), or [v0-prompts/](v0-prompts/README.md), those pages win, so fix this page.
**Status:** Proposed. Nothing here has been confirmed by the owner. Writing it built nothing.

Labels follow [brand/03-documentation-standard.md](brand/03-documentation-standard.md): **Observed** (in the documents), **Design rule** (a rule the documents set), **Inferred** (this plan's own reading), **Unknown** (not settled anywhere).

---

## 1. Is the documentation comprehensive enough to build from?

**Yes for behavior, access, security, and appearance. No for four things the result grid and the money depend on.**

| Area | Where | Buildable now? | Note |
|---|---|---|---|
| What the product is, who uses it, what is out of scope | `product/01`, `02` | Yes | Unambiguous |
| Client, order, result, invoice, portal lifecycles | `product/02`, `05`, `brand/08` | Yes | How, when, where, why for each record |
| Edge cases | `product/04`, `06` (E-01 to E-63), `brand/06` | Yes | About 90 named cases, each with shown, stored, refused |
| Access control | `product/06`, `07` | Yes | 105 rows, 125 commands, fixed decision order, 30 test cases in V0-03 |
| Logical data model | `product/08` | Mostly | Logical only. Two Open questions block the schema |
| Audit log, security, outage | `product/09`, `10`, `11` | Mostly | Audit and security are specific. Outage is a draft |
| Look and feel | `brand/`, `tokens.css`, `assets/brand/` | Yes | Tokens, 11 display patterns, five states per region |
| Code architecture | `v0-prompts/07`, `08`, `rules/` | Yes | The 14 conflicts between rule files are already resolved in `07` |
| Build order | `v0-prompts/README.md` | Yes | 54 prompts, 8 stages, 3 gates |

### What the documents cannot settle

| # | Gap | Effect on the build | Who closes it |
|---|---|---|---|
| G1 | **Catalog structure.** One exam to many analytes, whether Categoría is a report section, where units and reference text are kept. No command creates those rows | The result grid has no real rows. Stage 3 uses invented sections, so the grid can be built but not validated | Lead bioanalyst, with captures of Precio Examenes and Crear Perfiles |
| G2 | **IVA and IGTF rates, rounding, Control N° assignment** | **Received** at Gate B (06/11/2026): IVA 16%, IGTF 3% FX, two-decimal rounding, Control N° Pendiente/nullable | Owner, accountant |
| G3 | **Migration from SICOEXC.** Rules assume migrated rows. No page defines the migration | Duplicate cédulas, unmerged clients, and old orders have no landing plan | Owner, after a backup can be examined |
| G4 | **Providers and protocols:** WhatsApp, email, analyzer, fiscal number, rate source, QR payload | Every one is a fake behind a port. The portal's one-time code depends on one of them | Laboratory |

Also unsettled and non-blocking: the correct RIF (the logo and the preview print different values), unopened forms (Forma de pago, Cashea, every registry, every cost screen), the discount percent, the outage targets, and Venezuelan counsel's review.

---

## 2. Analysis

### 2.1 Contradictions and risks found in the documents

These are **Inferred** from reading the pages against each other. None is a rule.

| # | Finding | Why it matters | Proposed handling |
|---|---|---|---|
| A1 | The documents say "no application is being built." `README.md`, `workspace-guide.md`, and `v0-prompts/README.md` repeat it | Starting the build makes three pages false | Gate A is the owner's yes. On approval, change those lines first |
| A2 | **The stack in the documents differs from this environment's defaults.** The documents choose raw `pg` with no ORM and BIOMEG-managed accounts with Argon2id. The environment's defaults are an ORM and a hosted auth library | Following the defaults would break `07-engineering-rules.md` rules 5 and 6 and several P0 triggers | The documents win. Use the documents' stack. A hosted Postgres is still compatible, and the choice waits for Gate B |
| A3 | **Hash-chained audit log versus concurrent writes.** Each audit row hashes the prior row, and every write must put its audit row in the same transaction | One chain head means every command that writes serializes on it. A result is saved on each cell exit, so this is the hottest path | Decide in V0-27, not later. Options: take the chain lock as the last step of the transaction so it is held briefly, or keep one chain per channel. Measure with the concurrency test before choosing |
| A4 | **Gapless fiscal numbers versus throughput.** Counter rows inside the Guardar transaction mean no gaps and no reuse, and also serialize order saves | Correct and slow under load. Acceptable at one laboratory's volume | Keep the transaction short. Put N° orden and Factura N° allocation last in it |
| A5 | **Sample time is not recorded.** Fecha muestra is a date. Tubes and barcodes are out of scope | Turnaround can't start at the sample. The first timestamp is `order.open` | Measure from `order.open`. Ask the lead bioanalyst whether a time on Fecha muestra is wanted. Don't add it unasked |
| A6 | **No event named for Guardar.** The audit table lists `order.open`, `order.line.add`, and `order.save.refused`, and no save event | The save moment is the start of every metric | Confirm that `order.open` is written at Guardar. Record the answer in the V0-27 prompt |
| A7 | **Several actions are Administración-only:** Fusionar, Eliminar, Corregir cédula, void with a payment, reversals after the day | In a small laboratory this is a queue. E-49 already names one failure (reception away at close) | Measure the wait from R-019 (request) to R-020 (act). Review monthly |
| A8 | **Release has no override** (E-36), and the outage page leaves "urgent results" undefined | A bioanalyst's absence stops every release | Measure `CARGADO` to `LIBERADO`. Put the urgent-result question to the lead bioanalyst before the pilot |
| A9 | **The attachment path needs recorded consent per client and channel,** and the portal's code depends on an unknown provider | Until the code works, every delivery needs consent on the client card. Reception carries that cost | Build the consent field in Stage 2, so it exists before Stage 3 delivery |
| A10 | **Prototype state in memory.** Stages 1 to 5 keep invented data in memory | A serverless preview can run several instances, so demo state can differ between requests | Keep the store on the server process, and review only in the live preview. Real storage waits for Stage 6 |
| A11 | **The "six-year" fiscal retention** has no source in the documents | A retention rule can't be built on an unsourced figure | Delete nothing automatically. Counsel and the accountant give the source |
| A12 | **Permission table lives in Markdown.** Code will hold a second copy | The two can drift. The documents say a person reviews each change because no code enforces it | A test parses the table in `product/06-access-control.md` and compares it to `lib/auth/table.ts`. A change to one fails until the other follows |

### 2.2 Hidden inefficiencies in the workflow

Where work waits, repeats, or is invisible today. **Inferred** from the eight steps and the edge catalog.

| Where | Inefficiency | What the new application does about it | What to measure |
|---|---|---|---|
| Admit | The October invoice typed the person each visit, so duplicates form | Client master, P-01 unique cédula, P-03 similar-name confirm | Duplicate-confirm rate, Sin verificar share |
| Admit | Same exam ordered twice the same day goes unnoticed | Warning with a motivo (America/Caracas day) | Warnings per week, motivos by text pattern |
| Order | Price column and tipo de costo are two lists with overlap | Both stored, never mapped silently | Orders where the operator changed the column (R-026) |
| Bench | Nothing shows who is waiting on whom | Worklist with state chips, `INCOMPLETO` list | Time in `CARGADO`, time per section |
| Bench | A typed value and an analyzer value collide silently | The typed value stays. The incoming value waits beside it (E-27, E-28) | Conflict count per exam |
| Release | A bioanalyst is the single gate | Per-section release, one password re-entry per batch | `CARGADO` to `LIBERADO`, by bioanalyst and hour |
| Release | A bioanalyst can release a value they typed (E-25) | Allowed, recorded, reported | Self-entered releases per person |
| Correction | A wrong result can stay with a patient | New issue at once, old marked `REEMPLAZADO`, resend task | Correction to resend time. Corrections after delivery |
| Delivery | A failed send is invisible | Stored failure, order unchanged | Failure rate per channel, resend backlog |
| Delivery | Consent is missing when staff want to send | Refused with `STATE` (E-62), result kept | Refusals for consent per week |
| Portal | Clients phone to ask for a result | Released-only portal, no staff resend | Download per released order, days to first download |
| Money | A part-paid invoice stays open with no age | Abono and Resta, `Resta` still open on the close | Resta aging. Same-user reversals (E-47) |
| Fiscal | A copy printed with no Control N° | Refused until a number exists | Time `Pendiente` |
| Prices | A rate change mid-day creates mixed totals | Rate copied at save, unsaved orders warned (E-51) | Orders warned at Guardar |
| Migration | Same cédula on several rows | Session holds only rows matching Fecha de nac. (E-59), staff review list | Rows awaiting review |

---

## 3. Decisions to make before Phase 0

Recommended defaults are first. None of these changes a rule in `product/`.

| # | Decision | Recommendation | Who |
|---|---|---|---|
| D1 | Start the build now (Gate A) | Yes, as a prototype with invented data only | Owner |
| D2 | Stack | The documents' stack: Next.js App Router, strict TypeScript, Tailwind, shadcn/ui on the BIOMEG tokens, TanStack Query, React Hook Form with Zod, Zustand for layout only, `pg` with raw SQL, route handlers under `/api/v1`, no Server Actions | Owner |
| D3 | Where the code lives | The application at the repository root, beside `docs/`. `docs/` is not deployed | Owner |
| D4 | Branching | Never commit to `main`. One branch and one pull request per stage. Required review and checks on `main`. Production deploys from a separate project that this tool isn't linked to (`product/10`, A03) | Owner |
| D5 | Audit chain contention (A3) | Decide with a measured test in Stage 6 | Builder, owner |
| D6 | Whether Fecha muestra gets a time (A5) | Ask. Keep date-only until answered | Lead bioanalyst |
| D7 | Which staff screens are desktop-only | Desktop-first, usable at 360px with tables scrolling inside their container. Portal and verification mobile-first (`07`, rows 7 and 8) | Owner |

**Absolute rule for the whole build:** no real patient data in prompts, attachments, previews, or seed files. Never use the files named in `v0-prompts/README.md` under *Never attach* (`session/print-preview.md`, `session/README.md`, `session/mantenimiento.md`, the captures). Edit the staff name out of the `brand/04` Shell example before using it.

---

## 4. How we build: the technique framework

These are the techniques that make the edge cases and the data a property of the build, and not a review afterward.

| # | Technique | What it is | Why |
|---|---|---|---|
| T1 | **One decision, one pipeline** | Every endpoint goes through `withCommand` or `withQuery`: rate limit, session, role, body, transaction and facts, state and ownership, gesture, command, audit row, commit, scope | A hidden button is never a control. A route-scan test fails on any unwrapped route |
| T2 | **Table-driven permission tests** | The 105-row table is the test input. Each row is tested for every role, state, and gesture. Includes the 30 cases of V0-03 | Access is the highest-risk area and the cheapest to test exhaustively |
| T3 | **Doc-drift test** | A test parses `product/06` and compares it to `lib/auth/table.ts`, and compares E-IDs to the edge register | Closes A12. A rule can't change in one place only |
| T4 | **Edge-case register** | One file maps every ID (E-01 to E-63, P-01, P-03, M-02, the October cases) to a test file and a phase. CI fails if an ID has no test | The ~90 cases become a traceable checklist, not prose |
| T5 | **State machines as pure functions** | Order, result, and issue transitions in `lib/server/domain/`, with an exhaustive transition table test | Illegal moves are impossible, not merely unlikely |
| T6 | **Property-based tests** for pure rules | `computeAge`, `normalizeName`, `formatMoney`, `parseCedulaPaste`, Marca, totals. Fuzzed inputs, with accents, empty strings, and boundary dates | Formats are the most repeated code and the easiest to get slightly wrong |
| T7 | **Contract tests across stores** | One suite per repository, run against memory and SQL | The Stage 6 swap changes nothing else |
| T8 | **Deterministic clock and tokens** | `IClock` in America/Caracas and `ITokenGenerator` are injected | Same-day, 30-day, 3-hour, 15-minute, 10-minute, and 90-day rules become testable |
| T9 | **Concurrency tests** | Two savers, two releasers, two cells, the payment after a close | E-29, E-30, E-48, and the two-savers rule are races, not logic errors |
| T10 | **Idempotency keys** on Guardar and send | A double-click or retry reloads the first result | The documents don't cover this. It also protects fiscal numbers |
| T11 | **Ports with fakes** | Delivery, analyzer, fiscal number, rate, PDF, files, backup, identity, clock, tokens, each behind an interface | The unknown providers don't block the build, and nothing can call outside |
| T12 | **Five states per data region** | Empty, single item, partial, error, no permission. A shared `DataTable<T>` renders all five | A rule from `brand/`, enforced in the shared component |
| T13 | **Telemetry from the audit rows, not beside them** | Metrics are views over the audit log. See section 6 | One source. No second place that can disagree, and no clinical value outside the log's rules |
| T14 | **Browser verification each stage** | Open the preview, exercise the stage's critical flow, screenshot at the staff and portal viewports | Compiling is not behavior |

---

## 5. The phased plan

Prompt IDs are from [v0-prompts/](v0-prompts/README.md). The catalog's run order is kept. V0-A7 (architecture review) runs again after every stage. Each stage ends in one pull request, a checklist, and the V0-A7 report.

### Phase 0. Decisions and structure (Stage 0)

**Goal:** Agree what is built, and put the structure in place before any feature.

| Step | Work | Prompt | Output |
|---|---|---|---|
| 0.1 | Owner answers Gate A. Update the three "no application" lines | | A signed-off start |
| 0.2 | Resolve D1 to D7 | | Recorded in `docs/adr/` |
| 0.3 | Save the base rules | V0-00 | Saved instruction, scoped to this project |
| 0.4 | Plan with no code. Route map for three surfaces, ambiguous commands, contradictions | V0-01 | A reviewed plan |
| 0.5 | Architecture plan: container diagram, layers, folder tree, data classification, five ADRs | V0-A1 | `docs/architecture.md`, `docs/adr/` |
| 0.6 | Skeleton: strict TypeScript, lint rules that block layer violations, Zod env, redacting logger, `BaseService` with no public delete, DI container, query client with no persister, shared components, three route groups | V0-A2 | Compiles, and the section-6 searches return nothing |

**Exit:** the three surfaces share no layout or session. Importing `lib/db` from a component fails lint. `BaseService` has no public `delete`.

### Phase 1. Foundation (Stage 1)

**Goal:** Everything every later screen depends on, with no business screen yet.

| Step | Work | Prompt | Edge IDs covered |
|---|---|---|---|
| 1.1 | Tokens, logo, formats, status chips, invented seed data, `/dev/tokens` | V0-02 | Formats: `12,7`, `13.100`, `0001`, `V-12.345.678`, `Pendiente`, `SIN PRECIO` against `0,00` |
| 1.2 | Repository contracts, memory stores, contract tests, version-checked updates | V0-A3 | Two savers, soft-deleted cédula |
| 1.3 | **Permission table and `decide()`** | V0-03 | R-001 to R-149 |
| 1.4 | The endpoint pipeline, scopes, route-scan test | V0-A4 | E-14, E-15 |
| 1.5 | Ports and fakes | V0-A5 | |
| 1.6 | Security baseline in the skeleton: headers, cookies, CSRF, demo switch that fails a production build | V0-A8 | `product/10` A01 to A10 |
| 1.7 | Shell and menus | V0-04 | E-02 menu absence for refused roles |
| 1.8 | Staff sign-in, Clave, idle lock, fast user switch | V0-05 | E-10, E-11, E-12, E-57, E-58 |
| 1.9 | Reference slice: Registro de médicos | V0-A6 | A template every later feature copies |
| 1.10 | Flow standard and system map | V0-F0 | `docs/flows/` |

**Exit:** the doc-drift test (T3) passes. A refused action leaves one audit row and no data change. `/dev/tokens` looks flat and clinical.

### Phase 2. Clients and orders (Stage 2)

| Step | Work | Prompt | Edge IDs covered |
|---|---|---|---|
| 2.1 | Clientes: list, card, create. Cédula pair, Sin verificar, similar-name confirm. **Add the delivery consent field here (A9)** | V0-06, V0-F1 | P-01, P-03, E-16, E-21 |
| 2.2 | Modify, correct cédula, deactivate, delete, merge and undo | V0-07, V0-F11 | R-011 to R-022, E-16 to E-24, M-02 |
| 2.3 | Nueva orden: Cliente, Exámenes. Duplicate-exam warning, tipo de costo and price column kept apart | V0-08 | Same-day exam, E-51 |
| 2.4 | Nueva orden: Personal, Pago, Guardar. Idempotency key (T10) | V0-09, V0-F2 | Two savers, convenio and titular, E-48 |
| 2.5 | Anular, remove line, Presupuesto | V0-10 | R-028 to R-034, E-50 |

**Exit:** every Identity, Change, and Visit edge in `product/04` has a passing test (T4). A double-click on Guardar creates one order.

### Phase 3. Laboratory work and delivery (Stage 3)

| Step | Work | Prompt | Edge IDs covered |
|---|---|---|---|
| 3.1 | Hoja de trabajo, with status-only view for reception | V0-11 | R-040, R-041 |
| 3.2 | Result grid and Cargar resultados. Cell saved on leaving, in-cell state, toast only on failure | V0-12, V0-F3 | E-25 to E-29 |
| 3.3 | Liberar per section, one re-entry per batch | V0-13, V0-F4 | E-30, E-35, E-36 |
| 3.4 | Liberar corrección, open to release | V0-14, V0-F5 | E-31 to E-34 |
| 3.5 | Issued report, preview, PDF as text, QR when on | V0-15 | October: no rows header, red result, blank sex |
| 3.6 | Delivery and resend | V0-16, V0-F6 | E-38, E-62 |

**Exit:** **G1 is open here.** The grid is built on invented sections, and a note says so. Run the five-state check on every region. An unreleased value never appears in any reception or portal response (scope test).

### Phase 4. Patient-facing pages (Stage 4)

| Step | Work | Prompt | Edge IDs covered |
|---|---|---|---|
| 4.1 | Portal: Ingresar, Mis visitas, download. Separate layout, 44px targets, `gcTime: 0` | V0-17, V0-F7 | E-37 to E-42, E-59, E-60 |
| 4.2 | QR verification page, `no-referrer`, state only | V0-18, V0-F8 | E-43 to E-45, E-63 |

**Exit:** one generic portal error for all seven refusal causes, with the same status, body, and comparable timing. The portal does not open to real clients until the one-time code works.

### Phase 5. Money and back office (Stage 5)

| Step | Work | Prompt | Edge IDs covered |
|---|---|---|---|
| 5.1 | Abono, payments, reversal, closes | V0-19 | E-13, E-47, E-48, E-49 |
| 5.2 | Notes, reprints, Control N° | V0-20, V0-F9 | E-50, `COPIA` |
| 5.3 | Prices, rate, Saturday, QR switch | V0-21, V0-F10 | E-51, E-52 |
| 5.4 | Registries and inventory | V0-22 | |
| 5.5 | Reports and cost screens. Unopened ones show the sentence "Las columnas de este reporte no están capturadas." | V0-23 | |
| 5.6 | Users, backup, audit view, blocked commands | V0-24, V0-F12 | E-01 to E-09, E-53 to E-56 |

**Exit:** Trasladar paciente, Reversar relación, and Modificar valores are visibly blocked, and write nothing. IVA and IGTF show `0,00` with the caption until G2 closes.

### Gate B. Before Phase 6

| Question | Who |
|---|---|
| Deployment model, and whether a hosted database fits health data | Laboratory, counsel |
| Health data, retention, minors, portal credential | Venezuelan counsel |
| IVA and IGTF rates, rounding, Control N° (G2) | Owner, accountant |

Answer sheet: [gates/gate-b.md](gates/gate-b.md) (**Received** 06/11/2026). Research brief: [gates/gate-b-research.md](gates/gate-b-research.md). Hosted Neon; IVA 16%; IGTF 3% on FX; two-decimal rounding; Control N° Pendiente/nullable. Stage 6 may begin. Real patients wait for [gates/gate-c.md](gates/gate-c.md).

### Phase 6. Real backend (Stage 6)

Request the database integration only after Gate B. Use the documents' stack from D2.

| Step | Work | Prompt | Notes |
|---|---|---|---|
| 6.1 | Schema in Plan Mode: Mermaid diagram, raw SQL migrations, no ORM. Partial unique index on cédula where `deleted_at` is null. Money as decimal. `price` null differs from zero. Result as text | V0-25 | A person who knows databases reviews it |
| 6.2 | Real sessions, Argon2id, second factor for Administración and Bioanalista, server step-up. Remove the demo switcher and `/dev` | V0-26 | First administrator by one-time install, then disabled |
| 6.3 | Memory to SQL, one module at a time, same contract suite. **Audit store with the hash chain, insert-only account, daily verify, outside copy. Decide A3 with the concurrency test** | V0-27 | Stop after each module and test it |
| 6.4 | Portal, QR, and file hardening. Keyed hash. Private file storage. Rate limits in the database | V0-28 | Separate review before real use |

**Exit:** change an audit row by hand in a test database, and the verify routine flags it. Kill a transaction midway, and nothing is half-written.

### Phase 7. Verification (Stage 7)

| Step | Work | Prompt |
|---|---|---|
| 7.1 | State audit of every data region | V0-29 |
| 7.2 | Permission audit against the table | V0-30 |
| 7.3 | Language, format, and contrast audit. Chips readable with color removed | V0-31 |
| 7.4 | Privacy and scope audit | V0-32 |
| 7.5 | Five end-to-end flows: Guardar an order, enter and release, correct, portal sign-in and download, QR | |
| 7.6 | Independent security review. Restore test. Outage rehearsal | |

### Gate C. Before any real patient record

All of `product/10-security-baseline.md` under *Before any real patient record*, the lead bioanalyst's confirmations in `product/06`, the correct RIF, the chosen providers, and captures of the unopened forms. G1 and G3 close here. Blank sheet and questions: [gates/gate-c.md](gates/gate-c.md), [gates/gate-c-ask.md](gates/gate-c-ask.md).

### Phase 8. Pilot and migration

Not in the catalog. Added here because G3 is unsettled.

1. Examine a SICOEXC backup, then write the migration page. Log it as `data.import`.
2. Bring rows over into a review queue. Rows with one cédula and different birth dates go to the staff list (E-59).
3. Run in parallel with SICOEXC for a defined period. Compare turnaround, totals, and the Resta list.
4. Tune the starting values (5 failed sign-ins, 10-minute lock, 15-minute portal idle) from the data.

---

## 6. Capturing how, when, where, and why

The audit log already records who, what, when, where, how, why, result, and change on every decision. The plan makes it the **only** source of operational data.

### 6.1 Event model

| Question | Field | Source |
|---|---|---|
| How | Gesture and source: confirm, step-up, `teclado`, `equipo` | Audit row |
| When | Server time in America/Caracas, sequence number, request id | Audit row |
| Where | Channel (staff, portal, public, system), workstation, address | Audit row |
| Why | Motivo, policy version, rule id | Audit row |
| Who | User id, roles held, session id. A client by id. Público has none | Audit row |

### 6.2 Metrics, as views over the audit log

| Metric | Start event | End event | Reviewer |
|---|---|---|---|
| Intake time | `order.open` (confirm at 0.6) | | Owner |
| Time to first result | `order.open` | first `result.enter` | Lead bioanalyst |
| Release wait | `result.enter` | `result.release` | Lead bioanalyst |
| Turnaround | `order.open` | last `result.release` | Owner, lead bioanalyst |
| Delivery lag | `result.release` | first `delivery.*` | Owner |
| Portal uptake | `result.release` | `portal.download` | Owner |
| Correction time | `result.correct.open` | `result.correct.release` | Lead bioanalyst |
| Resend lag | `result.correct.release` | `delivery.*` after `delivery.resend.task` | Alert past a limit |
| Admin queue | R-019 request | R-020 act | Owner |
| Refusals by role and command | `access.denied` | | Fix the table, or look into the person |
| Discounts, non-default columns, same-user reversals | `order.line.change.discount`, R-026, `payment.reverse` | | Weekly |
| Portal failures by address | `portal.login.failed`, `portal.code.failed` | | Tighten limits |
| Step-up failures on Liberar | `step_up.failed` | | Immediate |

### 6.3 Rules for this data

| Rule | Why |
|---|---|
| Plain thresholds and aggregates only. No machine-learning model | `product/06`, *What the data will reveal* |
| Small groups are suppressed in Estadísticas | R-105, so a person can't be identified |
| No clinical value, cédula, name, or phone in a metric, a log, a URL, or an analytics tool | `07` rule 10, `product/09` |
| No analytics script on portal or verification pages | V0-28 |
| A monthly summary goes to the owner **and** the lead bioanalyst | Who reviews the reviewer |
| Summary and Flood tiers keep routine reads out of the log's noise | `product/09` |

---

## 7. Edge-case traceability

Every case maps to a test file in the edge register (T4). CI fails on an unmapped ID.

| Group | IDs | Phase | Test kind |
|---|---|---|---|
| Accounts and sessions | E-01 to E-15 | 1, 5 | Integration, concurrency for E-12, E-13 |
| Clients | P-01, P-03, M-02, E-16 to E-24 | 2 | Unit, contract, integration |
| Results | E-25 to E-36 | 3 | Concurrency for E-29, E-30. State table for E-31 to E-34 |
| Delivery, portal, verification | E-37 to E-46, E-59 to E-63 | 3, 4 | Integration. Same-shape test for the generic portal error |
| Money and configuration | E-47 to E-54 | 5 | Concurrency for E-48. Clock tests for E-51 |
| Security | E-55 to E-58 | 1, 5, 6 | Integration |
| Edge cases from `product/04` (identity, change, visit, portal, void and correct) | Named by heading | 2 to 4 | Each *shown, stored, refused* line is one assertion |
| October defects | 13 rows in `product/04` | 1 to 3 | Component and snapshot |

---

## 8. Risk register

| Risk | Likelihood | Effect | Handling |
|---|---|---|---|
| G1 stays open, and the grid is rebuilt | High | Rework of Stage 3 | Keep the grid generic. Section and analyte data are configuration |
| A3 audit contention | Medium | Slow result entry | Decide with a measured test in Phase 6 |
| The portal code provider is not chosen | High | The portal can't open to real clients | Attachment with consent, then portal. Keep the order in `product/10` |
| Permission table drifts from code | Medium | Silent access error | T3 doc-drift test |
| A real patient record reaches a preview | Low, severe | Privacy breach | Invented data only. Never attach the named files. Gate C |
| A prompt invents a column for an unopened form | Medium | False requirements | The "Never invent" rule in V0-00, and the V0-29 audit |
| Counsel's answers change retention or the credential | Medium | Schema and portal change | Delete nothing automatically. Portal credential behind a setting |
| The small laboratory can't separate roles | High | Conflict-of-duty cases | E-07 monthly report. Owner reviews |

---

## 9. What is needed from people, by when

| Who | What | Needed before |
|---|---|---|
| Owner | Gate A, D1 to D7 | Phase 0 |
| Lead bioanalyst | Captures of Precio Examenes and Crear Perfiles (G1). Confirm per-section release, auxiliary entry, self-entered values, and Fecha reporte. Say whether Fecha muestra needs a time. Define urgent results | Phase 3 (G1), Gate C |
| Accountant | IVA, IGTF, rounding, Control N° (G2). Paper steps for an outage | Gate B |
| Venezuelan counsel | Health data, retention, minors, the portal credential, hosting | Gate B |
| Laboratory | The correct RIF. Providers for WhatsApp and email. Captures of unopened forms. A SICOEXC backup for migration | Gate C |

---

## 10. Working agreement for the build

1. One branch and one pull request per stage. Nothing goes to `main` directly.
2. Before each stage, read the pages it cites. When a prompt and a page differ, the page wins.
3. After each prompt, go through its **Check** list. Use a repair prompt from `v0-prompts/06` when something drifts.
4. Run the section-6 searches and the commands in `07-engineering-rules.md` before every pull request.
5. A Spanish string the documents don't give goes under `pendingReview` in `lib/strings.ts`, for the laboratory to check at once.
6. Stop and ask on any Unknown. Never invent columns, formulas, or destinations for an unopened form.
7. Verify user-visible behavior in the browser at the end of each stage.
