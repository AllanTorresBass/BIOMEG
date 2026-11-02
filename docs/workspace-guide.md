# BIOMEG workspace guide

**Date:** 1 November 2026
**Purpose:** One place to understand this workspace: what it holds, how the pages relate, which page wins, and what is still open.
**Authority:** This guide summarizes. It sets no rules. If it differs from a page it points to, that page wins.

## 1. What this workspace is

BIOMEG Laboratorio Clínico is one clinical laboratory in Venezuela. It runs a Windows program called **SICOEXC**, from the vendor Soluciones Informáticas SM. This workspace specifies a **new application to replace it**.

**This workspace holds documentation only. No application is being built at this moment.** There is no application code, database, or technology choice. The history is in git, at <https://github.com/AllanTorresBass/BIOMEG>. That repository is public, so anyone can read and copy what's committed.

The application will be in Spanish. The documents are in English and quote Spanish labels exactly.

| Name | What it is | How the documents use it |
|---|---|---|
| **SICOEXC** | The laboratory's current program. Version 9.0 is published, and a banner mentions version 10 | Evidence of what exists today |
| **MediLab** | Another product, whose client path BIOMEG follows. It is not in this workspace | Source of design rules, quoted with codes such as P-01, P-03, and M-02 |
| **BIOMEG application** | The proposed replacement | Specified in `docs/product/` and `docs/brand/` |

## 2. Workspace map

| Path | Contents |
|---|---|
| `docs/` | All 96 Markdown pages, including this one, and `brand/tokens.css` |
| `assets/brand/` | 17 logo and icon files, exported from the master logo |
| `IMG-20261021-WA0099.jpg` | The only logo master, 1080×607. There is no vector version |
| `access-control/README.md` | A short note on what a future application must supply to the permission rules. The rules themselves are in `docs/product/` |
| `.cursor/plans/` | A finished plan that folded the 30 October session into the documents. History only |

### Documentation layers

| Layer | Folder | Pages | Question it answers |
|---|---|---|---|
| Evidence | `session/` | 12 | What did the current program's screens show on 30 October 2026? |
| Evidence | `data-model/` | 10 | What do printed reports establish about the data? |
| Evidence | `workflow/` | 9 | What are the steps of the laboratory's work? |
| Evidence | `modules/` | 15 | What does the vendor claim for each capability? |
| Evidence | `architecture/` | 13 | What is known about how SICOEXC is built? |
| Evidence | `sicoexc-research.md` | 1 | What do public sources say about the vendor and product? |
| Behavior | `product/` | 12 | What will the new application do? |
| Appearance | `brand/` | 10 | How will it look, and how is a screen documented? |
| Analysis | `access-control-analysis.md`, `access-control-plan.md` | 2 | Why do the access rules exist? |
| Build prompts | `v0-prompts/` | 10 | What would we ask v0 to build, and in what order? Restates `product/` and `brand/`, adds the adapted WebTrixPro engineering rules, and has not been run |
| Index | `README.md`, `workspace-guide.md` | 2 | Where do I start? |

## 3. Which page wins

| Question | Winner |
|---|---|
| What does the new application do? | `product/`, over `brand/` |
| Who may run a command, and access edge cases? | `product/06-access-control.md` |
| What is shown, stored, and refused on a client or laboratory edge? | `product/04-edges.md`, over `product/02-client-flow.md` |
| Color, type, and layout? | `brand/` |
| What was on a screen on 30 October 2026? | `session/` |
| What did the old program do, in other respects? | The evidence layer. It is not overruled by a design rule, because it answers a different question |
| Why was an access rule chosen? | The analysis and plan explain, but never win |

A sentence in one layer does not cancel a sentence in another. "The download was not published" in `modules/` is about the vendor's material, and does not cancel the BIOMEG portal.

### Two labeling systems

This is the easiest thing to get wrong. **"Observed" does not mean the same thing everywhere.**

