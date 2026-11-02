# Architecture and data flow prompts

[Back to the catalog](README.md)

**Architecture prompts (V0-A1 to V0-A8)** set up the structure before any feature exists.  
**Data flow prompts (V0-F0 to V0-F12)** trace each important path from the operator's action to the database and back, write that trace into the app's own docs, and confirm that the code matches it.

[The catalog's run order](README.md#run-order) shows where each one goes. Attach [07-engineering-rules.md](07-engineering-rules.md) to every prompt on this page.

## Architecture prompts

### V0-A1. Architecture plan, with no code

**Goal:** Turn on Plan Mode. Catch structural errors while they cost nothing.  
**Attach:** `07-engineering-rules.md`, `product/01-application-type.md`, `product/05-data.md`, `product/06-access-control.md`, `access-control/README.md`.

```text
Do not write application code in this response. Write the content of docs/architecture.md for BIOMEG, following the attached engineering rules exactly.

Include:
1. A Mermaid container diagram: staff browser, client browser, holder of the paper, the Next.js app, PostgreSQL, private file storage, and the ports for WhatsApp, email, analyzer, fiscal control number, and backup. Mark each port as a fake for now, because the provider or protocol is Unknown.
2. A Mermaid diagram of the layers: Screen, Component, Hook, Service, then HTTP, then Endpoint, Command or Query, Domain, Data. Show that dependencies point downward only.
3. The three surfaces (staff, portal, verification), with what each may reach. Show that they share no session and no layout.
4. The full folder tree, with one line on each folder's job.
5. The feature list, with API names and Spanish page URLs: session, clients, orders, worklist, results, reports, deliveries, portal, verify, payments, fiscal, prices, settings, registries, lists, costs, users, audit.
6. A data classification table, using these exact classes:
   | Class | Examples | Log | URL | Browser cache | Client storage |
   | Clinical | results, Marca, reference text, exam names on an order | never | never | memory only | never |
   | Identity | name, cédula, birth date, phone, email | never | never | memory only | never |
   | Fiscal | factura, payments, notes | ids only | ids only | memory only | never |
   | Configuration | rate, QR, Saturday, prices, registries | yes | yes | memory | never |
   | Preference | column widths, density | yes | n/a | memory | Zustand |
   | Security | password, tokens, keys | never | never | never | never |
7. ADRs in docs/adr/, one short file each, for: own sessions behind IStaffIdentityProvider instead of Auth0; repositories instead of SQL in route handlers; a DI container instead of exported singletons; route handlers instead of Server Actions; no ORM.
8. Anything in the attached rules or spec that you think conflicts, and which page you believe wins. Do not resolve a conflict silently.

Keep to what is written. Propose no extra features or services.
```

**Check:**
- All three surfaces are separate.
- Every port is a fake.
- There's no ORM, and no mention of Auth0 except in the ADR.

### V0-A2. Project skeleton

**Attach:** `07-engineering-rules.md`, `docs/architecture.md` from V0-A1.

```text
Create the project skeleton from the attached rules. No BIOMEG feature yet. Make it compile and pass every check.

1. TOOLING. TypeScript strict. ESLint errors for no-console, @typescript-eslint/no-explicit-any, and no-restricted-imports enforcing: no lib/server, lib/auth, or lib/db from components, hooks, stores, or lib/services; no lib/services from lib/server; no fetch in components or hooks. Prettier. pnpm scripts: ci:lint:fast, test, build. Vitest for tests. Add an import "server-only" to everything under lib/server, lib/auth, and lib/db.

2. CONFIG. lib/config/env.ts validates environment variables with Zod at startup and fails loudly. Add .env.example. Never use NEXT_PUBLIC_ for anything sensitive.

3. LOGGER. lib/logger.ts with debug, info, warn, error, by environment. It redacts keys and values that look like a name, cedula, phone, birthDate, email, result, password, or token. The tests prove the redaction.

4. API BASE.
   - types/api.types.ts: the ApiError shape, HandledError, EntityType, isValidEntityType, and the guards isHandledError, isHandledDuplicate, isHandledRateLimit, isHandledConflict, isAccessRefused.
   - lib/utils/errors.ts: getErrorMessage(error: unknown), returning Spanish text from lib/strings.ts.
   - lib/services/base/BaseService.ts: protected typed get, post, patch, with one shared HTTP client, abort signal support, safe JSON parsing, and error normalization. It has NO public list, create, update, or delete methods. Each service exposes its own named methods only.
   - lib/services/container.ts: a lazy DI container with getters. lib/services/index.ts exports only container.

5. CLIENT STATE.
   - lib/query-keys.ts: a hierarchy per feature (all, lists, list(filters), details, detail(id)). Filters never contain a name or cédula.
   - A QueryProvider with an in-memory cache only and no persister. Document staleTime, gcTime, retry, and refetchOnWindowFocus per data class.
   - A clearClientState() helper, called on sign-out and on user switch, that clears the query cache.
   - hooks/use-global-error-handler.ts with handleCrudError and handleFetchError, and hooks/use-action-toast.ts, using sonner and lib/strings.ts. Toasts never contain clinical or identity data.

6. SHARED COMPONENTS in components/shared/, all generic and configured by props, with exported interfaces in /types/shared/:
   - DataTable<T>: sticky header, virtualization option, pagination, inner horizontal scroll, and the five states.
   - ErrorBoundary, EmptyState, ErrorState, TableSkeleton.
   - StepUpDialog, ConfirmDialog, MotivoField.

7. ROUTES. Empty route groups (staff), (portal), and (public), each with its own layout, loading.tsx, and error.tsx. Middleware applying a rate limit to /api/v1, through an interface, with an in-memory implementation for now.

8. Copy the attached rules to docs/ENGINEERING_RULES.md.

Run every command in section 6 of the rules, and report the output.
```

**Check:**
- Importing `lib/db` from a component fails lint.
- `BaseService` has no public `delete`.
- The Section 6 searches return nothing.

### V0-A3. Data layer

**Run after:** V0-02.  
**Attach:** `07-engineering-rules.md`, `product/05-data.md`, `brand/08-data-lifecycle.md`.

```text
Build the data layer's structure. The stored data remains the invented demo data.

1. CONTRACTS in types/contracts/: one focused repository interface per record, such as IClientRepository, with methods named for what they do: findById, searchByNameOrCedula, insert, updateIfVersion, softDelete. Follow interface segregation. Audit gets append and read only, with no update or delete. Results get no delete. Payments get no update or delete.

2. MEMORY IMPLEMENTATIONS in lib/db/memory/. Move the existing demo data behind these repositories.

3. CONNECTION in lib/db/connection.ts: the interface for getClient() and withTransaction(fn), which has a memory implementation for now. A pg pool implementation comes in a later stage. Note in code that serverless needs a small pool. Commands receive a transaction context, so that every repository call in a command shares it.

4. PATTERNS every repository follows:
   - Soft delete with deleted_at, and default reads exclude it.
   - updateIfVersion: optimistic concurrency returns a conflict with who saved it and when, never overwriting.
   - Money is a decimal string or integer minor units, never a float.
   - Results and reference text are strings.
   - A null price and a zero price stay different.
   - Times are stored in UTC, and displayed in America/Caracas.
   - List methods paginate.
   - Row types are mapped to domain types at this boundary.

5. CONTRACT TESTS in tests/contract/: a suite that takes any implementation of a repository. This same suite will later run against SQL. Cover: a soft-deleted cédula doesn't block a new client, a duplicate active or inactive cédula is refused, a version conflict is reported, a null price stays null, and audit rows can't change.

6. server container in lib/server/container.ts: lazy getters returning repositories by interface. Only this file constructs them.
```

**Check:**
- Nothing outside `lib/db/` and the server container imports a concrete repository.
- A result value is typed as `string`.

### V0-A4. Endpoint pipeline

**Run after:** V0-03.  
**Attach:** `07-engineering-rules.md`, `product/07-rule-reference.md`, `access-control/README.md`.

```text
Build the one pipeline that every endpoint uses: withCommand in lib/auth/with-command.ts, and withQuery for reads. No route handler may reach a command or query another way.

ORDER, for each request:
1. Rate limit (429).
2. Session, from the httpOnly cookie, never from the request body (401 SESSION).
3. Role check through decide(), with no record facts, so a refusal doesn't depend on a record the person can't use (403).
4. Parse the body with the feature's Zod schema (400, inline messages).
5. Open a transaction. Load the record and its facts, locking rows whose state decides the answer. Facts come only from the store. $own is computed here.
6. decide() with the full facts. Map the reason to a status using section 5 of the rules.
7. Gesture. Password re-entry and confirm count only once verified by the server:
   - POST /api/v1/session/step-up verifies the password and returns a short-lived token, bound to this session and to the command. One re-entry covers one selected batch.
   - A confirm needs a one-time token. The first call answers 428 with what the dialog must show, such as the destination, plus the token. The client repeats the request with it.
   - A motivo is non-blank text, stored in the audit row.
8. Run the command, with the transaction context.
9. Write the audit row in the same transaction. If it can't be written, the action doesn't happen, for writes and for reads of clinical values.
10. Commit, then apply the scope to the response and return.

REFUSALS AND FAILURES. A refused or failed attempt rolls back the business change, and its audit row is written in its own transaction, so it survives. Refused events store no cédula digits and no results. A route handler catches errors as unknown, logs through logger with no personal data, and returns the standard error shape.

SCOPES. Applied on the server in withQuery, before serializing: status_only, clinical_text_masked, aggregates_only, released_sections_labeled_partial, date_and_number_until_released. A response object is built from an allow-list of fields, never by deleting fields from a full record.

SCREENS. Provide guarded server functions in lib/server/queries/ for Server Components, using the same steps 1 to 3 and 5, 6, and 10. Screens hydrate TanStack Query from them.

UI PERMISSIONS. GET /api/v1/session returns the user's roles and allowed commands, for showing or hiding controls. This is display only. Show in a test that a direct call is still refused when the client thinks it's allowed.

Add integration tests: no session, wrong role, wrong state, missing gesture, blank motivo, a rollback leaving the refusal row, and a scope leaving no forbidden key in the JSON.

Add a test that scans app/api/v1/**/route.ts, and fails if an exported handler isn't wrapped by withCommand or withQuery. Public exceptions are only portal sign-in, staff sign-in, and verification, which use their own wrappers and are listed by name.
```

**Check:**
- The route scan test fails when you add an unwrapped route, and passes when you remove it.
- A refused action leaves one audit row and no data change.

### V0-A5. Integration ports

**Run after:** V0-A4.  
**Attach:** `07-engineering-rules.md`, `product/05-data.md`, `brand/08-data-lifecycle.md`.

```text
Define ports for everything outside the application. Each has an interface in types/contracts/, a fake implementation in lib/server/ports/fakes/, and a getter on the server container. No SDK, and no call to a real service.

- IDeliveryPort: send(channel, destination, fileRef, body), returning a result. The fake records and can be set to fail.
- IAnalyzerPort: inbound values. The protocol is Unknown. The fake lets a demo feed one value.
- IFiscalControlPort: assign a Control N°. Unknown. A manual implementation by Administración.
- IRateSource: the Tasa BCV source is Unknown. Manual entry only. No automatic fetch.
- IPdfRenderer: render(issueSnapshot), returning bytes.
- IFileStore: private put and get, with no public URLs. The fake is memory.
- IBackupRunner: run(), returning a record. Claims no path or engine.
- IStaffIdentityProvider: verifyPassword, changePassword, resetPassword, disable.
- IClock: now(), in America/Caracas, so that same-day, 30-day, and session rules can be tested.
- ITokenGenerator: cryptographically random tokens.

Add one contract test for each port. Add a settings row or env var only when a real provider requires one, and don't add one now.
```

**Check:** `grep` for any provider SDK or external URL, and find none.

### V0-A6. Feature template, with one real slice

**Goal:** A worked example for v0 to copy, so every later feature matches.  
**Run after:** V0-A5 and V0-05.  
**Attach:** `07-engineering-rules.md`, `brand/04-display-patterns.md` (Registry table), rows R-080 from `product/06-access-control.md`.

```text
Build Registro de médicos as the reference slice for every later feature, in exactly this order:

1. TYPES: types/physicians/physician.types.ts, physician.schemas.ts (Zod, with Spanish messages from lib/strings.ts), physician.props.ts. Use z.infer. Update the EntityType union, isValidEntityType, use-action-toast, and use-error-handler.
2. REPOSITORY: interface, memory implementation, and contract tests.
3. COMMANDS AND QUERIES: lib/server/commands/physicians/, lib/server/queries/physicians/, audited as registry.create and registry.update.
4. ENDPOINT: app/api/v1/physicians/route.ts and [id]/route.ts, wrapped by withCommand and withQuery. 201 on create, 409 "Ese nombre ya existe." on a duplicate, 404 when missing.
5. SERVICE: lib/services/physicians/PhysicianService.ts, extending BaseService, implementing an interface, with a getter on the container.
6. QUERY KEYS: queryKeys.physicians.*.
7. HOOK: hooks/use-physicians.ts with useQuery, useMutation, invalidateQueries on success, and useGlobalErrorHandler.
8. UI: components/registries/, a thin wrapper around the generic Registry table, configured by props, then app/(staff)/registros/medicos/page.tsx, loading.tsx mirroring the table, and error.tsx.
9. TESTS: unit, contract, integration including refusals.

Then write docs/FEATURE_TEMPLATE.md listing these nine steps with this slice's real file paths. Every later feature prompt follows this template. Keep this slice, because it's the real Registro de médicos.
```

**Check:** Read every file of the slice yourself. Every later feature copies whatever it does.

### V0-A7. Architecture review

**Run:** After each stage, and before any merge.  
**Attach:** `07-engineering-rules.md`.

```text
Review the code against the attached rules. Don't change anything. Report using the template in section 8 of the rules, with file and line for each finding, and P0 first.

1. Run every command in section 6, and include the output.
2. Layer boundaries: list any import pointing upward or sideways. Circular dependencies. A feature reaching into another's internals.
3. DI: any construction outside a container. Any consumer importing a concrete class.
4. Any route handler with SQL or a domain rule.
5. Any rule implemented only in the browser. Compare the Zod schema and the command for each form.
6. Any read returning a whole record to the browser instead of an allow-listed one.
7. Duplicated components or utilities, by similar names and by similar code.
8. Missing states in each list and form, missing loading.tsx, and missing ErrorBoundary around the result grid, price matrix, and charts.
9. Silent failures: every mutation has visible feedback, under the BIOMEG exceptions.
10. Files over 300 lines.
11. Missing or non-matching flow documents in docs/flows/.

Say what you could not check. Do not say something passed unless you checked it.
```

### V0-A8. Security baseline

**Run after:** V0-A5.  
**Attach:** `product/10-security-baseline.md`, `07-engineering-rules.md`.

```text
Apply the attached security baseline to the skeleton. Do not build features.

1. HEADERS in one place: the values in section A02, with no-referrer on /verificar and no-store on anything with clinical, identity, or fiscal data.
2. COOKIES: HttpOnly, Secure, SameSite=Lax or stricter. Separate staff and portal cookies. CSRF protection on every state-changing route handler.
3. ENVIRONMENTS: a DEMO_MODE setting guards the role switcher and /dev routes. The production build fails if it's on. Previews use invented data only.
4. SUPPLY CHAIN: commit the lockfile. A CI workflow runs a frozen install, pnpm audit failing on high or critical in production dependencies, ci:lint:fast, tsc, test, and build. Tell me about each direct dependency: what it's for, and that the name is the intended package.
5. INJECTION HELPERS: an allow-list helper for sort columns and direction, a LIKE-escape helper, and an email-destination validator that rejects line breaks. Tests for each. No raw HTML rendering of stored text.
6. FAILURE BEHAVIOR: the table in section A10. A rate limiter failure refuses staff sign-in, portal, and verification with their generic message, and doesn't affect signed-in staff. Refused rows with no session are batched, so that they can't delay clinical writes.
7. SYSTEM ACTORS: each has its own credential, read from the environment, one per purpose, and is checked by the pipeline. Add no shared credential.

List each item in the attached page that this step doesn't cover, and which later prompt must.
```

**Check:**
- A production build fails with `DEMO_MODE` on.
- Response headers match the table.
- CI fails on a known-vulnerable package.

## Data flow prompts

### V0-F0. Flow standard and map

**Run after:** V0-A6.  
**Attach:** `07-engineering-rules.md`, `product/02-client-flow.md`, `brand/07-feature-catalog.md` (Home-to-paper path).

```text
Create docs/flows/README.md, the standard for every flow document in this project, and a Mermaid map of the whole system:
client master → order → worklist → results → release → issue → PDF and delivery → portal and QR, with money from the order to the drawer, close, and fiscal documents, and audit under everything.

Each flow document in docs/flows/ has these sections, in this order:
1. Trigger: who does what, on which screen.
2. Access: permission row IDs, and gestures.
3. Sequence: a Mermaid sequence diagram through Component, Hook, Service, Endpoint, Command, Domain, Repository, and DB, returning to the UI.
4. Writes: each table and field, in one transaction or several.
5. Audit: exact event names.
6. Response: which fields go back, and which scope applies.
7. Client: query keys invalidated, the feedback shown, and what stays in memory.
8. Refusals: each case, with status, reason, Spanish text, and what remains stored.
9. Data leaving: what leaves the laboratory, and where to.
10. Tests: the test files that prove this flow.

A flow document describes what the code does. If the code and the spec differ, list the difference under "Discrepancies" and ask me. Do not change the spec to match the code.
```

### V0-F1. Client identity flow

**Run after:** V0-06.  
**Attach:** `product/04-edges.md` (Identity), `product/05-data.md` (Client).

```text
Write docs/flows/client-identity.md, then make the code match this trace, and add the tests. Tell me what you changed.

SEARCH. Search hook → ClientService.search → POST /api/v1/clients/search, so that no name or cédula is in a URL → R-010 → repository. Results are allow-listed. Auxiliar: only clients on their worklist.

CREATE. RHF and Zod in the browser, for fast feedback → POST /api/v1/clients → R-014 → the same Zod schema again on the server → transaction:
1. Normalize the name, and parse the cédula. Digits only.
2. A half pair or a bad length gives 400.
3. P-01: find by type and digits, among non-deleted clients. A match gives 409 and offers the existing client. A unique partial index also protects this, so a race is caught as a duplicate and returns the same answer.
4. P-03: similarity on the normalized key at or above 0.85 and no confirmation gives 409, with the similar clients, and nothing stored. The repeat request carries the confirmation.
5. Insert, marked Verificado or Sin verificar. Birth date required. Age is never stored as a source of truth.
6. Audit patient.save, with the confirmation recorded.

UPDATE. PATCH with a version. The row is chosen by facts in table order: R-011 cédula with an order, refused; R-012 birth date or sex after a result; R-013 phone or email after Liberar; R-014 otherwise. R-012 flags the order for review. R-013 stores the before and after. A rename updates the master and unissued orders. Issued files are never touched. A version conflict gives 409 and reloads.

CLIENT. Invalidate clients lists and this detail, and open orders on a rename. Toast on success. Validation stays inline. The form's values stay when a save fails.

TESTS. Each refusal, a duplicate race, and proof that a cédula never appears in a URL or a log.
```

### V0-F2. Order save flow

**Run after:** V0-09.  
**Attach:** `product/05-data.md` (Order, Invoice), `product/04-edges.md` (Visit attachment), `brand/08-data-lifecycle.md` (Order, Exam line, Invoice).

```text
Write docs/flows/order-save.md, make the code match, and add tests.

BORRADOR. The four steps live in browser memory only, in React Hook Form or Context. Nothing is stored and no number is allocated until Guardar. Leaving asks for confirmation if there are edits. Nothing goes to client storage.

READS during the steps: client, catalog (virtualized, cached, status included), the price for the chosen column and currency, the current rate and Saturday flag, active médicos, active convenios. A same-day shared exam check runs at step 2, with the server as the authority.

GUARDAR. POST /api/v1/orders, with an idempotency key so a double click can't create two orders or allocate two numbers → R-023 → Zod → one transaction:
1. Load the client: must exist, be active, and not be soft-deleted.
2. Same-day shared exam (America/Caracas, ignoring voided orders): needs a motivo, or 428.
3. Convenio: active. Required titular present. Empresa requires a razón social.
4. Sin verificar requires the billing party's complete cédula.
5. Rate: a rate must exist. If it differs from the rate the client saw, 409 with a warning, and the repeat carries the confirmation.
6. For each line, read the price SERVER-SIDE. Never trust a browser price. Store tipo de costo, column, currency, price or null, the Saturday flag, and status. A column other than a saved default runs R-026. A No disp. exam needs its confirm.
7. Discount: R-024 or R-025 by within_limit.
8. Totals, computed in lib/server/domain from stored rates. Never trust browser totals. An empty tax rate computes 0,00.
9. Allocate N° orden and Factura N° from counter rows, in this transaction, so a rollback leaves no gap. Control N° stays null, shown as Pendiente.
10. Insert the order (state ABIERTA), lines, and payments. Copy the rate.
11. Audit order.open, order.line.add for each line, payment.record for each amount, and order.line.change.discount when used.

CLIENT. Invalidate orders lists, the worklist, and this client's detail. Success toast with N° orden. Failure shows "La orden no se guardó." and keeps the form.

SECOND SAVE of an existing order: version check, order.save.refused, "Esta orden fue guardada por [usuario] a las [hora].", reload.

TESTS. A tampered browser price is ignored. A double click makes one order. A failure midway leaves no row and no number used. A later rate change leaves the order alone.
```

### V0-F3. Result entry flow

**Run after:** V0-12.  
**Attach:** `brand/08-data-lifecycle.md` (Result), rows R-042 to R-045, R-145, E-26 to E-29.

```text
Write docs/flows/result-entry.md, make the code match, and add tests.

READ. withQuery, R-044 before release (Auxiliar, Bioanalista), R-045 after (Recepción read-only too). Administración gets 403. Recepción during a correction gets no values. Responses are no-store, and the query cache is memory only.

WRITE. On leaving a cell: PATCH /api/v1/orders/[id]/results/[lineId] with text and version. Unchanged text sends nothing. Requests for one cell run in order, and the last typed value wins in the browser. Abort superseded requests.
1. Facts: state, cell_empty_or_own. R-042 or R-043 applies. R-043 requires a motivo.
2. A numeric analyte with a non-numeric entry gives 400 "El resultado no es un número." and the stored value stays.
3. updateIfVersion. A conflict gives 409 with both values, and result.conflict is written.
4. Store the text exactly as typed. Never parse it into storage.
5. computeMarca in lib/server/domain, a pure function: only a single closed numeric range, a numeric result, and a non-blank sex. Otherwise blank, unless a bioanalyst set it. A bioanalyst's choice is never overwritten.
6. Result state becomes CARGADO. The first stored result moves the order from ABIERTA to INCOMPLETO.
7. Audit result.enter with source teclado.

CLIENT. The cell shows saving, saved, or failed, with no success toast. Failure toasts and keeps the typed text visibly unsaved beside the stored value. The idle lock keeps unsaved text in memory only. A different user signing in clears it.

ANALYZER. IAnalyzerPort → command result.import → R-145. An empty or analyzer-owned cell stores with source equipo. A typed cell keeps its value, and the incoming value is stored separately, for the bioanalyst to resolve. After release: refused from the result, queued, and shown as a discrepancy.

TESTS. Auxiliar overwriting someone's value is refused. Each Marca case. Two writers. Recepción's response has no value key before release.
```

### V0-F4. Release flow

**Run after:** V0-13.  
**Attach:** rows R-046, E-25, E-30, E-35, E-36, Record states in `product/06-access-control.md`.

```text
Write docs/flows/release.md, make the code match, and add tests.

POST /api/v1/orders/[id]/sections/release, with the section ids and a step-up token → R-046, one re-entry for the batch → one transaction:
1. Lock the order and its sections.
2. Each section's results must be CARGADO. If another bioanalyst got there first, refuse and say so. Procesado por stays the first.
3. Set results to LIBERADO. They are frozen. Store Procesado por from the server session, never from the request.
4. Write Fecha reporte, at the first release and updated by each later one.
5. Recompute the order state with the pure function in lib/server/domain/order-state.ts. Every section released means LIBERADO, otherwise INCOMPLETO.
6. Record whether this user typed any value, for the self-release report. Allowed.
7. Audit result.release per section, with the table version.

NOT CHECKED, on purpose: payment or SIN PRECIO. Add no such check.

EFFECT, with no message passed: the portal and reception read released data on their next request, because their queries read state directly. Nothing is pushed or sent by this flow.

CLIENT. Invalidate this order, its results, and the worklist. Success toast. A failed re-entry writes step_up.failed and releases nothing.

TESTS. Non-bioanalyst refused, including through a direct call. No step-up token. A reused or expired token. Two simultaneous releases. A partial release leaving INCOMPLETO. Empty sections never stored.
```

### V0-F5. Correction and re-issue flow

**Run after:** V0-14.  
**Attach:** `product/04-edges.md` (Liberar corrección), R-047 to R-049, E-31 to E-34.

```text
Write docs/flows/correction.md, make the code match, and add tests.

OPEN (R-047, step-up and motivo), one transaction: capture the prior text; the section's results move to EN_CORRECCION; a LIBERADO order moves to EN_CORRECCION; an INCOMPLETO order stays INCOMPLETO. Audit result.correct.open.

EDIT, CANCEL (R-048). Cancel restores the released text, with no new version. Audit result.correct.cancel.

RELEASE (R-049, step-up), one transaction:
1. Results return to LIBERADO as a new version. The prior version stays stored.
2. Procesado por becomes the releasing bioanalyst. The trail keeps both.
3. Recompute the order state.
4. Create the new issue with a printed snapshot and a new token. Mark the old issue REEMPLAZADO. The old file is never changed.
5. Create a resend task from earlier delivery rows.
6. Audit result.correct.release, report.superseded, delivery.resend.task.
If any step fails, none of them happen.

READS WHILE OPEN. Portal: En revisión, no grid. QR: En revisión. Delivery: refused on the server. Recepción: no values. Administración's audit view: clinical text masked. Prove each on the server.

CLIENT. Invalidate this order, results, worklist, deliveries, and issues.

TESTS. All of the above, a failure at step 4 rolling everything back, and the old token answering "Esta versión fue reemplazada".
```

### V0-F6. Issue, PDF, and delivery flow

**Run after:** V0-16.  
**Attach:** R-110 to R-115, E-38, `brand/08-data-lifecycle.md` (Delivery).

```text
Write docs/flows/issue-and-delivery.md, make the code match, and add tests.

GENERAR PDF. R-110, or R-111 for a watermarked draft. Build an issue snapshot from released lines only: the header as printed, Marca words, Procesado por, the RIF from the record, and the QR only if the setting is ACTIVO. IPdfRenderer → IFileStore, private. Store the issue row, with a token for a real issue. A draft gets no token and is not a valid issue. Audit report.issue, report.pdf.

The preview and the PDF read the same snapshot, so they can't disagree. A later rename, birth-date change, or new price doesn't change a stored issue.

SEND. Never hold a database transaction across a network call:
1. R-112 (LIBERADO), or R-114 after approval. The first call returns 428 with the destination for the confirm. A send during a correction is refused.
2. Transaction A: insert a delivery row, pending, with channel, destination, time, operator, order number, and the incomplete flag. Audit. Commit.
3. Sistema: sender reads the file for this one delivery (R-146), and calls IDeliveryPort outside any transaction.
4. Transaction B: write the result on that row (R-146). Audit delivery.whatsapp or delivery.email.
A failure stores the failure and leaves the order as it was: "El envío no salió. La orden sigue guardada."
A row left pending by a crash shows as unconfirmed. It's never reported as sent.

INCOMPLETE. R-113, Bioanalista with step-up, names the missing sections, and creates a ready-to-send item. Audit delivery.incomplete.approved. Then R-114.

RESEND. R-115 acts on a task created by the correction flow. Each resend is a new row. A row is never erased.

DATA LEAVING. WhatsApp: to Teléfono, plain text with the order number and laboratory name, plus either a link to Ingresar or, with recorded consent, the file. Correo: to Email, the same. Nothing else leaves. Facts for R-112, R-114, and R-115 include delivery_mode_allowed, computed on the server.

CLIENT. Invalidate deliveries and this order. The button disables during the send, and the toast states the result.

TESTS. An attachment with no consent is refused, and a link carries no token. A failed send, a crash after step 2, a send during a correction, Recepción approving, and a draft token that doesn't verify.
```

### V0-F7. Portal flow

**Run after:** V0-17.  
**Attach:** `product/04-edges.md` (Portal), R-140 to R-143, E-37 to E-42.

```text
Write docs/flows/portal.md, make the code match, and add tests.

SIGN-IN. POST /api/v1/portal/session:
1. Rate limit by address.
2. Zod. Any failure from here on gives the same response.
3. Compute a keyed hash of laboratory, type, and number, with the server-only secret. Check the failure window by hash and by address.
4. Find every non-deleted client with that cédula AND that Fecha de nac. Rows with a different birth date stay out, and are listed for staff review. Require at least one order and a phone on file. Inactive clients pass. Sin verificar has no cédula, so it can't match.
5. Failure: store the attempt with the hash and address, log a hash prefix only, write portal.login.failed, and return the one generic answer. Run comparable work on every path, so that timing doesn't reveal which check failed.
6. The response is the same whether or not they matched: "Si los datos coinciden, enviaremos un código al teléfono registrado." On a match, Sistema: sender (R-148) sends a six-digit code to the phone on file, stored hashed, lasting 10 minutes, single use, and cancelled by five wrong entries. Never email. Audit portal.code.sent and portal.code.failed.
7. Success, after the code: create a new session row holding those client ids, the display cédula, the name, and an expiry three hours ahead. Set a separate cookie that can't authenticate any staff route. Write portal.login. No password exists.

EACH REQUEST. Check expiry and 15 idle minutes, and reload the session's client ids, so a merge or soft delete takes effect at once. Relation client is computed on the server.

LIST. GET /api/v1/portal/visits → R-140 per row. Voided orders never appear. The DTO is built from an allow-list. With no released section: date and order number only, and the exam names are not selected from the database at all. Pending → Pendiente, Con resultado → released.

DETAIL. R-141 or R-142. Select only released sections' lines. EN_CORRECCION: En revisión, no grid. A foreign or unknown id, or an unreleased result: 404, "No disponible".

DOWNLOAD. Streams from IFileStore through decide(). Cache-Control: no-store. Audit portal.download with the order id. Money owed isn't read at all.

CLIENT. gcTime 0, no retries on 401, and Salir clears the cookie and cache. No analytics. No client storage.

TESTS. Every failure case gives a byte-identical response. Two rows with one cédula and different birth dates never share a session. A reused code, an expired code, and a sixth wrong entry all fail. Another client's id. A Pendiente response with no exam name anywhere in the JSON. A partial response with no unreleased line. Expiry and idle. A merged client losing a row at the next request. A portal cookie refused on every staff route.
```

### V0-F8. QR verification flow

**Run after:** V0-18.  
**Attach:** R-144, E-43 to E-45.

```text
Write docs/flows/verification.md, make the code match, and add tests.

Scanning opens /verificar/[token], a Server Component → server query → rate limit by address → look up the issue by token → R-144 with relation token.

The DTO has only: order number, laboratory name, report date, state word, and whether the issue was replaced. The page also always shows the fixed sentence that it doesn't confirm printed values.

VALUE CHECK, off by default. With the setting off, R-149 refuses, and the code field is absent. With it on, follow the attached rows: the file comes from IFileStore, never in the DTO, with no-store and verify.file.read. Select only those columns, so that nothing else can leak.

| Case | Answer |
| Current issue, LIBERADO | Liberado |
| INCOMPLETO | Incompleto |
| EN_CORRECCION | En revisión |
| Issue REEMPLAZADO | "Esta versión fue reemplazada" and the date |
| ANULADA, ABIERTA, unknown token, draft | "No disponible" |

Log every answer without the token's full value. No session and no cookie. noindex. Cache-Control: no-store, because state can change.

TESTS. Each row above. An order number in place of a token. Guessing many tokens gets rate limited. The page's response contains no name, cédula, phone, exam, or result.
```

### V0-F9. Money flow

**Run after:** V0-20.  
**Attach:** `product/03-processes.md`, `brand/08-data-lifecycle.md` (Invoice), R-060 to R-071, E-47 to E-50.

```text
Write docs/flows/money.md, make the code match, and add tests. Payments and documents are append-only: nothing is updated or deleted, except a factura's computed Abono and Resta.

ABONO. R-060, one transaction: insert a payment row with amount, instrument, the operator, and the workstation. Recompute Abono and Resta on the server. The factura stays open while Resta isn't zero. Audit payment.record.

REVERSAL. R-061. Facts same_day and $own come from the store. Insert a reversal row pointing at the original, and recompute. Audit payment.reverse.

DRAWER. Cierre de caja, R-062 or R-063, reads all of that user's unclosed payments, across workstations, and writes a close row with Total USD, Total Bs, the rate, and Resta still open. It marks payments as belonging to that close, and deletes nothing. Audit cash.close. A later payment goes to the next open period and keeps its real time. Reopen is R-064, audit cash.reopen. Cierre mensual, R-065, is a separate act, and doesn't run a daily close. Audit month.close.

FISCAL. Control N°: R-071, audit control.assign. A fiscal copy is refused while it's Pendiente, or while a line is SIN PRECIO. Notes: R-066, a new document with its own number, against one factura. Audit note.issue. Voiding with a payment requires a credit note. A number is never reused.

REPRINT. R-068 to R-070: read the stored document, add COPIA, allocate nothing. Audit document.reprint. The stored rate is shown.

All amounts are computed on the server with decimal arithmetic, in lib/server/domain. Rates are read from settings, and an empty rate computes 0,00.

CLIENT. Invalidate this factura, payments lists, and drawer queries. A toast for each action.

TESTS. Rounding with decimals. Reversing someone else's payment. A close leaving all payments stored. A payment after a close. A reprint keeping its number. Proof that no route updates or deletes a payment.
```

### V0-F10. Settings and price flow

**Run after:** V0-21.  
**Attach:** R-002 to R-004, R-085 to R-087, R-147, E-51, E-52.

```text
Write docs/flows/settings-and-prices.md, make the code match, and add tests.

READING. Shell chips read GET /api/v1/settings/current (R-002). Polling every 30 seconds and on window focus, so each desk's chip refreshes. The last good value stays visible during a refresh.

RATE. R-003: Recepción only when no rate exists today. Otherwise Administración. Insert a dated rate row, never overwriting. Audit rate.change. With no rate today, the chip reads SIN TASA, and priced actions are refused on the server too, not only disabled.

SWITCHES. R-004 with a confirm, audited as setting.qr.change or setting.saturday.change. R-147: the scheduler sets Saturday by calendar through IClock.

COPYING RULE. A value is read when a document is priced or saved, and copied onto it:
| Value | Copied onto | When | Later change affects saved? |
| Tasa BCV | order, factura | Guardar | No |
| Saturday flag | exam line | when priced | No |
| Price | exam line | Guardar | No |
| QR setting | issue | Generar PDF | No |
| Physician and convenio name | order | Guardar | No |
| Client name, cédula, age | issue snapshot | Generar PDF | No |

PRICES. R-086 writes price.change, with a confirm. R-087: the preview is computed on the server and writes nothing. Applying needs a step-up, in one transaction. Lista de precios reads R-085, and writes price.print only for Imprimir lista.

TESTS. A rate change never touches a saved order. A SIN TASA Guardar is refused by the server. Reception can't set a second rate for the same day.
```

### V0-F11. Merge and undo flow

**Run after:** V0-07.  
**Attach:** `product/04-edges.md` (Fusionar), R-019 to R-021, E-16 to E-19.

```text
Write docs/flows/merge.md, make the code match, and add tests.

REQUEST. R-019: Recepción creates a request row, and nothing else changes.

MERGE. R-020 with step-up, in one transaction:
1. Lock both clients. Refuse a missing client, a client with itself, and both_complete_and_different.
2. The retyped name must match the survivor, compared on the normalized key.
3. Write the map: each moved order id, its previous client id, and its previous copied name and cédula.
4. Move the orders, and copy the survivor's name and cédula onto them. Issues and their files don't change.
5. Soft-delete the source.
6. Audit patient.merge, naming both ids.

UNDO. R-021 with step-up and motivo. Cut portal access for both clients until it finishes. Restore from the map, in one transaction. Audit patient.unmerge.

PORTAL. Rights are rechecked on each request, so an open session sees the change at its next request, with no extra step.

TESTS. Each refusal. An undo restoring exact prior values. A stored issue that's byte-identical before and after. A portal session on the source client after a merge.
```

### V0-F12. Session, step-up, and audit flow

**Run after:** V0-24.  
**Attach:** `product/09-audit-log.md`, `product/06-access-control.md` (Accounts and sessions; How, when, where, and why), `access-control/README.md`.

```text
Write docs/flows/session-and-audit.md, make the code match, and add tests.

SIGN-IN. Rate limit → IStaffIdentityProvider.verifyPassword → 5 failures gives a 15-minute pause, with one generic message and session.enter.failed → a server session row plus an httpOnly, Secure, SameSite cookie → session.enter. A different user on this PC ends the previous session, and the browser runs clearClientState().

EACH REQUEST. Session valid, account active, roles reloaded from the store. A removed role or disabled user stops at once: BLOQUEADO, access.denied, and the menu refreshes.

IDLE LOCK. 10 minutes: session.lock. Re-entry by the same user returns to the same screen, and unsaved cell text stays in memory. Another person's sign-in clears it.

STEP-UP. A short-lived token, bound to the session and to the command. A failure writes step_up.failed. These failures are reported for immediate review.

AUDIT. Follow the attached audit log page. Every decision from every actor writes a row, in the Full, Summary, or Flood tier on that page: who, what, when, where, how, why, result, change. The table version and row id are included. If an audit row can't be written, the action doesn't happen. Refused rows store no cédula digits and no results.
- Append-only. In memory now, and enforced by database grants later.
- Hash chain: each row holds a hash of the prior row. Writers are serialized, so the chain can't fork. A verify routine reports the first broken row.
- Reads: R-130 for Administración, with clinical text and the motivo on clinical events masked, identity changes shown, and the view logged. R-131 for Bioanalista, clinical events only, using the list on the attached page.
- Retention isn't implemented. Nothing deletes audit rows.

TESTS. A role removed mid-session. Lockout. A user switch clearing the cache. Tampering detected. Administración's JSON holds no clinical text and no motivo on clinical events. A failed audit write leaves no change. A chip refresh adds to a daily count, and not a row. No route updates or deletes an audit row.
```
