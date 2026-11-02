---
name: biomeg-find-answer
description: Answer questions about the BIOMEG laboratory application or its current program (SICOEXC) from the right documentation page, with the correct evidence label. Use whenever someone asks what BIOMEG does, how a client, order, result, payment, or portal works, what SICOEXC showed, what a Spanish term means, where something is documented, or whether something is known, even if they don't mention the docs.
---

# Find an answer in the BIOMEG docs

The docs are split into layers that answer different questions, so a correct-sounding sentence from the wrong layer gives a wrong answer. Start from the question's type, not from a keyword search.

## Steps

1. **Classify the question** and open the matching page:

   | The question is about | Start at |
   |---|---|
   | What the new application does | `docs/product/README.md`, then the page it lists |
   | Who may do something | `docs/product/06-access-control.md` |
   | What is shown, stored, or refused on an edge | `docs/product/04-edges.md` |
   | When or why data is saved | `docs/product/05-data.md`, `docs/brand/08-data-lifecycle.md` |
   | Which records and fields the new application keeps | `docs/product/08-logical-data-model.md` |
   | What the audit log records, and how it's protected | `docs/product/09-audit-log.md` |
   | The security minimum, by OWASP category | `docs/product/10-security-baseline.md` |
   | What to do when the system is down | `docs/product/11-outage-procedure.md` |
   | A menu command | `docs/brand/07-feature-catalog.md` |
   | Color, type, layout, logo | `docs/brand/README.md` |
   | What the current program's screens showed | `docs/session/README.md` |
   | What a printed report contains | `docs/data-model/README.md` |
   | The laboratory's work steps | `docs/workflow/README.md` |
   | What the vendor claims | `docs/modules/README.md`, `docs/sicoexc-research.md` |
   | How the current program is built | `docs/architecture/README.md` |
   | Why an access rule exists | `docs/access-control-analysis.md` |
   | Orientation, or a Spanish term | `docs/workspace-guide.md` |

2. **Read the page itself.** Don't answer from the guide alone when the question depends on a rule, because the guide only summarizes.

3. **Separate old from new.** Say whether the answer describes the new BIOMEG application or the current SICOEXC program. These are often different on purpose.

4. **Keep the label.** Report how the fact is known:
   - In `product/` and `brand/`: **Observed**, **Design rule**, or **Unknown**.
   - In the evidence folders: **Published** (a vendor claim), **Observed**, **Inferred**, or **Not published**.

   "Observed" means different things in the two groups, so name the source when it matters.

5. **If pages disagree,** apply this order:
   - Behavior: `product/` over `brand/`. Access: `product/06-access-control.md`. Edges: `product/04-edges.md` over `product/02-client-flow.md`.
   - Look: `brand/`.
   - What was on a screen on 30 October 2026: `session/`.

   Mention the disagreement in the answer, because someone will want to fix it. `docs/workspace-guide.md` section 9 lists known ones.

6. **If it isn't documented, say so.** Many forms were never opened, and their fields are unknown. Name the gap, and don't guess a column, screen, or behavior.

## Answer format

- Lead with the direct answer.
- Cite the file and line, such as `docs/product/04-edges.md:68`.
- Add the label when the fact is not a settled design rule.
- Flag anything waiting on the owner, lead bioanalyst, or legal counsel.

## Example

**Question:** Can reception merge two clients?

**Answer:** No. Only Administración can merge, with a password re-entry and the surviving name retyped. Two complete, different cédulas are refused. Reception can only request a merge (`docs/product/06-access-control.md`, rows R-019 and R-020). This is a **design rule**. The current program's rule is **Unknown**.

## Limits

This workspace is documentation only, so never describe a rule as working software. Don't repeat patient details. If a page seems to contain them, say so without quoting them.
