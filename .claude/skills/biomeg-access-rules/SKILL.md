---
name: biomeg-access-rules
description: Read, explain, or change BIOMEG's role and permission rules. Use whenever someone asks who can do something, wants to allow or forbid an action for a role, add a command or role, change a confirm, password re-entry, or motivo requirement, or asks about Recepción, Auxiliar, Bioanalista, Administración, Cliente, portal access, audit events, or an access edge case.
---

# BIOMEG access rules

These rules are a specification. No application or automatic test enforces them, so a mistake stays in place until a person notices it. That's why changes follow these steps carefully.

## Where the rules live

| File | Holds | Use |
|---|---|---|
| `docs/product/09-audit-log.md` | Audit fields, events, protection, and review. Update it when an event changes | Follows the rule page |
| `docs/product/06-access-control.md` | Roles, decisions, states, permission matrix, edge cases E-01 to E-63, audit events | **The rule. It wins** |
| `docs/product/07-rule-reference.md` | How a decision reads the table, and each row's commands and conditions | Detail behind each row ID |
| `docs/access-control-analysis.md` | Findings F1 to F34, bottlenecks, status | Summary of why |
| `docs/access-control-plan.md` | The original analysis | A record. Sections 3 to 11 don't change |

## Answering "who can do X?"

1. Find the row in the matrix in `docs/product/06-access-control.md`.
2. Read the key: `●` allowed, `C` confirm, `S` password re-entry, `R` read only, `—` refused. `+ motivo` also requires a typed reason.
3. Check `docs/product/07-rule-reference.md` for the row's conditions, because one command can have several rows.
4. Check the Edge cases and Decisions sections for exceptions, and say if a decision still needs confirmation.
5. Cite the row ID in the answer.

## Changing a rule

1. **Check the protections below.** If the change breaks one, name the risk and get the owner's explicit decision before editing.
2. **Edit the matrix row** by hand in `docs/product/06-access-control.md`. A new row needs a new unused ID.
3. **Update the conditions** in `docs/product/07-rule-reference.md` if they changed. Rows are read in order, and the first match applies, so place a new row so that it isn't hidden by an earlier one.
4. **Raise the table version** in the header of `docs/product/06-access-control.md`.
5. **Record it.** If it replaces an earlier rule, add it to Decisions, with who must confirm it. Add or adjust an edge case and audit event if needed.
6. **Spread the change.** Search for the command's name, then update every match in:
   - `docs/brand/07-feature-catalog.md`
   - `docs/brand/08-data-lifecycle.md`
   - `docs/brand/04-display-patterns.md`
   - `docs/brand/06-edge-cases.md`
   - `docs/product/01-application-type.md` through `docs/product/05-data.md`
   - `docs/access-control-analysis.md`, including its row counts if they changed
7. **Leave alone:** `docs/access-control-plan.md` sections 3 to 11, and all evidence folders.

## Protections to keep

Each of these closes a real risk found in the analysis.

| Protection | Risk if removed |
|---|---|
| Only Bioanalista releases or corrects a result, with a password re-entry | Someone else's release prints under a bioanalyst's name |
| No unreleased value reaches reception, the portal, QR, or a sender. The QR's optional value check stays off until confirmed | Patients or staff act on unvalidated results |
| Releasing a correction replaces the issue and creates a resend task | Patients keep acting on a wrong result |
| Administración sees no clinical values, and Bioanalista is granted only through R-126 | Non-clinical staff read patient results |
| Only Administración merges, and two different complete cédulas are refused | One person's results appear in another's portal |
| A client sees only their own orders, in rows matching both cédula and Fecha de nac., after a one-time code | Exposure of clinical results |
| Client, public, and system sessions never hold staff rights | The portal becomes a route to staff actions |
| At least one active administrator always exists, with no self-administration | Lockout, or unchecked self-granting |
| Refuse when a command isn't listed or a fact is missing | A gap silently opens access |
| Rights are checked on the server at every request | A hidden button is mistaken for a control |
| Every decision is logged, including refusals, in an append-only log. Only routine reads with no patient data are summarized | Misuse can't be seen or proved |

## Who decides

| Kind of change | Decided by |
|---|---|
| Release, validation, or clinical entry | Lead bioanalyst |
| Discount limit, money, business policy | Owner |
| Health data, retention, minors, portal credential | Venezuelan counsel |

"Apply the recommendation" doesn't count as these confirmations. Keep the "Still needs" column accurate.

## Example

**Input:** Let reception reprint credit notes.

**What to do:**
1. The row is R-070, Re-imprimir notas, retenciones, currently Administración only.
2. It covers two commands, so splitting it needs a new row and ID for one of them.
3. No protection is broken, and it's a business policy, so the owner decides.
4. Edit both pages, raise the version, and update `docs/brand/07-feature-catalog.md`.
5. Report the changed rule, and mention that reprints stay marked `COPIA` and audited.

## Report back

State the row IDs changed, the old and new behavior, the table version, other pages updated, and who still needs to confirm.
