# Gate B — before Stage 6 (real backend)

**Authority:** This page records who answered before Postgres, Argon2id, the audit hash chain, or portal hardening starts. It does not replace counsel for Gate C / real patients.  
**Status:** **Received** — Stage 6 (V0-25 through V0-28) may begin. Real patient records still wait for Gate C.  
**Evidence label:** Answers below are **owner-confirmed** (06/11/2026) from the research working proposals and the hosted deployment choice. They are Design inputs for Stage 6, not Observed screen captures.

Cross-links: [build-plan Gate B](../build-plan.md#gate-b-before-phase-6), [v0 catalog gates](../v0-prompts/README.md#gates), [security baseline](../product/10-security-baseline.md#before-any-real-patient-record), [questions](gate-b-ask.md), [research brief](gate-b-research.md), [Gate C](gate-c.md).

## Checklist

| Question | Who answers | Answer | Date |
|---|---|---|---|
| Deployment model (LAN, hosted, or mixed), and whether a hosted database fits health data | Laboratory, Venezuelan counsel | **Hosted** PostgreSQL (Neon on Vercel Marketplace). Accepted for Stage 6 engineering. Counsel sign-off for production health data remains Gate C | 06/11/2026 |
| Health data rules that apply to BIOMEG: retention, minors, portal credential | Venezuelan counsel | **Partial for Stage 6:** no automatic deletion; portal OTP shape unchanged. Full counsel answers (retention years, minors, credential form) remain Gate C | 06/11/2026 |
| IVA rate | Owner, accountant | **16%** | 06/11/2026 |
| IGTF rate | Owner, accountant | **3%** on the foreign-currency payment amount when IGTF is collected; otherwise `0,00` | 06/11/2026 |
| Rounding rules for money on the invoice | Owner, accountant | Money to **two decimals**; round half-up when the third decimal is ≥ 5 | 06/11/2026 |
| How Control N° is assigned | Owner, accountant | Field stays **nullable** / shown as `Pendiente` until assigned. The app does not invent a printer Control N°. Fiscal emission medium (talonario / forma libre / máquina / digital) is still open under G4 / Gate C | 06/11/2026 |

## Collection status

| Party | Asked for | Status |
|---|---|---|
| Laboratory | Deployment model; whether a hosted database fits health data | **Received** — hosted Neon (06/11/2026) |
| Venezuelan counsel | Hosted-database fitness; health data, retention, minors, portal credential | **Partial** — Stage 6 may proceed; production counsel remains Gate C |
| Owner | IVA, IGTF, rounding, Control N° (with accountant) | **Received** (06/11/2026) |
| Accountant | IVA, IGTF, rounding, Control N° (with owner) | **Received** via owner confirmation of research proposals (06/11/2026) |

## How this gate was closed

1. Owner confirmed the [research brief](gate-b-research.md) working proposals and chose **hosted** deployment.
2. Answers were written into the checklist with the date.
3. Settled rates and hosting were spread into product pages with Design-rule labels.
4. Stage 6 opens in catalog order: V0-25 schema, V0-26 Argon2id, V0-27 SQL + audit hash chain, V0-28 portal hardening.

## What Gate B no longer blocks

- Raw `pg`, migrations, insert-only audit account, hash chain, Summary/Flood tiers, outside copy
- Real Argon2id staff passwords and removal of the demo switcher / `/dev`
- Hosted Neon as the Stage 6 database target

## What still waits (Gate C / G1 / G3 / G4)

- Real WhatsApp, mail, analyzer, and fiscal providers (G4)
- Exam catalog structure (G1)
- SICOEXC migration (G3)
- Any real patient record in a preview (Gate C) — see [gate-c.md](gate-c.md)
