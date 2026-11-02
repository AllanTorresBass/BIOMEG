# Documentation standard

Every screen note, pattern, feature row, and data-lifecycle entry in this folder follows this page. The goal is that a later author can say how a fact is shown, when it is written, where it appears, and why it is kept, without inventing a field the October session never opened.

## Labels

| Label | Use it when |
|---|---|
| **Observed** | The fact was printed, or it was on a screen captured on 30 October 2026, or it is in the public-source dossier with that same label |
| **Design rule** | The new BIOMEG application will behave this way. The current program may differ |
| **Unknown** | A command or a slot is real, and the form, column, or payload was not captured. Name the gap. Leave the field list empty |

A sentence can carry one label. A table cell that mixes a captured label with a proposed widget says **Observed** for the label and **Design rule** for the widget.

Patient names, cédula numbers, ages, and telephone numbers from the preview stay out of this folder. Laboratory identity and field labels are in scope. That boundary is the one in [../data-model/README.md](../data-model/README.md) and [../session/README.md](../session/README.md).

## Required sections

A note that specifies a screen or a pattern uses these sections, in this order. A section that does not apply says why in one line (`Sort: the shell has no rows`).

1. **Purpose** — the job the screen finishes for the laboratory.
2. **Actor** — the role that opens it. Roles named by the vendor are receptionist, secretary, auxiliary or assistant, bioanalyst, and physician. See [../modules/users-and-concurrent-work.md](../modules/users-and-concurrent-work.md). The current program’s permission matrix is **Unknown**. The new application’s is [../product/06-access-control.md](../product/06-access-control.md).
3. **Record** — the thing on screen (patient, order, exam line, result, invoice, payment, registry row, report). Link to [../data-model/](../data-model/) when the record is already described.
4. **Pattern** — one of the patterns in [04-display-patterns.md](04-display-patterns.md).
5. **Fields or columns** — label, source, format, and whether the operator can edit it. Each row is **Observed**, **Design rule**, or **Unknown**.
6. **States** — empty, single item, partial, error, and no permission. Say what remains stored when the action fails.
7. **Write** — what is saved, the moment it is saved, and why (care, fiscal reprint, delivery, or traceability).
8. **Audit** — the event name written when the action succeeds. If the October Auditoría screen was not opened, the event list for that command is a **Design rule**, and the current program’s event list is **Unknown**.
9. **Evidence** — the session or data-model file this note depends on.

Feature-catalog rows are shorter. They use purpose, pattern, actor, and evidence, and they point at a full note when one exists. They still carry the three labels.

## How to describe a display

Write the screen from top to bottom, in the order the operator meets it.

| Step | What the sentence must answer |
|---|---|
| 1. Region | Shell, title, card, filter, table, or totals |
| 2. Content | The Spanish label and the value shape |
| 3. Source | Which record the value comes from |
| 4. Interaction | Read, edit, choose, or act |
| 5. Failure | What the region shows when the value is missing, stale, or refused |

A widget is named with the pattern vocabulary: header card, billing card, line table, result grid, price matrix, registry table, fiscal report, issued report, worklist, status chip, shell. New widget names get added to [04-display-patterns.md](04-display-patterns.md) before a feature uses them.

## Numbers, dates, and identifiers

| Fact | Display |
|---|---|
| Date | `DD/MM/YYYY` |
| Result and money | Comma decimal, period thousands, tabular figures |
| Order number | At least four digits, zero-padded, as in the observed `0001` and the four-digit shape on older public reports. See [../data-model/order.md](../data-model/order.md) |
| Invoice number and control number | Shown as stored. A missing control number reads `Pendiente`, which is a **Design rule** |
| BCV rate | The same figures as the shell, on every total that used that rate |
| Telephone | The stored string, including `+58` when that is how it was captured |
| Cédula | **Observed** on the October print as digits, with no `V-` or `E-` prefix in the data-model samples. **Design rule:** type (`V`, `E`, `J`, `P`, or `G`) plus 6 to 10 digits, displayed as `V-12.345.678`. Both empty, or both filled. A half pair is invalid. Empty is Sin verificar. See [../product/04-edges.md](../product/04-edges.md) |

## States that every data region implements

| State | What the operator sees |
|---|---|
| Empty | The region’s title, one sentence naming the missing fact, and the action that creates it, when this actor has that action |
| Single item | The same layout as many items. A one-row table keeps its header |
| Partial | A visible `INCOMPLETO` chip and a count of what is still open. Empty clinical sections are omitted |
| Error | The action that failed, the fact that is still stored, and a way to retry or leave |
| No permission | The server refuses the action, whatever the screen shows. The navigation item is absent. A direct route shows the screen title and `BLOQUEADO`, without the record’s values |

Loading is a **Design rule**: the last successful values stay on screen, dimmed, with the caption `Actualizando`. A spinner does not replace a table that already has rows.

## Privacy inside the documentation

Examples use shapes (`0001`, `DD/MM/YYYY`, `+58`, `ALTO`) and the laboratory’s own public identity from the logo and the preview (the name BIOMEG, the line LABORATORIO CLINICO, the RIF question in [01-palette.md](01-palette.md)). They do not use a patient’s name, document, age, or phone from the capture.

## Changing this standard

A new document in `docs/brand/` starts by linking here and using the labels. A new pattern is added to [04-display-patterns.md](04-display-patterns.md) with the nine sections above before [07-feature-catalog.md](07-feature-catalog.md) points at it. An unknown field becomes observed only when a captured screen shows it. Until then the catalog keeps the command and leaves the columns unknown.
