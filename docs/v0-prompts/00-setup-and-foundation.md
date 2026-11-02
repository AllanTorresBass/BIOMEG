# Stages 0 and 1: Setup and foundation

[Back to the catalog](README.md)

Nothing here shows a patient workflow yet. These prompts set the rules that every later screen depends on, so review them closely.

## V0-00. Saved instruction: base rules

**How to use:** In v0, press **+** in the prompt bar, then Instructions, then New Instruction. Title it `BIOMEG base rules`, paste this as the rule, and keep it checked for this project only.

```text
PRODUCT
BIOMEG Laboratorio Clínico is a laboratory information system for ONE clinical laboratory in Venezuela. Staff find or register a client, open an order, enter results, release them, issue the report, and collect payment. The client later signs in to a portal and downloads the released report.

STACK
Next.js App Router, TypeScript in strict mode, Tailwind CSS, shadcn/ui restyled to the BIOMEG tokens, TanStack Query, React Hook Form with Zod, sonner, Zustand for layout preferences only, pg with raw parameterized SQL and no ORM, pnpm. Route handlers under /api/v1 for every call from the browser, and no Server Actions. Do not add a dependency when the platform or an existing one does the job.

ENGINEERING
Follow docs/ENGINEERING_RULES.md once it exists. In short:
- Layers point downward only: Screen, Component, Hook, Service, then HTTP, then Endpoint, Command or Query, Domain, Data. No fetch in a screen, component, or hook. No SQL or rule in a route handler. No business rule only in the browser.
- P0, blocks merge: any, as any, console.*, new SomeService() outside a container, string-built SQL, a secret in code, a silent failure, protected data without decide(), a clinical value or identity in a log, URL, toast, or client storage, a hard delete, an update to an audit row.
- All types and prop interfaces live in /types/[feature]/. Use z.infer. Catch as unknown. Type guards are in types/api.types.ts.
- Build each feature in the order in docs/FEATURE_TEMPLATE.md, once it exists.
- Every mutation gives feedback through useGlobalErrorHandler and sonner, except result cells (in-cell state, toast on failure), inline validation, and the portal sign-in error.
- Files stay under about 300 lines. Generic UI goes in components/shared and takes configuration.

LANGUAGE AND FORMATS
All UI text is Spanish, exactly as I quote it. Code and comments are English.
Dates DD/MM/YYYY. Decimal comma, thousands period: 12,7 and 13.100. Time zone America/Caracas. Order number at least four digits, zero-padded: 0001. Cédula shown as V-12.345.678. Missing Control N° reads Pendiente. A blank price reads SIN PRECIO, and a stored zero reads 0,00. A missing value shows an em dash.
Keep every UI string in lib/strings.ts. A string I did not give you goes under a `pendingReview` key so the laboratory can check it. The tone is clinical and short: a label names the fact and never coaches. Commands are sentence case and verb first (Generar PDF). An empty state names what is missing. An error says what failed and what remains stored.

LOOK
Use the tokens in app/tokens.css only, never a raw hex in a component. Font: Source Sans 3, then Segoe UI, then sans-serif. Flat fills. No gradients, no shadow over 1px, no full-bleed photos, no decorative illustration, no emoji. Screen title 20px/600, card title 16px/600, body 14px/400, column header and chip 12px/600. A result is never under 14px. Row height 36px. Card radius 8px and padding 16px. Control radius 4px. Results, money, rates, dates, and identifiers use tabular figures. Color is a second channel: every status always shows its word.

DISPLAY PATTERNS
Use only these: Shell, Patient header card, Billing card, Line table, Result grid, Price matrix, Registry table, Fiscal report, Issued report, Worklist, Status chip. Do not invent a new widget. Tell me if you think one is needed.

STATES
Every data region handles five states: empty, single item, partial, error, no permission. On a failed action, keep what the operator typed and say what remains stored. While refreshing, keep the last good values visible.

ACCESS
Every action, by every actor, gets one decision on the server through lib/auth/decide.ts. A hidden button is only a display choice, never the control. A command the role cannot run is absent from the menu. A direct route without permission shows the screen title and the chip BLOQUEADO with no values.

NEVER INVENT
Some commands are real and their forms were never captured. Their fields are Unknown. Do not invent columns, formulas, dropdown options, or destinations for them. An unopened report renders its title, its filters, and the sentence "Las columnas de este reporte no están capturadas."
Do not build: appointments, home collection, barcode tubes, sample records beyond Fecha muestra, electronic signature, physician commissions, a medical-history chart, several sites, nómina, honorarios, finiquitos, a physician account.

DATA
No real patient data, ever. Use invented people such as "Paciente Demo Uno". All data goes through repository interfaces in types/contracts, so the store can be replaced later. Age is never typed: it is computed from Fecha de nac. and Fecha muestra.

HOW TO WORK
Change only what I ask for. Before writing code for a large request, state briefly what you will change. When a requirement is ambiguous, ask instead of guessing. After each task, list what you could not complete and any Spanish string you added.
```

