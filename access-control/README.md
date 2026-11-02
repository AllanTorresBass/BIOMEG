# Access-control data

This repository holds documentation only, and no application is being built. The permission table, state machines, and starting settings are written out in the pages below.

| If you need | Read |
|---|---|
| The rules | [docs/product/06-access-control.md](../docs/product/06-access-control.md) |
| Each row's command names and conditions | [docs/product/07-rule-reference.md](../docs/product/07-rule-reference.md) |
| The analysis summary | [docs/access-control-analysis.md](../docs/access-control-analysis.md) |

## What a future application must supply

These are the inputs each permission decision relies on:

- The person's identity and roles come from the server session, never from the request.
- The facts a rule reads, such as `state` or `has_payment`, are loaded from the database. A missing fact refuses. A fact must be a real boolean, so `1` does not count as `true`.
- Ownership is compared by the decision itself. It cannot be passed in.
- Evidence, such as a password re-entry, holds only what the server verified.
- A read-only grant never runs an action.
- `scope` on a decision is a duty for the feature that uses it: `status_only`, `clinical_text_masked`, `aggregates_only`, `released_sections_labeled_partial`, or `date_and_number_until_released`.
- An action runs only when the decision says it can. Every answer is logged, including refusals. Routine reads with no patient data are summarized, as `docs/product/06-access-control.md` records under Decisions. If the log can't be written, the action doesn't run.

## What the permission decision does not cover

Passwords, sessions, lockout, temporary grants, last-administrator counting, and the keyed-hash secret belong to the identity layer. Masking, the resend task, and the merge map belong to the features that use them. The audit protection stops the application, not a database administrator or a restored backup, so the hash chain must be checked regularly and its latest hash kept somewhere else.
