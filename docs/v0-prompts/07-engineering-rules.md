# Engineering rules for BIOMEG

[Back to the catalog](README.md)

**Source:** The seven WebTrixPro rule files in `/Users/optec-123/Desktop/webtrixpro/rules/`, read in full on 1 November 2026.  
**Authority:** These rules govern how the code is organized. They never change what the application does. If a rule here differs from [../product/](../product/) on behavior, or from [../brand/](../brand/) on look, those pages win.  
**Status:** Documentation only. No code exists.

## 1. Where the rules had to change

Most rules apply as written. These 14 conflict with each other or with BIOMEG, so each has an adapted version.

| # | WebTrixPro rule | Problem | BIOMEG version | Decides |
|---|---|---|---|---|
| 1 | Export singletons from `services/index.ts` (Layered, Backend) | The Guidelines and Comprehensive files make exported singletons a P0 | A lazy DI container only. `services/index.ts` exports `container` and nothing else | Rules owner |
| 2 | Raw SQL in the route handler (Layered, Backend template) | The Backend file and Checklist also ask for a separate data layer and repositories. BIOMEG's state rules need one transaction across several tables | Route handlers hold no SQL. Parameterized SQL lives in repositories under `lib/db/` | Rules owner |
| 3 | Business logic in hooks (Layered) | The Comprehensive file puts it in services. In BIOMEG, a rule in the browser can be bypassed | Rules run on the server, in `lib/server/`. Hooks only coordinate UI state | Design |
| 4 | Service layer means browser API calls (Layered), and also business logic (Backend) | One name for two jobs | `lib/services/` is the browser's API client. `lib/server/` holds commands and domain rules | Design |
| 5 | `BaseService` gives every service list, get, create, update, delete | BIOMEG forbids some of these: no delete of a result, a payment, or an audit row. An inherited method that must throw breaks the Liskov rule | `BaseService` offers protected request helpers. Each service exposes only its named commands, such as `void()` or `release()` | Design |
| 6 | Auth0 for sessions | The portal has no password, so Auth0 can't serve it. Staff need the `/entrar` screen, the Clave card, a password re-entry dialog, and administrator resets, and may have no email. The deployment model is also unknown | BIOMEG's own sessions behind `IStaffIdentityProvider`, recorded in `product/06-access-control.md`, so Auth0 can replace it for staff | **Owner** |
| 7 | All views mobile-first, usable at 360px | The brand specifies dense desktop staff screens, with 36px rows and full-width grids | Portal and verification are mobile-first. Staff screens are desktop-first, stay usable at 360px, and tables scroll inside their own container with no page-level horizontal scroll | Brand wins |
| 8 | 44×44 touch targets | The brand sets a 36px row height | 44px on the portal and verification page, and on staff controls under `pointer: coarse`. 36px rows stay on desktop | Brand wins |
| 9 | Every create, update, delete shows a toast | A result saves each time the operator leaves a cell, so a toast per cell would bury the work. The Comprehensive file also lists when not to toast | Result cells show saved state in the cell, and toast only on failure. Validation stays inline. The portal sign-in error is inline only. Everything else toasts | Design |
| 10 | Persist preferences and filters in Zustand | Filters can hold a name or cédula | Zustand may persist only layout preferences. It never holds a clinical value, a client's identity, or a search term | Privacy |
| 11 | TanStack Query caches server data | The docs require no cached PDF on a shared device, and that nothing carries over between users | The cache lives in memory only, with no persister. It's cleared on sign-out and user switch. Portal queries use `gcTime: 0` | Privacy |
| 12 | Soft delete everywhere | Mostly stricter than BIOMEG, and compatible. `brand/08` says removing a line before release "deletes" it | Soft delete throughout. Audit rows are append-only, and a payment is reversed by a new row | Stricter rule kept |
| 13 | Screen fetches initial data, and all API calls pass through services | A Server Component calling its own API over HTTP is wasteful and loses the session context | Screens call guarded functions in `lib/server/queries/`, which use the same decision. Browser code uses services | Design |
| 14 | No local types, but also exported prop interfaces beside components | The rule files disagree | All types, including prop interfaces, live in `/types/[feature]/`. Components import them | Rules owner |

The rule text also says "Zand". This page reads that as Zustand.

**Not used:** React Native items (FlatList, `__DEV__`, Pressable, Keychain, certificate pinning, biometrics, dynamic font scaling) and the CMS-specific examples.

## 2. Layers

Dependencies point downward only.

```text
Browser
  Screen       app/(staff)/clientes/page.tsx        Composition, loading.tsx, error.tsx
  Component    components/clients/                  Props in, JSX out
  Hook         hooks/use-clients.ts                 TanStack Query, UI state, feedback
  Service      lib/services/clients/ClientService   Typed HTTP calls, through container
───────────── HTTP ─────────────
Server
  Endpoint     app/api/v1/clients/route.ts          Rate limit, session, Zod, decide, status code
  Command      lib/server/commands/clients/         One transaction, domain rules, audit
  Query        lib/server/queries/clients/          Guarded reads, scopes
  Domain       lib/server/domain/                   Pure rules: state, Marca, age, totals
  Data         lib/db/repositories/                 Parameterized SQL only
```