| Where | Labels | Note |
|---|---|---|
| `product/`, `brand/` | **Observed**, **Design rule**, **Unknown** | Observed means printed, on a 30 October screen, or labeled that way in the research |
| `workflow/`, `modules/`, `architecture/`, `data-model/`, `sicoexc-research.md` | **Published**, **Observed**, **Inferred**, **Not published** | Published means a vendor claim. Observed can mean a public report or a vendor photo. Session sightings are cited to `session/` |
| `session/` | Opened and Not opened, with a Reading column | "Unknown" appears as plain wording |

## 4. The new application

Source: `product/README.md` and the pages it lists.

### What it is

A laboratory information system for one laboratory. Staff find or register a client, open an order, enter results, release them, issue the report, and collect payment. The client later signs in to a portal and downloads the released report.

```text
Buscar cliente ──► Crear cliente
        └────────┬────────┘
                 ▼
           Nueva orden: 1 Cliente, 2 Exámenes, 3 Personal, 4 Pago
                 ▼
        Hoja de trabajo ► Cargar resultados ► Liberar (per section)
                 ▼
        PDF, WhatsApp, correo
        Portal por cédula, Fecha de nac. y código
```

### Out of scope

Appointments and home collection, barcode tubes and sample records, electronic signature, physician commissions, a medical-history chart, several sites, nómina, honorarios, and finiquitos.

### Core records

| Record | Key rules |
|---|---|
| **Client** | A master record that exists before any order. A complete cédula is unique among clients that are not soft-deleted. With no cédula, the client is Sin verificar. Age is computed from Fecha de nac., never typed |
| **Order** | Binds the client, exams, convenio, money, and results. Saved at Pago with at least one exam. Stores tipo de costo and price column, and copies the BCV rate at save |
| **Result** | Stored as text, so a number and a word share a column. Written on leaving the cell, and frozen by Liberar |
| **Invoice and payment** | The rate never changes after save. A reprint is marked `COPIA` and allocates no number |
| **Portal session** | Three hours, or 15 idle minutes. No password is stored. A failed attempt stores a keyed hash, not the digits |

### Record states

```text
Order:  BORRADOR → ABIERTA → INCOMPLETO → LIBERADO ⇄ EN_CORRECCION
                     └────────────┴──→ ANULADA (no result released)
Result: PENDIENTE → CARGADO → LIBERADO → EN_CORRECCION → LIBERADO (new version)
Issue:  VIGENTE → REEMPLAZADO (once a correction is released)
```

### Access model

Every action gets one decision on the server, in this order: session, role, state, ownership, then gesture (nothing, a confirm, or a password re-entry, sometimes with a motivo). A hidden button is a display choice, not a control.

| Role | Holder | Scope |
|---|---|---|
| Recepción | Receptionist, secretary | Clients, orders, payments, delivery of released results |
| Auxiliar | Auxiliary, assistant | Worklist and result entry. Never releases |
| Bioanalista | Licensed bioanalyst | Release, corrections, clinical lists |
| Administración | Owner, administrator | Money, registries, users, backup. No clinical values |
| Cliente | Portal session | Own orders only |
| Público | Holder of the paper | Verification page, with the token in the code |
| Sistema | Analyzer link, sender, scheduler | Own commands only. Cannot sign in |

The physician has no account in the first release. The permission table has 105 rows covering 125 commands, in `product/06-access-control.md`. Row conditions and command names are in `product/07-rule-reference.md`.

## 5. The current program

### The 30 October 2026 capture

One live session was transcribed. Its image sources are kept **outside this workspace**, because the print preview shows a real patient.

**Opened:** the shell, the toolbar, the seven menus, a blank Facturación de Consultas, Lista de Precios, and one result preview with a QR code.

**Never opened (partial list):** Ayuda, Hoja de Trabajo, Cargar Resultados, every Registro and Administrativo form, the cost screens, Nuevo Usuario, Respaldo de la BD, Auditoría, Modificar and Trasladar forms, every report except Lista de Precios, and the Forma de Pago dropdown. The full list is in `session/README.md` and `session/gaps-and-edge-cases.md`.