**Check:** The instruction is checked on the chat, and unchecked on other projects.

## V0-01. Plan, with no code

**Goal:** Catch misreadings before any code exists. Turn on v0's **Plan Mode** preset.  
**Attach:** `product/README.md`, `product/01-application-type.md`, `product/02-client-flow.md`, `brand/README.md`, `brand/07-feature-catalog.md`, `v0-prompts/07-engineering-rules.md`.

```text
Read the attached specification. Do not write code in this response.

Produce:
1. A route map for three separate surfaces, as route groups: staff (app/(staff)/, such as /clientes), client portal (app/(portal)/portal/), and public verification (app/(public)/verificar/[token]/).
2. For each staff route, the display pattern it uses and the roles that may open it.
3. How the routes map onto the features in the engineering rules' folder structure.
4. A list of every command you think is ambiguous or Unknown, with what you intend to do about it. Your default for Unknown is to show the sentence the spec gives and to invent nothing.
5. Anything in the spec you think is contradictory. Precedence: product pages over brand pages on behavior, brand pages on color, type, and layout, and 04-edges over 02-client-flow.

Keep it to what the spec says. Do not propose extra features.
```

**Check:**
- Three surfaces are separate, and the portal and verification page don't use the staff shell.
- Trasladar paciente, Reversar relación, and Modificar valores are listed as blocked.
- No appointment, barcode, or physician-account route appears.

## V0-02. Tokens, logo, formats, chips, demo data

**Attach:** `brand/tokens.css`, `brand/01-palette.md`, `brand/02-brand-style.md`, `brand/09-logo-assets.md`. Upload from `assets/brand/`: `logo-lockup.png`, `logo-emblem-on-white.png`, `report-header.png`, `favicon.ico`, `favicon-16.png`, `favicon-32.png`, `apple-touch-icon.png`, `icon-192.png`, `icon-512.png`, `icon-maskable-512.png`, `og-image.png`, `site.webmanifest`.

