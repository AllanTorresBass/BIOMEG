# v0 prompt catalog

**Date:** 1 November 2026  
**Purpose:** Ready-to-paste prompts that would have [v0](https://v0.app/docs) build the BIOMEG application, in a safe order.  
**Authority:** This catalog sets no rules. It restates [../product/](../product/) and [../brand/](../brand/). If a prompt differs from those pages, those pages win, so fix the prompt.

**Status:** This catalog sets no rules. A prototype is in progress at the repository root, on invented data kept in memory. The prompts were not sent to v0. A real patient record waits for Gate C. Gate B, before any real backend, is **Deferred by request**. Blank answers sit in [../gates/gate-b.md](../gates/gate-b.md); public-web context is in [../gates/gate-b-research.md](../gates/gate-b-research.md). Do not invent rates or hosting to start Stage 6.

## How to use it

1. Read [Before you start](#before-you-start).
2. Create one v0 project for BIOMEG, and save [V0-00](00-setup-and-foundation.md#v0-00-saved-instruction-base-rules) as a v0 instruction.
3. Each prompt lists the pages to attach or paste. Paths starting `v0-prompts/` are in this folder.
4. Follow the [run order](#run-order), because the architecture prompts sit between the numbered prompts. After each prompt, go through its **Check** list before moving on. When something drifts, use a [repair prompt](06-verification-and-repair.md#repair-prompts).
5. Stop at each [gate](#gates).

v0's guidance for complex apps is to plan first, build a first version, then add features in follow-up prompts. v0 can [queue up to 10 prompts](https://v0.app/docs/text-prompting), but queue only prompts in the same stage, because the checks between stages catch rule errors early.

v0 instructions are [saved on the account and stay applied until unchecked](https://v0.app/docs/instructions). Uncheck V0-00 when working on any other project. All chats in one [v0 project](https://v0.app/docs/projects) share the same app, deployment, and environment variables, so a large stage can use a new chat in the same project.

## Before you start

| Rule | Why |
|---|---|
| **No real patient data in v0, ever** | Prompts, attachments, and previews leave this workspace. v0's [security page](https://v0.app/docs/security) describes a training opt-out for Enterprise plans and does not state the policy for other plans. Check your plan before pasting anything sensitive |
| **Never attach** the session captures, `screenshots.pptx`, the backup archives, `session/print-preview.md`, `session/README.md`, or `session/mantenimiento.md` | One capture shows a real patient, and the backups contain report links with patient names in them. The first note shows a disputed RIF, and the other two name a real staff member, which v0 could copy into its samples |
| **Edit `brand/04-display-patterns.md` before attaching it** | The Shell table quotes a real staff name as an example. Remove it from the copy you attach, and leave this page as it is |
| **Production never deploys from v0 directly** | Connect GitHub with a protected branch, and deploy production from a separate project. See the [security baseline](../product/10-security-baseline.md#a03-software-supply-chain-failures) |
| **Stages 1 to 5 are a prototype** | They use invented data and a demo role switcher. They are not safe for real use |
| **Hidden is not protected** | Every action is decided on the server. A prototype that only hides buttons fails this catalog |
| **The prompts write secrets nowhere** | Keys go in the v0 project's environment variables, never in a prompt, and never with the `NEXT_PUBLIC_` prefix |

## Files

| File | Stage | Prompts |
|---|---|---|
| [00-setup-and-foundation.md](00-setup-and-foundation.md) | 0, Setup. 1, Foundation | V0-00 to V0-05 |
| [01-clients-and-orders.md](01-clients-and-orders.md) | 2, Clients and orders | V0-06 to V0-10 |
| [02-laboratory-work.md](02-laboratory-work.md) | 3, Laboratory work and delivery | V0-11 to V0-16 |
| [03-portal-and-verification.md](03-portal-and-verification.md) | 4, Patient-facing pages | V0-17 and V0-18 |
| [04-money-and-back-office.md](04-money-and-back-office.md) | 5, Money and back office | V0-19 to V0-24 |
| [05-real-backend.md](05-real-backend.md) | 6, Real backend | V0-25 to V0-28 |
| [06-verification-and-repair.md](06-verification-and-repair.md) | 7, Verification, and repairs | V0-29 to V0-32, then repair prompts |
| [07-engineering-rules.md](07-engineering-rules.md) | All | The WebTrixPro rules, adapted. Attach to structural prompts |
| [08-architecture-and-data-flow.md](08-architecture-and-data-flow.md) | Across all stages | V0-A1 to V0-A8, V0-F0 to V0-F12 |

IDs start with `V0-` so they can't be confused with MediLab's codes (P-01, P-03, M-02) or the permission rows (R-001). Paths under **Attach** are relative to `docs/`, unless they start with `assets/` or `access-control/`, which sit at the project root.

## All prompts

| ID | Builds | Roles it touches | Main source |
|---|---|---|---|
| V0-00 | Saved base rules | All | `product/`, `brand/` |
| V0-01 | A plan, with no code | All | `product/README.md`, `brand/07-feature-catalog.md` |
| V0-02 | Tokens, logo, formats, chips, demo data | All | `brand/01`, `02`, `09`, `tokens.css` |
| V0-03 | Permission table and decision function | All | `product/06`, `07` |
| V0-04 | Shell and menus | Staff | `brand/04` Shell |
| V0-05 | Staff sign-in, Clave, idle lock | Staff | `product/06` E-10 to E-15 |
| V0-06 | Clientes list, card, create | Recepción | `product/02`, `04` |
| V0-07 | Modify, correct, deactivate, delete, merge | Recepción, Administración | `product/04`, R-011 to R-022 |
| V0-08 | Nueva orden: Cliente, Exámenes | Recepción | `product/02`, `brand/04`, `05` |
| V0-09 | Nueva orden: Personal, Pago, Guardar | Recepción | `product/02`, `05`, `brand/04` |
| V0-10 | Anular, remove line, Presupuesto | Recepción, Bioanalista, Administración | R-028 to R-034 |
| V0-11 | Hoja de trabajo | Auxiliar, Bioanalista, Recepción | `brand/04` Worklist |
| V0-12 | Result grid and Cargar resultados | Auxiliar, Bioanalista | `brand/04`, `05` |
| V0-13 | Liberar per section | Bioanalista | R-046, E-25 to E-36 |
| V0-14 | Liberar corrección | Bioanalista | R-047 to R-049, `product/04` |
| V0-15 | Issued report, preview, PDF | Recepción, Bioanalista | `brand/04` Issued report |
| V0-16 | Delivery and resend | Recepción, Bioanalista | R-110 to R-115 |
| V0-17 | Portal: Ingresar, Mis visitas, download | Cliente | `product/02`, `04`, E-37 to E-42 |
| V0-18 | QR verification page | Público | R-144, E-43 to E-45 |
| V0-19 | Abono, payments, reversal, closes | Recepción, Administración | `product/03`, R-060 to R-065 |
| V0-20 | Fiscal notes, reprints, Control N° | Administración, Recepción | `product/03`, R-066 to R-071 |
| V0-21 | Prices, rate, Saturday, QR switch | Administración, Recepción | `brand/04` Price matrix, R-003, R-004, R-085 to R-087 |
| V0-22 | Registries and inventory | Administración, Bioanalista | `brand/04` Registry table |
| V0-23 | Reports and cost screens | Administración, Bioanalista, Recepción | `brand/07` Reports, R-088, R-100 to R-105 |
| V0-24 | Users, backup, audit, blocked commands | Administración, Bioanalista | R-120 to R-131, `brand/06` |
| V0-25 | Database schema, plan first | All | `product/05`, `brand/08` |
| V0-26 | Real sessions and server enforcement | Staff | `product/06`, `07`, `access-control/README.md` |
| V0-27 | Audit log and domain writes | All | `product/06` |
| V0-28 | Portal, QR, and files hardening | Cliente, Público | `product/04`, E-40 to E-45 |
| V0-29 | State audit of every data region | All | `brand/04` |
| V0-30 | Permission audit | All | `product/06` |
| V0-31 | Language, format, contrast audit | All | `brand/01`, `02` |
| V0-32 | Privacy and scope audit | All | This page |
| V0-A1 | Architecture plan, no code | All | `07-engineering-rules.md` |
| V0-A2 | Project skeleton, tooling, shared code | All | `07-engineering-rules.md` |
| V0-A3 | Data layer and contract tests | All | `product/05`, `brand/08` |
| V0-A4 | The one endpoint pipeline | All | `product/07` |
| V0-A5 | Ports to outside systems | Sistema | `product/05` |
| V0-A6 | Feature template, with one real slice | Administración | `brand/04` |
| V0-A7 | Architecture review | All | `07-engineering-rules.md` |
| V0-A8 | Security baseline in the skeleton | All | `product/10` |
| V0-F0 | Flow standard and system map | All | `product/02` |
| V0-F1 | Client identity | Recepción | `product/04` |
| V0-F2 | Order save | Recepción | `product/05` |
| V0-F3 | Result entry | Auxiliar, Bioanalista, Sistema | `brand/08` |
| V0-F4 | Release | Bioanalista | R-046 |
| V0-F5 | Correction and re-issue | Bioanalista | R-047 to R-049 |
| V0-F6 | Issue, PDF, and delivery | Recepción, Bioanalista, Sistema | R-110 to R-115 |
| V0-F7 | Portal | Cliente | `product/04` |
| V0-F8 | QR verification | Público | R-144 |
| V0-F9 | Money | Recepción, Administración | `product/03` |
| V0-F10 | Settings and prices | Administración, Recepción, Sistema | R-002 to R-004 |
| V0-F11 | Merge and undo | Recepción, Administración | R-019 to R-021 |
| V0-F12 | Session, step-up, and audit | All | `product/06` |

## Run order

Run top to bottom. V0-A7 runs again after every stage.

| Stage | Order |
|---|---|
| 0 Setup | V0-00, V0-01, V0-A1, V0-A2 |
| 1 Foundation | V0-02, V0-A3, V0-03, V0-A4, V0-A5, V0-A8, V0-04, V0-05, V0-A6, V0-F0 |
| 2 Clients and orders | V0-06, V0-F1, V0-07, V0-F11, V0-08, V0-09, V0-F2, V0-10 |
| 3 Laboratory work | V0-11, V0-12, V0-F3, V0-13, V0-F4, V0-14, V0-F5, V0-15, V0-16, V0-F6 |
| 4 Patient-facing | V0-17, V0-F7, V0-18, V0-F8 |
| 5 Money and back office | V0-19, V0-20, V0-F9, V0-21, V0-F10, V0-22, V0-23, V0-24, V0-F12 |
| 6 Real backend | Gate B, then V0-25, V0-26, V0-27, V0-28 |
| 7 Verification | V0-29, V0-30, V0-31, V0-32 |

## Gates

| Gate | Before | Who answers | Question |
|---|---|---|---|
| A | V0-01 | Owner | Do we start the application now, and is the v0 stack acceptable? |
| B | Stage 6 | Laboratory | The deployment model, and whether a hosted database fits health data |
| B | Stage 6 | Venezuelan counsel | Health data, retention, minors, and the portal credential |
| B | Stage 6 | Owner, accountant | IVA and IGTF rates and rounding, and how Control N° is assigned. Laboratory answers are **Unknown**; public secondary summaries sit in [../gates/gate-b-research.md](../gates/gate-b-research.md) |
| C | Any real patient | Lead bioanalyst | Everything marked "Lead bioanalyst to confirm" in `product/06-access-control.md` |
| C | Any real patient | Laboratory | The correct RIF, the provider for WhatsApp and correo, and captures of unopened forms |
| C | Any real patient | Owner | Every condition in [the security baseline](../product/10-security-baseline.md#before-any-real-patient-record), including an independent security review |

## Choices this catalog makes

The docs don't settle these. A prompt needs an answer in order to produce a screen, so each has a working answer. Each one is easy to change, and none is a rule of the application.

| Choice | Working answer | Where | Who confirms |
|---|---|---|---|
| Stack | Next.js App Router, TypeScript, Tailwind, shadcn/ui, because [that's what v0 names](https://v0.app/docs), plus the WebTrixPro rules' TanStack Query, React Hook Form, Zod, and raw SQL with `pg`. The docs chose no technology | V0-00 | Owner |
| Calls from the browser | Route handlers under `/api/v1`, as the WebTrixPro rules require, and no Server Actions | V0-00 | Builder |
| Chip refresh | Polling every 30 seconds and on focus. The docs require a refresh and name no method | V0-F10 | Builder |
| Double-click on Guardar | An idempotency key. The docs don't cover this case | V0-F2 | Builder |
| Fiscal number allocation | Counter rows in the same transaction, so a rollback leaves no gap | V0-F2 | Owner, accountant |
| Verification page for an `ABIERTA` order | "No disponible". R-144 has no matching row, and the page text is otherwise only stated for a voided order | V0-18 | Owner |
| Where Tipo de costo and the Billing card sit in the four steps | Billing card above the lines in Exámenes, and repeated read-only in Pago | V0-08, V0-09 | Owner |
| Where Motivo and Fecha muestra are entered | The Cliente step, under the selected client | V0-08 | Recepción |
| Which similarity measure yields the 0.85 name threshold | Trigram similarity on the normalized name. The docs give the threshold and not the measure | V0-06 | Owner |
| IVA and IGTF amounts | Rates come from a setting that starts empty, so the prototype computes and shows `0,00`, with a caption. BIOMEG has no settled rate; Gate B research is context only | V0-09 | Owner, accountant |
| PDF method | A server-rendered PDF from the same data as the preview | V0-15 | Builder |
| Portal layout | Works at phone width, because a client may use a phone. Staff screens are designed for desktop PCs | V0-17 | Owner |
| Chip colors for words with no palette pair: `ABIERTA`, `EN_CORRECCION`, En revisión, Pendiente, Sin verificar, Sin imprimir, Impreso | Neutral: secondary text on the sunken surface | V0-02 | Owner |
| Verification token | One per issue, so that a replaced issue can say so | V0-18 | Owner |
| Value check | Built behind a setting that's off, until confirmed | V0-15, V0-18 | Owner, lead bioanalyst, counsel |
| Catalog structure in the prototype | Invented sections and rows per exam, because no page says how an exam maps to printed rows | V0-02, V0-12 | Lead bioanalyst |

## What the prompts leave out on purpose

| Left out | Why |
|---|---|
| Options of Forma de pago, including a Cashea row | The dropdown was never opened |
| Resultados por, Observación on the invoice, and the Emergencia control | Seen on the October form, with no behavior defined, and not carried by the new patterns |
| Columns of unopened reports and registries | **Unknown**. The screen says so instead of inventing them |
| Trasladar paciente, Reversar relación, Modificar valores | Blocked until a capture shows what they do |
| Real WhatsApp, email, analyzer, and fiscal connections | Providers and protocols are **Unknown**. Each sits behind a fake that records what would have happened |
| Appointments, home collection, barcode tubes, electronic signature, commissions, medical-history chart, several sites, nómina, honorarios, finiquitos | Out of scope in `product/01-application-type.md` |

## Spanish wording

Quoted Spanish in the prompts comes from the docs. Where the docs give none, the prompts tell v0 to write short wording and mark it `reviewed: false` in one strings file, so someone at the laboratory can check it all at once. The one generic portal error is an example.

## Sources for how v0 works

Checked on 1 November 2026. v0 changes often, so check again before starting.

- [v0 documentation](https://v0.app/docs)
- [Text prompting](https://v0.app/docs/text-prompting)
- [Instructions](https://v0.app/docs/instructions)
- [Projects](https://v0.app/docs/projects)
- [Databases](https://v0.app/docs/databases)
- [Security](https://v0.app/docs/security)
- [PRD design](https://v0.app/docs/prd-design)
