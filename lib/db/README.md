# Database layer (Stage 6)

**Provider:** Hosted Neon (Gate B Received 06/11/2026).  
**Schema:** All BIOMEG tables live in PostgreSQL schema `biomeg` (avoids collisions with other apps on the same Neon database). Each transaction runs `SET LOCAL search_path TO biomeg, public`. The Neon pooler rejects that setting as a connection startup parameter.  
**Rules:** Raw parameterized SQL in repositories. No ORM. `import "server-only"`.

| Path | Role |
|---|---|
| [client.ts](client.ts) | `pg` pool, `getClient()`, `withTransaction()`, `query()` |
| [migrations/001_init.sql](migrations/001_init.sql) | Initial schema (V0-25) — **review before apply** |
| [migrations/003_staff_auth.sql](migrations/003_staff_auth.sql) | Lock, end, and password-change columns for staff sessions |
| [repositories/staff-auth.ts](repositories/staff-auth.ts) | Staff passwords, roles, and sessions |
| [schema.mmd](schema.mmd) | Mermaid ER diagram |
| [memory/](memory/) | Clinical stores stay in memory until V0-27 |

## Apply (after human review)

```bash
# Uses DATABASE_URL from the environment (never commit secrets).
psql "$DATABASE_URL" -f lib/db/migrations/001_init.sql
psql "$DATABASE_URL" -f lib/db/migrations/002_superadmin_user.sql
psql "$DATABASE_URL" -f lib/db/migrations/003_staff_auth.sql
node scripts/install-admin.mjs
```

Staff sign-in uses this database when `DATABASE_URL` is set. Passwords are Argon2id. Sessions live in `biomeg.staff_sessions`, so a Vercel function can read a sign-in that another function stored. The install script sets the `superadmin` password once, prints it, and requires a change on first entry. It does not print the password again if one is already stored. Role is **Administración** (there is no separate SUPER_ADMIN role).

Unit tests keep the in-memory accounts. A local server with `DATABASE_URL` does not: the printed demo password is not accepted there. Set `BIOMEG_AUTH=memory` to force the in-memory accounts, which is what the end-to-end runner does.

Do not run this against a database that already holds real patient data. Gate C is still open.

## Assumptions called out in 001_init.sql

- Catalog tables exist as placeholders; G1 still invents section/analyte content until Gate C.
- IVA default **16%**, IGTF default **3%** (Gate B).
- `invoices.control_number` is nullable (`Pendiente` in UI).
- `price` null means `SIN PRECIO`; zero is a real price.
- Audit hash chain columns exist; insert-only DB role and triggers wait for V0-27 ops steps.
- Sex codes `M`/`F` match the prototype; null allowed.
