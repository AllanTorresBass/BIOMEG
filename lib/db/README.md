# Database layer (Stage 6)

**Provider:** Hosted Neon (Gate B Received 06/11/2026).  
**Schema:** All BIOMEG tables live in PostgreSQL schema `biomeg` (avoids collisions with other apps on the same Neon database). The pool sets `search_path=biomeg,public`.  
**Rules:** Raw parameterized SQL in repositories. No ORM. `import "server-only"`.

| Path | Role |
|---|---|
| [client.ts](client.ts) | `pg` pool, `getClient()`, `withTransaction()`, `query()` |
| [migrations/001_init.sql](migrations/001_init.sql) | Initial schema (V0-25) — **review before apply** |
| [schema.mmd](schema.mmd) | Mermaid ER diagram |
| [memory/](memory/) | Live in-memory stores until V0-27 swaps modules |

## Apply (after human review)

```bash
# Uses DATABASE_URL from the environment (never commit secrets).
psql "$DATABASE_URL" -f lib/db/migrations/001_init.sql
psql "$DATABASE_URL" -f lib/db/migrations/002_superadmin_user.sql
```

Demo sign-in (memory, until V0-26): usuario `superadmin`, clave `Demo-2026-Lab`. Role is **Administración** (there is no separate SUPER_ADMIN role in the permission matrix).

Do not run this against a database that already holds real patient data. Gate C is still open.

## Assumptions called out in 001_init.sql

- Catalog tables exist as placeholders; G1 still invents section/analyte content until Gate C.
- IVA default **16%**, IGTF default **3%** (Gate B).
- `invoices.control_number` is nullable (`Pendiente` in UI).
- `price` null means `SIN PRECIO`; zero is a real price.
- Audit hash chain columns exist; insert-only DB role and triggers wait for V0-27 ops steps.
- Sex codes `M`/`F` match the prototype; null allowed.