```text
Build the foundation. No business screens yet.

1. TOKENS. Copy the attached tokens.css exactly into app/tokens.css. Map shadcn/ui's theme variables to these tokens: primary is --color-navy, background is --surface-page, card is --surface-card, foreground is --text-primary, muted foreground is --text-secondary, border is --border-default, ring is --focus-ring. Focus is a 2px navy ring on a control that keeps its visible label. Load Source Sans 3 through next/font.

2. LOGO. Put the uploaded files in public/ and add the head markup from the attached 09-logo-assets page. The theme color is #203860. Create <LogoLockup/> and <ShellEmblem/> from the image files. Never redraw, recolor, outline, shadow, or convert them to SVG. Never retype BIOMEG to imitate the letterforms. The lockup keeps a clear space of one quarter of the emblem diameter, is never inside a card, cell, or button, and is never displayed under 320px wide. Do not hardcode any RIF: the RIF comes from a laboratory settings record, and the demo value is the literal "RIF sin confirmar".

3. FORMATTERS in lib/utils/format.ts, with unit tests: formatDate (DD/MM/YYYY), formatMoney (13.100,00), formatResultNumber (12,7), formatRate (889,26), formatOrderNumber (0001), formatCedula (V-12.345.678 from a type and digits), parseCedulaPaste (a pasted "V-12.345.678" gives type V and the digits; a pasted digit string with no letter is read as V only by this paste parser), computeAge (from birth date and sample date: years, or months when under two), normalizeName (trim, collapse spaces, title case for es-VE, plus a key with accents removed and letters uppercased).

4. STATUS CHIP. <StatusChip status="..."/> driven by one table in lib/config/status.ts. Chips and printed flags are in capitals. Running text, filter options, and field values are in sentence case, such as Control N° reading Pendiente. 12px, weight 600, 4px vertical padding, tabular figures. Icon beside ALTO and BAJO only.
   ALTO: text --flag-high on --flag-high-bg
   BAJO: --flag-low on --flag-low-bg
   INCOMPLETO, SIN TASA: --flag-incomplete on --flag-incomplete-bg
   BLOQUEADO, INACTIVO, NO DISP.: --flag-blocked on --flag-blocked-bg
   LIBERADO, ACTIVO, DISPONIBLE: --flag-released on --flag-released-bg
   ABIERTA, EN_CORRECCION, EN REVISIÓN, PENDIENTE, SIN VERIFICAR, SIN IMPRIMIR, IMPRESO: neutral, --text-secondary on --surface-sunken
   Staff screens show the state word EN_CORRECCION. The portal and the verification page show En revisión.
   An in-range result never gets a chip or any status color. The chip never stands in for a missing value.
   The brand burgundy is never used for a result flag.

5. DEMO DATA in lib/db/memory/seed.ts, in memory. V0-A3 places it behind repositories. Everything invented:
   - Staff: one user per role, Recepción, Auxiliar, Bioanalista, Administración, named "Lcda. Demo", and so on.
   - 6 clients, "Paciente Demo Uno" onward: complete cédulas in the shape V-12.345.678, one Sin verificar, one inactive, one soft-deleted, one with blank sex.
   - Registro de empresas rows, which are the convenios: "Empresa Demo, C.A." (active, requires titular), "Seguro Demo, C.A." (active), "Convenio Inactivo Demo" (inactive).
   - Physicians "Dr. Demo Uno", "Dra. Demo Dos".
   - Catalog sections and exams, in this order: HEMATOLOGIA COMPLETA with SERIE ROJA, SERIE BLANCA, SERIE PLAQUETARIA; QUIMICA SANGUINEA; PERFIL LIPIDICO; ANÁLISIS FÍSICO, ANÁLISIS QUÍMICO, ANÁLISIS MICROSCÓPICO.
   - Result lines covering every shape: 12,7 and 13.100 (numbers), NEGATIVO, NORMAL, AMARILLO, POSITIVO (+++), 1-3 XC, ESCASAS.
   - Reference text covering every shape, stored as text: "3,80 - 5,80"; "Hasta 200 mg/dL"; "< 150 mg/dL"; a stacked cell "HOMBRE: 12,0 - 16,0 / MUJER: 11,0 - 15,0"; "70 -105 mg/dL" with a unit column of mg/dL; "Favorable menor de 4.5"; "NORMAL"; a dot.
   - Calculated names as ordinary rows: V.C.M., H.C.M., C.H.C.M., R.D.W., LDL-COLESTEROL.
   - Prices invented, in five columns Particular, Aliados, Hospitalizado, Emergencia, Estatal, in USD and Bs, status Disponible or No disp. At least one blank price and one stored zero.
   - Laboratory settings: Tasa BCV 889,26 with its date, QR ACTIVO, Precio sábado INACTIVO, discount limit 0, IVA and IGTF rates empty. The value check is a deployment setting, off by default.

6. A /dev/tokens page, hidden from navigation, that shows every token, chip, and type size so I can review them.
```

**Check:**
- No hex value appears outside `app/tokens.css` and no RIF is typed anywhere.
- A high flag doesn't look like the burgundy, and the chips read correctly with color removed.
- `/dev/tokens` looks flat, dense, and clinical, and not like a marketing template.

## V0-03. Permission table and decision function

**Goal:** The most important prompt in the catalog. Build this before any screen, so that every screen uses it.  
**Attach:** `product/06-access-control.md` and `product/07-rule-reference.md`, in full, plus `access-control/README.md`.

