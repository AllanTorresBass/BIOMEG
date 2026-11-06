# Gate C — before any real patient record

**Authority:** This page records what must be true before BIOMEG holds real patient data. It sets no clinical or legal conclusions by itself.  
**Status:** **Open.** Stages 6–7 may run on invented data. No real patient record enters a preview until every row below is Received.  
**Evidence label:** Blank answers are **Unknown**. Do not invent counsel, RIF, providers, or catalog structure.

Cross-links: [security baseline](../product/10-security-baseline.md#before-any-real-patient-record), [v0 catalog gates](../v0-prompts/README.md#gates), [build-plan Gate C](../build-plan.md#gate-c-before-any-real-patient-record), [questions to send](gate-c-ask.md), [Gate B](gate-b.md) (closed for Stage 6).

## Checklist

| Question | Who answers | Answer | Date |
|---|---|---|---|
| Security baseline + audit checks implemented (Stage 6–7 done) | Engineering | **Unknown** | |
| Counsel: health data, retention, minors, portal credential; hosted DB for production | Venezuelan counsel | **Unknown** | |
| Encryption at rest confirmed (database, report files, backups) | Laboratory, ops | **Unknown** | |
| Production only from a protected branch; v0 cannot publish production | Owner, ops | **Unknown** | |
| Backup restore tested; outage procedure completed and rehearsed | Owner, laboratory, accountant | **Unknown** | |
| Independent security review; critical and high findings closed | Owner | **Unknown** | |
| Lead bioanalyst Decisions in `product/06` confirmed | Lead bioanalyst | **Unknown** | |
| Correct RIF for print and screen | Laboratory | **Unknown** | |
| G1 — catalog structure (exam → analytes, sections, units) | Lead bioanalyst, laboratory | **Unknown** | |
| G3 — what migrates from SICOEXC (after backup examined) | Owner | **Unknown** | |
| G4 — providers: WhatsApp, correo, analyzer, fiscal medium, rate source, portal OTP | Laboratory | **Unknown** | |
| Portal one-time code working end-to-end (before portal opens to real clients) | Laboratory, engineering | **Unknown** | |

## Gaps folded into this gate

| Gap | Meaning | Closes when |
|---|---|---|
| **G1** | Result grid uses invented sections until the real catalog is defined | Captures + bioanalyst decision recorded above |
| **G3** | No migration page until a SICOEXC backup exists | Owner decision + migration page; pilot is Phase 8 |
| **G4** | Delivery, fiscal, rate, OTP stay behind fake ports | Laboratory chooses providers; adapters replace fakes |

## Collection status

| Party | Asked for | Status |
|---|---|---|
| Engineering | Stage 6–7 + audit checks | **Waiting** |
| Venezuelan counsel | Production health-data review | **Waiting** |
| Lead bioanalyst | Decisions table + G1 | **Waiting** |
| Laboratory | RIF, G4, captures, restore/outage help | **Waiting** |
| Owner | Security review, production branch, G3, outage targets | **Waiting** |
| Accountant | Paper fiscal steps in outage rehearsal | **Waiting** |

## How to close the gate

1. Send [gate-c-ask.md](gate-c-ask.md) to each party. Work in parallel with Stage 6–7.
2. Write each answer into the checklist with the date. Keep their wording.
3. Mark Collection **Received** when every row has an answer and engineering checks pass.
4. Only then allow real patient data in any environment. Then open Phase 8 (migration / pilot) per the build plan.

## What stays blocked while this gate is open

- Real patient names, cédulas, results, or files in any preview or production database
- Opening the portal to real clients
- Treating G1/G3/G4 as settled Design rules without the people above
