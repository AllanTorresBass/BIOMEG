# Stage 7: Verification and repair

[Back to the catalog](README.md)

Run the audits after Stage 5 on the prototype, and again after Stage 6. Ask v0 to report before fixing, because its own report can be wrong: confirm each finding, and spot check anything it says passed.

## V0-29. State audit of every data region

**Attach:** `brand/04-display-patterns.md`.

```text
Audit only, no code changes yet. List every data region in the application in a table with columns: route, region, pattern, empty, single, partial, error, no permission. For each cell, write the exact Spanish text shown, or MISSING.

Compare to the attached pages. Quoted sentences must match exactly. Then list each mismatch and propose a fix. Wait for my approval.
```

## V0-30. Permission audit

**Attach:** `product/06-access-control.md`, `product/07-rule-reference.md`.

```text
Audit only. Build a table from the code, not from memory: every route handler and server query, the command it passes to withCommand or withQuery, and whether it can run without them.

Then:
1. Commands in the access table with no code path.
2. Code paths whose command is in no table row.
3. For each role, the menu it sees versus the matrix.
4. Places where the UI checks a condition but the server doesn't.
5. Every read that returns clinical values, and whether the scope applies on the server: status_only, clinical_text_masked, aggregates_only, released_sections_labeled_partial, date_and_number_until_released.

Also confirm: Administración can't read a clinical value through any route. Recepción can't read a value before LIBERADO or during a correction. Auxiliar can't release. Nobody can reach Trasladar paciente, Reversar relación, or Modificar valores.

Report and wait for my approval before changing anything.
```

## V0-31. Language, format, contrast audit

**Attach:** `brand/01-palette.md`, `brand/02-brand-style.md`, `brand/tokens.css`.

```text
Audit only, then wait for approval.

- Any English visible in the UI, including defaults from libraries: placeholders, table "No results", date pickers, validation messages, aria labels.
- Any date, number, or money not in the formats DD/MM/YYYY, 12,7, 13.100.
- Any amount, result, rate, or identifier without tabular figures. Any result under 14px.
- Any raw hex or Tailwind color outside the tokens.
- Any gradient, shadow over 1px, or status shown only through color.
- Any green or status color on an in-range result.
- Burgundy on a result flag, or anywhere the attached table doesn't allow it.
- Any logo redrawn, recolored, placed in a card, cell, or button, or shown under 320px wide with the RIF visible.
- Contrast under 4.5:1 on text.
- Keyboard: every control reachable, with the 2px navy focus ring and a visible label.

Also list every string under pendingReview, so that I can give the list to the laboratory.
```

## V0-32. Privacy and scope audit

**Attach:** nothing.

```text
Audit only, then wait for approval.

PRIVACY:
- Any seed or sample that doesn't look invented.
- Any log, error message, analytics call, or URL containing a cédula, a name, a phone, a birth date, or a result.
- Any client storage of clinical data.
- Any secret in client code, or with a NEXT_PUBLIC_ prefix.
- What the verification page and a Pendiente row return in the raw response.

SCOPE. Anything in the application that I didn't ask for: appointments, home collection, barcode, tubes, electronic signature, physician account, commissions, medical history, several sites, payroll. Any invented column on an unopened report or registry. Any invented dropdown option for Forma de pago. Any hardcoded tax rate, RIF, or Saturday formula. Any fiscal layout taken from general knowledge.

Report each with file and line. Do not print any personal data in the report.
```

## Repair prompts

Use these when a result drifts. Replace the bracketed text.

| ID | Use when | Prompt |
|---|---|---|
| R-A | v0 changed things you didn't ask for | `Revert the changes outside [area]. Change only [what]. List every file you touch before editing.` |
| R-B | A rule is wrong on a screen | `On [screen], this is wrong: [behavior]. The rule is: [paste the rule and page name]. Fix it on the server first, then the UI. Tell me which row in the access table applies.` |
| R-C | A button was hidden and the server wasn't changed | `Hiding [button] isn't a control. Add the check to the route through withCommand, then show me that a direct call as [role] is refused with [code].` |
| R-D | v0 invented columns or options | `[Field or column] is Unknown, and you invented it. Remove it from the UI, the data layer, and the seed. Use the sentence "Las columnas de este reporte no están capturadas." where the spec says so.` |
| R-E | The look drifted to a template | `Remove [gradient, card shadow, hero, or icon set]. Work screens are flat, dense, and clinical. Use only app/tokens.css. Show the table first.` |
| R-F | English appeared in the UI | `Replace all visible English on [screen] with Spanish, through lib/strings.ts. Add anything I didn't give you under pendingReview.` |
| R-G | The result was treated as a number | `Result is text. Revert any parseFloat on stored values. Marca alone may parse, and only on a single closed range with a non-blank sex.` |
| R-H | A section with no rows printed | `A section with no rows is omitted on screen and on paper. The chip reads INCOMPLETO and names it, like "Química sanguínea: sin resultados".` |
| R-I | Tipo de costo was mapped to a column | `Tipo de costo and Columna de precio are separate lists, with no default mapping. Remove the mapping. The operator chooses until a saved pair exists.` |
| R-J | A long chat loses the rules | `Before continuing, re-read the BIOMEG base rules docs/ENGINEERING_RULES.md, and lib/auth/table.ts, and state the five rules most relevant to [task].` |
| R-L | Code crossed a layer | `[File] breaks the layer rule: [what]. Move it to the layer named in docs/ENGINEERING_RULES.md, section 2. Add a lint rule or test so it can't return.` |
| R-M | An `any`, `console`, or local type appeared | `Remove every [any, console, or local type] in [area], with no suppressions. Use unknown and a guard from types/api.types.ts, logger, or /types/[feature]/.` |
| R-N | A flow document and the code differ | `docs/flows/[flow].md and the code differ on [what]. The spec is [page]. Fix the code to match the spec, update the document, and add a test.` |
| R-K | The app breaks after a step | `The last step broke [what]. Don't add features. Find the cause, show it to me, fix only that, and confirm that [earlier feature] still works.` |

Repair IDs start with `R-` plus a letter, so they stay distinct from the permission rows, which use a number (R-001).

## When a doc changes

The docs win over these prompts. When a rule changes in `product/` or `brand/`, or a capture fills an **Unknown**:

1. Update the prompt here that restates it, and search this folder for the same wording.
2. If the prompt already ran, use repair prompt R-B with the new rule.
3. Rerun V0-30 if the access table changed. Its version number also rises.