| Layer | Must not |
|---|---|
| Screen | Call `fetch`, or contain rules |
| Component | Fetch data, or import a service |
| Hook | Call `fetch`, make a permission decision, or decide a state |
| Service | Import UI, or import from `lib/server/` |
| Endpoint | Contain SQL or domain rules |
| Command, Query | Import from `components/`, `hooks/`, or `lib/services/` |
| Domain | Do any I/O |
| Data | Contain business rules, or concatenate strings into SQL |

**Server-only code:** Everything in `lib/server/`, `lib/auth/`, and `lib/db/` starts with `import "server-only"`.

**Cross-feature:** One feature uses another through its service in the browser, and through its command or query interface on the server. It never reaches into another feature's internals.

## 3. Folder structure

```text
app/
  (staff)/clientes/  ordenes/  hoja-de-trabajo/  ...   page.tsx, loading.tsx, error.tsx
  (portal)/portal/                                     own layout, no staff shell
  (public)/verificar/[token]/                          own layout, no links into the app
  entrar/
  api/v1/[feature]/route.ts
  tokens.css
components/
  ui/                 shadcn/ui primitives, restyled to tokens
  shared/             DataTable<T>, StatusChip, ConfirmDialog, StepUpDialog, ErrorBoundary
  [feature]/
hooks/                use-[feature].ts, use-global-error-handler.ts, use-action-toast.ts
stores/               Zustand: layout preferences only
lib/
  services/           base/BaseService.ts, [feature]/, container.ts, index.ts
  server/             commands/, queries/, domain/, ports/, container.ts
  auth/               table.ts, decide.ts, with-command.ts, session.ts
  db/                 connection.ts, repositories/, memory/, migrations/
  utils/              format.ts, errors.ts, cn.ts
  config/             env.ts, status.ts, settings.ts
  logger.ts  query-keys.ts  strings.ts
types/
  [feature]/          [feature].types.ts, [feature].schemas.ts, [feature].props.ts
  contracts/          Service, repository, and port interfaces
  api.types.ts        ApiError, EntityType, type guards
  index.ts
tests/                unit/, contract/, integration/, e2e/
docs/                 architecture.md, flows/, adr/, ENGINEERING_RULES.md
middleware.ts
.env.example
```

Page URLs are Spanish, because staff and clients see them. API feature names and code are English, as in `/api/v1/clients`.

## 4. Rules that apply as written

### TypeScript
- Strict mode, with no `any` and no `as any`. Use `unknown` plus a type guard. Use `catch (error: unknown)`, and `Record<string, unknown>`.
- Every component has an exported prop interface, with `className?` forwarded through `cn()` where it renders an element.
- Service methods and exported functions state their parameter and return types.
- Union types for constrained values, such as `OrderState`.
- Use `z.infer<typeof schema>` rather than writing a type twice.
- Type guards live in `types/api.types.ts`: `isHandledError`, `isHandledDuplicate`, `isHandledRateLimit`, plus BIOMEG's `isHandledConflict` and `isAccessRefused`.
- A new entity updates the `EntityType` union, `isValidEntityType()`, `use-action-toast.ts`, and `use-error-handler.ts`.

### Reuse
- Generic components in `components/shared/` take configuration, such as `DataTable<T>`. Feature files are thin wrappers.
- Date, money, and error helpers are in `lib/utils/` before a second copy appears.
- Files stay under about 300 lines. Past that, extract.

### State
| Kind of data | Tool |
|---|---|
| Server data | TanStack Query, with keys in `lib/query-keys.ts`, hierarchical: all, lists, details |
| Shared and persistent | Zustand, under rule 10 above |
| Shared within a feature | React Context |
| Local to a component | `useState` |

Never copy server data into a store. Every mutation calls `invalidateQueries` on success.

### Components and forms
- File order: imports, then hooks, then early returns for `isLoading`, `error`, and empty, then the main render.
- Forms use React Hook Form, `zodResolver`, and shadcn `FormField`. Schemas are shared with the server.
- `loading.tsx` mirrors the final layout, with no generic spinner. After first load, the last good values stay visible during a refresh, as the brand requires.
- Wrap the result grid, price matrix, and charts in `ErrorBoundary`.
- Use `next/image` for the logo.
- Virtualize long lists, such as the exam picker. Paginate every list endpoint. Debounce search.
- Effects clean up. Long requests use `AbortController`.
- Icon-only buttons have ARIA labels, and everything works from the keyboard.

### Backend
- No ORM: no Prisma, Drizzle, or TypeORM. Use `pg`, with `$1, $2` parameters and no string interpolation.
- Use the `getClient()` and `withTransaction()` helpers, never `pool.connect()` directly.
- Zod parses every request body at the endpoint.
- Rate limiting on every endpoint.
- `JSON.parse` always inside `try`.
- Status codes are explicit, with one JSON error shape. See section 5.
- New environment variables go in `.env.example` and in the validated `lib/config/env.ts`.

