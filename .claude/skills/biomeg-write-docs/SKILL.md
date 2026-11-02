---
name: biomeg-write-docs
description: Write or change BIOMEG documentation so it follows the project's standard. Use whenever someone asks to add, update, correct, or document a screen, feature, rule, field, process, edge case, or new information from the laboratory in this workspace, including new captures of screens or answers from the owner. For permission changes, use biomeg-access-rules as well.
---

# Write BIOMEG documentation

This workspace holds documentation only. If a request implies building software, stop and ask, because no application is being built at this moment.

The project has no version history, so an overwritten sentence can't be recovered. Before a large edit, make a dated backup archive beside the project folder.

## Steps

1. **Pick the layer.** Putting a fact in the wrong layer is the most damaging mistake, because design wishes then read as evidence.

   | The new information is | It goes in |
   |---|---|
   | What the current program showed on a captured screen | `docs/session/` |
   | What a printed report shows | `docs/data-model/` |
   | A vendor claim or public source | `docs/modules/`, `docs/workflow/`, `docs/architecture/`, or `docs/sicoexc-research.md` |
   | What the new application will do | `docs/product/` |
   | How it will look or be displayed | `docs/brand/` |
   | Who may do what | `docs/product/06-access-control.md` |

2. **Read before writing.** Read the target page, and `docs/brand/03-documentation-standard.md` for any screen or pattern note.

3. **Label each fact.**
   - `product/` and `brand/`: **Observed**, **Design rule**, or **Unknown**.
   - Evidence folders: **Published**, **Observed**, **Inferred**, or **Not published**.
   - A sentence carries one label. A table cell mixing two labels each part.

4. **Use the required shape.** A screen or pattern note has these sections, in order: Purpose, Actor, Record, Pattern, Fields or columns, States, Write, Audit, Evidence. A section that doesn't apply says why in one line. Copy this order from the standard, not from `docs/brand/04-display-patterns.md`, which doesn't fully follow it.

5. **Cover every state.** A data region needs empty, single item, partial, error, and no permission. Say what remains stored when an action fails.

6. **Use the exact formats.**

   | Fact | Format |
   |---|---|
   | Date | `DD/MM/YYYY` |
   | Result, money | `12,7` and `13.100` |
   | Order number | `0001` |
   | Cédula | `V-12.345.678` |
   | Missing Control N° | `Pendiente` |
   | Blank price, stored zero | `SIN PRECIO`, `0,00` |

   Write in English, and quote Spanish labels exactly as they appear, including cut-off ones.

7. **Spread the change.** Search for the command or field name across `docs/product/` and `docs/brand/`, and update every page that states the rule, including:
   - `docs/brand/07-feature-catalog.md`
   - `docs/brand/08-data-lifecycle.md`
   - `docs/product/04-edges.md`
   - `docs/product/05-data.md`
   - `docs/product/08-logical-data-model.md`

   Add a new page to its folder's README. A new widget name goes in `docs/brand/04-display-patterns.md` before a feature uses it.

8. **Check your work.** Every new link resolves, no new contradiction was created, and the labels are present. See the `biomeg-consistency-check` skill for a wider check.

## Rules that protect the record

- **No patient data.** Never copy a patient's name, document, age, or phone from a capture. Use shapes such as `V-12.345.678`. This applies to file names and URLs as well. Laboratory identity and field labels are allowed.
- **No invented fields.** An unopened form keeps its name, and its fields stay **Unknown**. A menu label is not a column name.
- **An unknown changes only with evidence.** It becomes Observed only when a captured screen shows it.
- **Evidence isn't rewritten to match a design.** If the new application differs from what was seen, change `product/` or `brand/`, and leave the evidence alone.
- **The analysis is a record.** Don't update sections 3 to 11 of `docs/access-control-plan.md` to match later rule changes.
- **A rule that replaces another is flagged.** Clinical choices go to the lead bioanalyst, and legal questions to Venezuelan counsel. Don't present them as settled.

## Example

**Input:** The lab sent a capture of Nuevo usuario showing Usuario, Clave, and Nivel.

**What to do:**
1. Record the form in `docs/session/mantenimiento.md`, labeled as opened, with the capture date.
2. Remove it from the unopened lists in `docs/session/gaps-and-edge-cases.md` and `docs/session/README.md`.
3. Update the catalog row in `docs/brand/07-feature-catalog.md`, changing those fields from **Unknown** to **Observed**.
4. Check whether "Not yet settled" in `docs/product/06-access-control.md` changes.
5. Keep any names on the capture out of the page.

## Report back

List the files changed, any rule that replaced an earlier one, and anything still waiting on a person.
