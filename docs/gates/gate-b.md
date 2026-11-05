# Gate B — before Stage 6 (real backend)

**Authority:** This page sets no rates, hosting choice, or legal conclusion. It records who must answer before Postgres, Argon2id, the audit hash chain, or any real patient-facing hardening starts.  
**Status:** **Closed.** Stage 6 (V0-25 through V0-28) must not begin until every row below has an answer from the named person.  
**Evidence label:** Each blank answer is **Unknown** until the named party fills it. Do not invent a rate, a hosting model, or a counsel conclusion to unblock code.

Cross-links: [build-plan Gate B](../build-plan.md#gate-b-before-phase-6), [v0 catalog gates](../v0-prompts/README.md#gates), [security baseline](../product/10-security-baseline.md#before-any-real-patient-record), [questions to send](gate-b-ask.md).

## Checklist

| Question | Who answers | Answer | Date |
|---|---|---|---|
| Deployment model (LAN, hosted, or mixed), and whether a hosted database fits health data | Laboratory, Venezuelan counsel | **Unknown** | |
| Health data rules that apply to BIOMEG: retention, minors, portal credential | Venezuelan counsel | **Unknown** | |
| IVA rate | Owner, accountant | **Unknown** (G2) | |
| IGTF rate | Owner, accountant | **Unknown** (G2) | |
| Rounding rules for money on the invoice | Owner, accountant | **Unknown** (G2) | |
| How Control N° is assigned | Owner, accountant | **Unknown** (G2) | |

## Collection status

| Party | Asked for | Status |
|---|---|---|
| Laboratory | Deployment model; whether a hosted database fits health data | **Waiting** — no answer recorded |
| Venezuelan counsel | Hosted-database fitness; health data, retention, minors, portal credential | **Waiting** — no answer recorded |
| Owner | IVA, IGTF, rounding, Control N° (with accountant) | **Waiting** — no answer recorded |
| Accountant | IVA, IGTF, rounding, Control N° (with owner) | **Waiting** — no answer recorded |

Do not fill the Answer column with a guess, a working value from the prototype, or a caption such as `0,00`. Stage 6 stays blocked while any row above is Waiting.

## How to close the gate

1. Collect the answers from the people in the table. Write them into the Answer column with the date. Keep rates and hosting as they were given; do not normalize them into a guess.
2. Update the Collection status table to **Received** with the same date.
3. Spread settled facts into the right product pages (`product/05`, `product/09`, `product/10`, tax captions) with the correct evidence label.
4. Only then open Stage 6 in catalog order: V0-25 schema, V0-26 Argon2id sessions, V0-27 memory-to-SQL and audit hash chain, V0-28 portal and file hardening.

## What stays blocked while this gate is closed

- Raw `pg`, migrations, insert-only audit account, hash chain, Summary/Flood tiers, outside copy
- Real Argon2id staff passwords and removal of the demo switcher / `/dev`
- Real WhatsApp, mail, analyzer, and fiscal providers (still fakes; provider choice is also G4 / Gate C)
- Any real patient record in a preview (Gate C)

## Stage 7 reminder

After Stage 6, run V0-29 to V0-32. G1 (catalog) and G3 (SICOEXC migration) stay open until Gate C. No real patient record enters a preview.