| Menu | Holds |
|---|---|
| Pacientes | Ingreso Particular and Empresa, Facturar Consulta, Modificar Pacientes, Trasladar Paciente |
| Hoja de Trabajo y Resultados | Hoja de Trabajo, Cargar Resultados, printing commands, Status de Impresión |
| Registros | Médicos, Empresas, Proveedores, Reactivos y Servicios, Equipos, and the bacteriology lists |
| Administrativo | Reprints, notes, Cobros Cashea, payments, closes, accounts, Órdenes de Compra, Restar Inventario |
| Estructura de Costos | Promedios, Insumos, Salarios, Costos Reactivos, cost reports |
| Reportes | Lists, sales, purchases, retentions, payables, Evolución de Pacientes, Estadísticas |
| Mantenimiento | Price tools, Crear Perfiles, QR, Precio Sábado, Registro de Correo, Nuevo Usuario, Respaldo, Auditoría |

### The eight workflow steps

Role assignments here are **inferred**. The path is implied by the business, and is not a confirmed screen flow.

| Step | Who acts | Hands on | Related modules |
|---|---|---|---|
| 1 Admit and bill | Reception, secretary | Patient, visit, charge | Patient admission, Billing and payments |
| 2 Order from the catalog | Reception, secretary | Order lines, bench work | Test catalog, Patient admission |
| 3 Track the sample | Auxiliary, bioanalyst | Sample linked to exams | Quality control |
| 4 Produce the result | Analyzer, auxiliary, bioanalyst | Value on an order line | Analyzer connectivity, Result entry |
| 5 Validate | Bioanalyst | Released result | Validation |
| 6 Report | Bioanalyst, reception | Clinical report with QR | Reports, QR authenticity |
| 7 Deliver | Program, reception | WhatsApp or email to the patient | Result delivery, Client panel |
| 8 Review | Bioanalyst, director, reception | History and statistics. Not a gate | Statistical reports, Exam traceability |

Users and concurrent work sits under the whole flow, and belongs to no single step.

### What is known about how SICOEXC is built

| Area | Observed | Vendor claim | Inferred or unknown |
|---|---|---|---|
| Client | Windows desktop PCs | Version 9.0, roles working at once | Language and installer. VB6 is only a weak hypothesis |
| Data store | Respaldo de la BD exists, not opened | Centralized data | Engine. SQL Server and MySQL are résumé skills only |
| Report engine | Printed pages, QR on the preview | Adaptable layouts | Renderer. Crystal Reports is a hypothesis |
| Web | WordPress site and a login page | | What the panel shows after login |

Other unknowns: analyzer protocol, WhatsApp provider, QR payload, Cashea settlement, the source of the rate, and proof of the SENIAT homologation claim.

### What printed reports establish

Laboratory template, report, order, patient, convenio, section, result line, exam description, printed reference text, and observation. **This is an output model, not a schema.** Labels are not column names. Field types, keys, and table names are unknown for every entity.

## 6. Brand

Source: `brand/README.md`. Exact values are in `brand/01-palette.md` and `brand/tokens.css`.

| Item | Rule |
|---|---|
| Identity colors | Navy `#203860`, burgundy `#6C1834`, white. Sampled from the logo |
| Result flags | High `#8A1C1C`, low `#0E4D62`, deliberately not logo colors. An in-range result has no status color |
| Color and words | Color is a second channel. A status word is always present |
| Type | Source Sans 3, then Segoe UI. A result is never under 14px. Numbers use tabular figures |
| Logo | The JPEG is the only master. Never redraw or recolor it. The shell uses the emblem on a white tile. Sign-in and the report use the full lockup |
| Voice | Clinical and short. A label names the fact, and does not coach |
| Work screens | Flat fills, with no gradients, heavy shadows, or full-bleed photos |

**Display patterns:** Shell, Patient header card, Billing card, Line table, Result grid, Price matrix, Registry table, Fiscal report, Issued report, Worklist, Status chip.

**Every data region has these states:** empty, single item, partial, error, and no permission.

## 7. Writing rules

Full standard: `brand/03-documentation-standard.md`.

| Fact | Format |
|---|---|
| Date | `DD/MM/YYYY` |
| Result and money | Comma decimal, period thousands, such as `12,7` and `13.100` |
| Order number | At least four digits, zero-padded, such as `0001` |
| Cédula | Type (`V`, `E`, `J`, `P`, `G`) plus 6 to 10 digits, shown as `V-12.345.678` |
| Missing Control N° | `Pendiente` |
| Blank price, stored zero | `SIN PRECIO`, `0,00` |

