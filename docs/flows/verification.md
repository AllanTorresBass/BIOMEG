# QR verification flow

**Purpose:** How a scanned QR becomes an answer, as built by V0-18 and V0-F8.  
**Authority:** This page sets no rules. R-144, R-149, and E-43 to E-45 and E-63 in [../product/06-access-control.md](../product/06-access-control.md) win, along with [A06 in the security baseline](../product/10-security-baseline.md#a06-insecure-design).

## Scan

`/verificar/[token]` is a Server Component that calls `readVerification`:

1. Rate limit by address.
2. Look up the issue by the hash of the token.
3. Decide R-144 as `PUBLICO`, with the relation `token`.
4. Write `verify.read`. A refused row logs a hash prefix of the token, never the token.
5. Return a view with only the order number, laboratory name, report date, state word, and whether the issue was replaced.

| Case | Answer |
|---|---|
| Current issue, `LIBERADO` | Liberado |
| `INCOMPLETO` | Incompleto |
| `EN_CORRECCION` | En revisión |
| Issue `REEMPLAZADO` | "Esta versión fue reemplazada" and the date |
| Voided, `ABIERTA`, unknown token, over the rate limit | "No disponible" |

The page always shows the sentence that it doesn't confirm printed values. It has no staff shell, session, cookie, or link into the application.

## Value check

R-149 is off unless the deployment sets `BIOMEG_VALUE_CHECK=on`, so no screen can turn it on. It stays off until the owner, the lead bioanalyst, and counsel confirm it.

When it's on, a `LIBERADO` page has a field for Código de consulta, which posts to `/api/v1/verificar/[token]/informe`. The code is 12 random characters, unique to the issue, stored hashed, and never in the QR. The right code on a current issue within 90 days opens the original PDF with `no-store` and writes `verify.file.read`. Every other case returns to the page with "No disponible". Five wrong codes pause that token for 15 minutes, and the state page keeps working.

## Prototype limits

These wait for Stage 6 (V0-28):

- Rate limits and wrong-code counts live in memory, so each server instance counts separately.
- Issue records hold only hashes, but the plain token and code stay in a separate in-memory map, so the preview can redraw them before a PDF is kept.
- The PDF comes from the report store, because the `IFileStore` port from V0-A5 doesn't exist yet.