### Dependency inversion
- Consumers use `container.clientService`, or `serverContainer.deliveryPort`. `new SomeService()` outside a container is a P0.
- Constructors accept interfaces from `types/contracts/`.
- Memory and SQL repositories pass the same contract tests, so one replaces the other with no other change.

### Logging and errors
- No `console.*`. Use `logger` from `@/lib/logger`.
- **BIOMEG addition:** the logger redacts names, cédulas, phones, birth dates, emails, and result text. These never go to logs, toasts, URLs, or analytics.
- Errors pass through `handleCrudError` or `handleFetchError`, via `useGlobalErrorHandler`, which shows a `sonner` toast with Spanish text from `lib/strings.ts`.

## 5. API contract

Every error has this shape. `message` is Spanish and safe to display.

```json
{ "error": { "code": "STATE", "message": "...", "rowId": "R-046", "details": {} } }
```

| Answer | Status | Client handling |
|---|---|---|
| Created | 201 | Success toast, invalidate |
| Validation failed | 400 | Inline on the field, no toast |
| `SESSION` | 401 | Back to `/entrar`, or to Ingresar on the portal |
| `ROLE`, `BLOCKED`, `UNKNOWN_COMMAND` | 403 | `BLOQUEADO` with no values, menu refresh |
| `OWNERSHIP` | 403 for staff, 404 for the portal | Portal shows "No disponible" |
| Not found | 404 | "No disponible" on portal and verification |
| `STATE` | 409 | Toast with the reason, refetch |
| Version conflict | 409 | "guardada por [usuario] a las [hora]", reload |
| Duplicate | 409 | Offer the existing record |
| `STEP_UP`, `CONFIRM`, `MOTIVO_REQUIRED` | 428 | Open the dialog, then repeat the request |
| Rate limited | 429 | Generic message |
| Unexpected | 500 | Generic message, logged without personal data |

**Portal sign-in** returns the same status, body, and comparable timing for every failure.

**No personal data in URLs.** Searches by name or cédula use `POST /api/v1/clients/search`. Records use random UUIDs in the URL, not order numbers or cédulas.

## 6. Priorities

| Level | Means | BIOMEG triggers |
|---|---|---|
| **P0** | Blocks merge | `any`, `console.*`, `new Service()` outside a container, `fetch` in a screen, component, or hook. SQL interpolation, secrets in code. A silent failure. **A write or read of protected data without `decide()`. A scope applied only in the UI. A clinical value in a log, URL, or client storage. Result stored as a number. Unreleased data in a portal response. A hard delete. An update to an audit row. A hardcoded tax rate or RIF. A rule in `product/10-security-baseline.md` left out. A demo setting reachable in production. A dependency that nobody checked** |
| **P1** | Fix now, or track with a ticket | Duplication, types outside `/types/`, a missing state among empty, single, partial, error, no permission, missing memoization in a hot path |
| **P2** | When practical | Naming, UX polish, documentation gaps |
| **P3** | Optional | Minor cleanup |

Merge requires: P0 clear, P1 fixed or ticketed, and these commands clean.

```bash
grep -rn "console\." app components hooks lib stores --include="*.ts" --include="*.tsx" | grep -v "lib/logger"
grep -rnE ":\s*any\b|as any|<any>" app components hooks lib stores types --include="*.ts" --include="*.tsx"
grep -rnE "new [A-Z][A-Za-z]*(Service|Repository|Port)\(" app components hooks lib --include="*.ts" --include="*.tsx" | grep -v "container.ts"
grep -rn "fetch(" app components hooks --include="*.ts" --include="*.tsx" | grep -v "app/api"
grep -rnE "^(export )?(interface|type) " app components hooks lib stores --include="*.ts" --include="*.tsx"
pnpm ci:lint:fast
npx tsc --noEmit
pnpm test
pnpm build
```

The fifth search should return nothing. An inline type is a P1, unless it's only used for a local generic.

## 7. Tests

| Layer | Minimum |
|---|---|
| `lib/utils/`, `lib/server/domain/`, `lib/auth/decide.ts` | Unit tests, with the 30 cases in V0-03 |
| Repositories | One contract suite, run against memory and SQL |
| Commands | Integration tests, including refusals and rollback |
| Hooks | Integration tests with a test query client |
| Critical flows | End-to-end: Guardar an order, enter and release a result, correct it, portal sign-in and download, QR |

Test the refusal paths as well as the success path.

## 8. Review report

Use this shape for V0-A7, and for any human review.

```markdown
# Code review report
**Date:** DD/MM/YYYY  **Reviewer:**  **Scope:**

| Priority | Count | Status |
| P0 | 0 | Clear or Blocked |
| P1 | 0 | Clear or Action required |
| P2, P3 | 0 | Optional |

## P0
- `path/file.ts:42`: The rule broken, and the required fix.

## Recommendation
Approve, Request changes, or Block.
```