**A screen or pattern note has nine sections, in order:** Purpose, Actor, Record, Pattern, Fields or columns, States, Write, Audit, Evidence. `brand/04-display-patterns.md` does not fully follow this, so do not use it as a template.

**Privacy:** No patient name, document, age, or phone from the capture goes in any page. Use shapes such as `V-12.345.678`. The laboratory's own identity and field labels are allowed.

**Never invent:** An unopened form keeps its name, and its fields stay **Unknown**.

## 8. Glossary

| Term | Meaning |
|---|---|
| Liberar | Release results, per section. The central professional act |
| Liberar corrección | Change a released result, which creates a new issue |
| Cargar resultados | Enter results |
| Hoja de trabajo | The bench worklist |
| Procesado por | The bioanalyst named on the report |
| Marca | The printed flag, `ALTO` or `BAJO` |
| Cédula | The national identity document number |
| Sin verificar | A client with no cédula |
| Convenio | An agreement with a company or payer |
| Titular | The account holder a convenio may require |
| Tipo de costo | The kind of cost on an exam line, distinct from the price column |
| Tasa BCV | The central bank exchange rate shown in the shell |
| Abono, Resta | Amount paid so far, amount still owed |
| Factura, Control N° | Invoice, and its fiscal control number |
| Nota de crédito, débito | Fiscal notes issued against a factura |
| Cierre de caja | The daily drawer close |
| Anular | Void an order |
| Fusionar | Merge two client records |
| Motivo | A typed reason, required on sensitive actions |
| IVA, IGTF, ISLR, ARCV | Venezuelan tax and withholding terms used on fiscal documents |
| SENIAT | The Venezuelan tax authority |
| RIF | The laboratory's tax registration number |
| Cashea | A named payment method |
| `EN_CORRECCION`, En revisión | A correction is open. The first is the state, and the second is what the portal and QR page say |

## 9. Open items

### Waiting on people

