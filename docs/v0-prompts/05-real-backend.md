# Stage 6: Real backend

[Back to the catalog](README.md)

**Stop first.** Don't start this stage until [Gate B](../gates/gate-b.md) is closed with answers from the laboratory, counsel, owner, and accountant. Collection is **Deferred by request**. Questions: [../gates/gate-b-ask.md](../gates/gate-b-ask.md). Public-web context only (does not close the gate): [../gates/gate-b-research.md](../gates/gate-b-research.md). Go-live conditions: [../product/10-security-baseline.md](../product/10-security-baseline.md#before-any-real-patient-record).

v0 lists [Neon, Supabase, Upstash, and Vercel Blob](https://v0.app/docs/databases) as integrations. The page doesn't describe a migration system or row-level security, so a developer should review this stage's schema and access code by hand. The catalog doesn't choose a provider. Do not treat a research figure (IVA 16%, IGTF 3%, and so on) as a settled setting.

Even after this stage, the application still uses invented data until gate C is passed.

## V0-25. Database schema, plan first

**Goal:** Turn on Plan Mode. Review the schema before anything runs.  
**Attach:** `product/08-logical-data-model.md`, `product/05-data.md`, `brand/08-data-lifecycle.md`, `data-model/README.md`.

```text
Do not run any SQL yet. Propose a PostgreSQL schema for the application, as a Mermaid diagram and raw SQL migration files in lib/db/migrations. No ORM.

IMPORTANT: The data-model page is an output model taken from printed reports. Its labels are not column names, and SICOEXC's schema is unknown. This schema is a new design. Don't describe it as the old program's.

MUST HOLD:
- clients: display name, normalized key, cédula type and digits, or both null. Partial unique index on type and digits where deleted_at is null. Birth date required. No age column as a source of truth. Sex is male, female, or null. Active flag and deleted_at. No hard delete. A version column.
- orders: client id, state (BORRADOR, ABIERTA, INCOMPLETO, LIBERADO, EN_CORRECCION, ANULADA), order number, convenio id plus printed name and any titular, copied BCV rate, Fecha muestra, Fecha reporte. Version column.
- order lines: tipo de costo AND price column as two separate fields, currency, price (null means SIN PRECIO, and zero is a real price), Saturday flag.
- results: TEXT value, unit text, reference TEXT, Marca, source (teclado or equipo), state, per-cell version. Sections. An analyzer's waiting value is stored separately from the value.
- issues: state VIGENTE or REEMPLAZADO, token, stored file, printed snapshot of the header.
- invoices, payments with workstation, reversals as new rows, notes pointing at one factura, closes, numbers that are never reused.
- deliveries: channel, destination, time, operator, incomplete flag, result. A second send is a new row.
- merges: a stored map of moved orders, for undo.
- users, roles (many to many), temporary grants with an end date, license number.
- portal_attempts: keyed hash and address only, no digits.
- audit_events: append-only, each row with a hash of the prior row, application accounts with no UPDATE or DELETE.
- settings: rate per day, QR, Saturday, discount limit, IVA, IGTF, RIF.

Use decimal types for money, never floats. Store UTC, and display in America/Caracas.

The attached logical data model lists every required field, and its Open questions. Ask me about each Open question instead of guessing.

List: every index, every constraint, and anything you assumed. Ask me about anything Unknown. Don't add columns for unopened forms.
```

**Check:** A person who knows databases reviews it. In particular:
- Result is text.
- `SIN PRECIO` differs from zero.
- The audit grants really prevent updates.

## V0-26. Real sessions and server enforcement

**Attach:** `product/10-security-baseline.md`, `access-control/README.md`, `product/07-rule-reference.md` (What the server must supply), E-01 to E-15, E-55 to E-61.

```text
Replace demo sessions with real authentication on the chosen database. Remove the demo role switcher entirely: delete components/dev/DemoRoleSwitcher.tsx and every reference to it, and the /dev routes.

- Implement IStaffIdentityProvider from V0-A5. Passwords hashed with Argon2id at 19 MiB, 2 iterations, parallelism 1 or stronger, as `product/10-security-baseline.md` specifies, along with its length, breach-list, second-factor, session, and lockout rules. Never logged and never returned.
- Server-side sessions in httpOnly, Secure, SameSite cookies. Rights are checked on every request, so a removed role or a disabled user stops at once.
- 5 failed staff sign-ins give a 15-minute pause, with one generic message.
- Step-up re-entry is verified on the server, and short-lived. The client can't claim it.
- Facts for decide() are loaded in the same transaction as the write. Confirm that the route scan test from V0-A4 still passes.
- First administrator: a one-time installation procedure that is then disabled, writing user.create with source instalación. No default credentials and no back-door. Document offline recovery for a sole administrator who forgets the password, witnessed and audited.

Secrets go in project environment variables, and never with a NEXT_PUBLIC_ prefix. Add security headers, and CSRF protection on every state-changing route handler.
```

**Check:**
- The switcher is gone, and `/dev` routes return 404.
- A direct call to any action without a session is refused.
- Search the code for `NEXT_PUBLIC_` and review each one.

## V0-27. Audit log and domain writes

**Attach:** `product/09-audit-log.md`, `product/06-access-control.md` (How, when, where, and why; Events to add), `brand/08-data-lifecycle.md` (Audit).

```text
Move every repository from memory to raw parameterized SQL in lib/db/repositories, one module at a time, using getClient() and withTransaction(). Keep the interfaces the same, and run the V0-A3 contract suite against each one. Start with clients, then orders, results, money, then the rest. Tell me which module you finished and stop after each one, so I can test it.

Multi-step writes are single transactions: Guardar an order, Liberar a batch, release a correction (new issue, old replaced, resend task), Fusionar, Deshacer fusión, Anular with its note.

AUDIT. Implement the audit store as the attached audit log page specifies, including its "Checks a build must pass": the hash chain, a dedicated insert-only account, triggers, a daily check, and the outside copy behind an interface. Ask me about each item under its Open questions. Write a verify routine that detects tampering. Note in the docs that this stops the application, not a database administrator or a restored backup, so the latest hash must also be kept elsewhere, and checked regularly.

Use the exact event names from the attached pages, across every command. Refused events store no cédula digits and no results. Retention is not implemented, because it waits for the legal review: delete nothing automatically.

Backup restore: an administrative procedure outside normal operation, writing backup.restore, and the log records the gap.

Build the review reports that use only plain thresholds, never machine learning: refusals by role and command, time from CARGADO to Liberar, corrections per bioanalyst and per exam, discounts and non-default price columns per user, same-user reversals, portal failures by address, step-up failures on Liberar, and Evolución and audit views per user. A monthly summary is available to the owner and the lead bioanalyst.

Replace the fake analyzer only when a protocol is provided. Leave it as a fake and tell me.
```

**Check:**
- Change a row by hand in a test database, and the verify routine flags it.
- Kill a transaction midway: nothing is half-written.

## V0-28. Portal, QR, and files hardening

**Attach:** `product/10-security-baseline.md`, `product/04-edges.md` (Portal), E-40 to E-45, E-59 to E-61.

```text
Harden the public surfaces against the real store.

- Keyed hash of laboratory, type, and number using a server-only secret. Log a prefix only.
- Rate limits by hash and by address, stored in the database or Redis, not in memory.
- Constant response shape and comparable timing for all portal failures.
- Verification tokens from a cryptographic random source, stored hashed if practical. Rate limit that route.
- PDF files live in private storage. Every download goes through a server route that runs decide(). No public URLs. Cache-Control: no-store.
- The sender can read only the file for one approved delivery.
- portal and verificar routes share no layout, session, or data access with staff routes. A portal session can't reach any staff action. Add tests that try.
- No client-side storage of clinical data, and no analytics on portal or verification pages.
- noindex on portal and verification pages.

List anything I should test by hand, and anything you couldn't verify from here. I will have this stage reviewed separately before real use.
```

**Check:** Get an independent security review before any real patient record. v0's code checks don't replace it, and [v0 itself treats generated code as potentially incorrect](https://v0.app/docs/security).