```text
Build the access decision as pure TypeScript with no UI. Keep it in lib/auth/, with import "server-only".

1. lib/auth/table.ts holds every row from the two attached pages as data, one object per row: id (R-001...), label, commands, the applies-when conditions, and one grant per role with its gesture and role conditions. Keep the rows in the order they are listed on the rule reference page: R-034 sits before R-033, because the first matching row applies. Include the table version, 5. Do not skip, merge, or summarize rows. There are 105.

2. lib/auth/decide.ts exports decide(input) and follows the six steps under "How a decision reads the table" exactly:
   Session, Command (UNKNOWN_COMMAND), Role (ROLE or BLOCKED), Row (first match; a condition on a missing fact, or no match, gives STATE; a blocked row gives BLOCKED), Grant (OWNERSHIP when the row depends on $own, otherwise STATE; a read-only grant on an action gives ROLE; the reason is the furthest check reached), Gesture (the lightest applies among several roles; among equal gestures, the grant with no motivo; a password re-entry also satisfies a confirm; the answer names what is missing: STEP_UP, CONFIRM, or MOTIVO_REQUIRED).
   Output: allowed or refused, the reason code, the row id, the required gesture, and the scope.

3. Input rules:
   - The person comes from the server session, never from the request.
   - Facts come from the store. A fact must be a real boolean: 1 is not true. A blank motivo counts as no motivo.
   - $own is computed by comparing the record's owner with the person. A caller can't supply it.
   - Password re-entry and confirm count only after the server verified them.
   - A client, public, or system role stands alone and never carries staff rights.

4. Scopes are duties on the caller: status_only, clinical_text_masked, aggregates_only, released_sections_labeled_partial, date_and_number_until_released. Export a helper that applies each.

5. The audit row. V0-A4 builds the pipeline that calls decide and writes this row for every answer, including refusals, using the tiers in product/09-audit-log.md. Define the row's type now, in types/audit/audit.types.ts. Audit fields: who (user id, display name, roles, session id), what (command, record type, id, state), when (server time, America/Caracas), where (channel, workstation, address), how (gesture and source), why (motivo, table version, row id), result, and change (before and after). Refused events store no cédula digits and no results. In this stage the audit store is an in-memory, append-only array.

6. Unit tests with these exact cases:
   | Person | Command | Facts | Expected |
   | Auxiliar | result.release | state CARGADO | ROLE |
   | Bioanalista | result.release | state CARGADO, no re-entry | STEP_UP |
   | Bioanalista | result.release | state LIBERADO | STATE |
   | Recepción | client.merge | any | ROLE |
   | Administración | client.merge | both_complete_and_different true | STATE |
   | Administración | client.merge | that fact is the number 1 | STATE |
   | Administración | client.merge | false, no re-entry | STEP_UP |
   | Recepción | values.modify | any | BLOCKED |
   | Recepción | client.transfer | any | BLOCKED |
   | Recepción | rate.set | rate_today_exists true | STATE |
   | Recepción | rate.set | rate_today_exists false | allowed |
   | Recepción | payment.reverse | same_day true, not own, confirm and motivo | OWNERSHIP |
   | Recepción | payment.reverse | same_day false, own, confirm and motivo | STATE |
   | Recepción and Administración | payment.reverse | same_day true, own, confirm and motivo, no re-entry | allowed |
   | Recepción | order.void | has_released_result true | STATE |
   | Recepción | order.void | has_payment true | STATE |
   | Recepción | order.void | no payment, no result, confirm, blank motivo | MOTIVO_REQUIRED |
   | Administración | result.read | state LIBERADO | ROLE |
   | Recepción | worklist.read | none | allowed, scope status_only |
   | Cliente | portal.grid.read | INCOMPLETO, section_released true, own client | allowed, scope released_sections_labeled_partial |
   | Cliente | portal.grid.read | INCOMPLETO, section_released true, other client | OWNERSHIP |
   | Cliente | portal.grid.read | INCOMPLETO, section_released false | STATE |
   | Administración | inventory.deduct | re-entry only, no confirm | allowed |
   | Any staff | not.a.command | none | UNKNOWN_COMMAND |
   | Administración | user.role.change | grants_bioanalista true, with re-entry | STATE |
   | Administración | user.grant.temporary | has_end_date true, grants_bioanalista true, re-entry and motivo | STATE |
   | Administración | role.grant_bioanalista | license_present true, with re-entry | allowed |
   | Recepción | delivery.send | state LIBERADO, delivery_mode_allowed false, confirm | STATE |
   | Público | verify.file.read | value_check_enabled false, every other fact true, matching token | STATE |
   | Público | verify.file.read | every fact true, matching token | allowed |

7. Order state rule, in lib/server/domain/order-state.ts. BORRADOR is the unsaved Nueva orden. Guardar moves it to ABIERTA. The first stored result moves it to INCOMPLETO. It is LIBERADO when every section is released. A correction on a section moves that section's results to EN_CORRECCION. A fully released order moves to EN_CORRECCION with them. An INCOMPLETO order stays INCOMPLETO, and the section under correction shows En revisión until released again. ANULADA is reachable only when no result is released.

Report the row count and the test results. If a row in the page seems contradictory, tell me and do not fix it silently.
```

**Check:**
- Row count is 105, and R-034 comes before R-033.
- Every listed test passes, run locally if the preview can't run them.
- Spot check five rows against `product/06-access-control.md`. Who holds what must match exactly.