| Who | What |
|---|---|
| Owner | Set the discount percent, which starts at 0, and the outage targets. Confirm everything listed under [Applied, awaiting confirmation](#applied-awaiting-confirmation) |
| Lead bioanalyst | Confirm per-section release, the license rule, auxiliary entry, self-entered values, Fecha reporte, `SIN PRECIO` not blocking Liberar, stopping an action when its audit row can't be written, the list of clinical audit events, the order-state trigger, and Procesado por per section. Define urgent results for an outage |
| Venezuelan counsel | Review health data, retention including the source of the "six-year" fiscal expectation, minors, the portal credential, delivery consent, the value check, Administración seeing identity changes in Auditoría, and where health data may be hosted. No page here is legal advice |
| Accountant | Give the IVA and IGTF rates and rounding, how Control N° is assigned, and how payments and facturas work on paper during an outage |
| Laboratory | Provide captures of unopened forms, a shift interview, and the deployment model. Complete the names and contacts in the outage draft |
| Laboratory | Say which RIF is correct. The logo prints `V-241355540`, and the preview shows `Y241355540` |

### Decisions still needed

These can't be settled from the documents, because each needs a fact, a capture, or legal advice.

| Issue | Where | Recommendation | Who decides |
|---|---|---|---|
| Which RIF is correct, and what prints on paper. The logo pixels hold one value, and the laboratory record may print another beside it | `brand/01-palette.md`, `brand/02-brand-style.md`, `brand/09-logo-assets.md`, `session/print-preview.md` | Confirm the number. If the logo is wrong, the laboratory supplies a new master | Laboratory |
| How the exam catalog is structured: one exam to many analytes, whether Categoría is a section, and where units and reference text are maintained. No command creates those rows, Modificar valores is blocked, and Crear perfiles has unknown members | `product/08-logical-data-model.md`, `brand/06-edge-cases.md` | Get captures of Precio Examenes and Crear Perfiles, then decide | Lead bioanalyst, laboratory |
| What is brought over from SICOEXC. The rules assume migrated rows, and no page defines a migration | `product/04-edges.md`, `product/06-access-control.md` | Define it once a backup or export can be examined | Owner |
| IVA and IGTF rates and rounding, and how Control N° is assigned. The rates are kept in a setting, which starts empty | `product/05-data.md`, `session/facturacion.md` | Get them from the accountant | Owner, accountant |
| Where the outside copy of the audit hash lives | `product/09-audit-log.md` | Depends on the deployment model | Laboratory, owner |
| Whether to turn on the value check, which is written and stays off. Anyone holding the paper, or a clear photo, could open the report for 90 days | `product/10-security-baseline.md` | Decide after legal review | Owner, lead bioanalyst, counsel |
| The outage draft: its targets of 1 hour of data and 4 working hours, the named people, urgent results, and paper fiscal steps | `product/11-outage-procedure.md` | Complete it, then rehearse | Owner, lead bioanalyst, accountant |

### Applied, awaiting confirmation

Applied on 1 November 2026, on the instruction to apply the recommendations. That instruction doesn't replace these people's confirmation. The access-related ones are in the Decisions table of `product/06-access-control.md`.

| Item | What was applied | Who confirms |
|---|---|---|
| Status words | Capitals on chips and printed flags, and sentence case in running text | Owner |
| Released green | Kept on `ACTIVO` and `DISPONIBLE`, unless staff confuse it with a released result | Owner |
| `brand/04-display-patterns.md` | Keeps its shape. New notes use the nine-section standard | Owner |
| Reviewing the access rules | A person reviews each change, because no code enforces them | Owner |
| Order states | `BORRADOR` is the unsaved Nueva orden. The first stored result moves an order to `INCOMPLETO` | Lead bioanalyst, owner |
| Procesado por | A name per section when they differ | Lead bioanalyst |
| Convenio | A row in Registro de empresas, with Status and Requiere titular. The titular is on the order | Owner |
| Client notes | Removed, because no other page used the field. Tell us if the laboratory needs one | Owner |
| Audit log practices | Everything in `product/09-audit-log.md`, including the tiers for routine reads and stopping an action when its audit row can't be written | Owner, lead bioanalyst |
| Security baseline | `product/10-security-baseline.md`, the Bioanalista and password-reset rules, and the portal's one-time code | Owner, and counsel for the credential |
| Sending reports | A portal link, or an attachment with recorded consent | Owner, counsel |
| Rows with one cédula | Rows brought over only, and a session holds only those matching Fecha de nac. | Owner |

**Decided:** BIOMEG manages staff sign-in and all role-based access itself, with no outside identity service such as Auth0.

**Settled by checking:** the vendor page `/lista-de-examenes/` is titled “Lista de Clientes e interfaz lis con equipos automatizados”, checked on 1 November 2026. `modules/test-catalog.md` and `modules/analyzer-connectivity.md` now say so.

## 10. Skills for this workspace

These live in `.claude/skills/`, and Claude Code picks them up automatically.

| Skill | Use it to |
|---|---|
| `biomeg-find-answer` | Answer a question from the right page, with the right label |
| `biomeg-write-docs` | Add or change a page, following the standard |
| `biomeg-access-rules` | Read or change who may do what |
| `biomeg-consistency-check` | Find and fix contradictions between pages |
| `biomeg-brand` | Apply color, type, logo, and voice rules |

## 11. Where to start

| You want to | Read |
|---|---|
| Understand the application | `product/README.md`, then `product/01` and `product/02` |
| Check a permission | `product/06-access-control.md` |
| See the access rules explained | `access-control-analysis.md` |
| See what the old program showed | `session/README.md` |
| Add a screen note | `brand/03-documentation-standard.md` |
| Trace a menu command | `brand/07-feature-catalog.md` |
| Decide what a save stores | `product/05-data.md`, `brand/08-data-lifecycle.md` |
| See every record and field of the new application | `product/08-logical-data-model.md` |
| See what the audit log records and how it's protected | `product/09-audit-log.md` |
| See the security minimum, and what must be true before real patient data | `product/10-security-baseline.md` |
| Know what to do when the system is down | `product/11-outage-procedure.md` |
| Ask the vendor something | `sicoexc-research.md`, section 9 |
| Build the application in v0, once that's decided | `v0-prompts/README.md` |