## V0-04. Shell and menus

**Attach:** `brand/04-display-patterns.md` (Shell section), `brand/07-feature-catalog.md`.

```text
Build the staff shell in app/(staff)/layout.tsx. It wraps every staff route. No business content yet.

BAR. --color-navy-deep, 56px. Emblem on a 40px white rounded tile, then BIOMEG and a smaller line LABORATORIO CLINICO, both white Source Sans 3 text. The RIF is not shown here. Trailing cluster, left to right: Usuario activo, Tasa BCV, QR, Precio sábado, Cerrar sesión, Salir. Under the user name, a caption with the running application version.
- Tasa BCV: the rate, such as 889,26, with the date it was taken in a caption. With no rate today, the chip reads SIN TASA, in incomplete colors, and priced actions stay disabled.
- QR and Precio sábado: chip text ACTIVO or INACTIVO, not a colored dot. Precio sábado has the caption "Aplica a todo el laboratorio."

PRIMARY ACTIONS. On the page under the bar, as text buttons, each shown only if the role may run it: Ingreso particular, Ingreso empresa, Hoja de trabajo, Cargar resultados, Presupuesto, Cierre de caja, Clave.

MENU. A single row: Pacientes, Hoja de trabajo y resultados, Registros, Administrativo, Estructura de costos, Reportes, Mantenimiento. Flyouts list every command in the attached feature catalog, using those exact names, including a cut-off "Generar relación de paciente". Filter the menu through decide(): a command this role cannot run is absent. A menu group left with nothing is absent. Route each command to a placeholder page with the screen title and the sentence "Pantalla pendiente en este prototipo."

HOME. A panel titled Nueva observación with Mostrar, Ocultar, a date (default today), and Buscar. Empty: "Sin observaciones para esta fecha." Single: one row with the header kept: date, author, first line of text. These hold no patient data.

ROUTE GUARD. Any staff route without permission renders the title and the chip BLOQUEADO with no values, and writes access.denied. If a role is removed mid-session, the next request is refused with BLOQUEADO and the menu refreshes.

DEMO ONLY. A clearly labeled control at the very bottom of the page, "Demo: cambiar rol", switches between the demo staff, and a person may hold several roles. Keep it in one file, components/dev/DemoRoleSwitcher.tsx, because it is removed in a later stage.

LAYOUT. Page margin 24px, gap between cards 16px. Content column at most 1200px on administrative lists, and full width on the result grid and price matrix. Desktop first.
```

**Check:** Switch through each role and compare the menu with `product/06-access-control.md`:
- Auxiliar has no money menus.
- Administración has no clinical commands.
- Status chips show for every role.
- No SICOEXC version banner appears.

## V0-05. Staff sign-in, Clave, idle lock

**Attach:** `product/06-access-control.md` (Accounts and sessions, Starting values).

```text
Build staff sign-in and session behavior on the demo store.

SIGN-IN at /entrar: the full lockup, Usuario, Clave, and a navy primary button Entrar. Success writes session.enter. Failure shows only "No se pudo entrar." and no clinical record. After 5 failed attempts, a 15-minute pause with the same generic message, and writes session.enter.failed.

CLAVE: a single card with the current password and the new password, for the signed-in user only. Writes password.change. A password is never shown back and never printed. A temporary password forces a change at the next sign-in.

CERRAR SESIÓN returns to sign-in and writes session.leave. SALIR leaves the current form and asks for confirmation only when there are unsaved edits.

IDLE LOCK. After 10 minutes the workstation locks and asks the same user to re-enter. Re-entry returns to the same screen, and unsaved cell text stays. Writes session.lock.

FAST USER SWITCH. A different person signing in on a shared PC ends the previous session, and nothing carries over.

SAME USER ON TWO PCS is allowed. Label payments by workstation.

STEP-UP DIALOG. Use the shared StepUpDialog and ConfirmDialog, from POST /api/v1/session/step-up as V0-A4 describes. Wrong password writes step_up.failed, and the action does not run. A companion ConfirmDialog handles the C gesture, and a required motivo is a text field that refuses blank.

Keep the numbers (5, 15, 10) in one settings file. They are starting values to adjust after the pilot.
```

**Check:**
- The failure message doesn't say which field was wrong.
- Idle lock keeps typed text.
- The re-entry dialog calls `POST /api/v1/session/step-up` rather than checking in the browser.
