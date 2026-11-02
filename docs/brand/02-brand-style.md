# Brand style

**Product:** BIOMEG Laboratorio Clínico  
**Palette and tokens:** [01-palette.md](01-palette.md), [tokens.css](tokens.css)

This page is how the mark, the type, and the words behave on screen and on the issued report. It is a design rule for the new application. The October session shows the laboratory name, the line LABORATORIO CLINICO, a RIF, and a QR on the result page. It does not show this layout system. See [../session/print-preview.md](../session/print-preview.md).

## Lockup

The logo file is the source artwork. The word **BIOMEG** is not retyped in the interface to imitate the letterforms. The O in the artwork carries four dots; a font cannot reproduce that.

The full lockup, left to right:

1. Circular emblem (helix, nodes, and a small gear-like form in navy and burgundy).
2. Wordmark **BIOMEG** in navy.
3. Under the wordmark, **LABORATORIO CLINICO** in burgundy, then the RIF in burgundy.

| Use | What is shown | Where |
|---|---|---|
| Full lockup | Emblem, wordmark, LABORATORIO CLINICO, RIF | Sign-in screen. Header of the issued report |
| Emblem alone | The circular mark at `--mark-size` (40px) | Shell bar, beside the text BIOMEG set in the UI font |
| Wordmark alone | — | Unused. The name without the emblem is reserved for body text (“BIOMEG”) |

Clear space around the full lockup is one quarter of the emblem diameter on every side. The lockup is not placed inside a card, a table cell, or a button. It is not recolored, outlined, or given a drop shadow. On the issued report the ground behind it is white.

The files for each of these uses were exported from the JPEG into [../../assets/brand/](../../assets/brand/). The full lockup is `logo-lockup.png` and `report-header.png`. The shell tile is `logo-emblem-on-white.png`. The browser tab uses `favicon.ico`, not the lockup. Sizes, channels, and the cases where the RIF line cannot be shown are in [09-logo-assets.md](09-logo-assets.md).

The shell bar is `--color-navy-deep`. On that bar the emblem sits on a white rounded square of 40px so the burgundy strokes remain visible. The UI then sets **BIOMEG** in white Source Sans 3 at `--font-size-wordmark`, with **LABORATORIO CLINICO** in a smaller white line under it. The RIF is not repeated in the shell. It is on the sign-in screen and on the issued report.

## Type

One family for every interface string and for the issued report’s text: **Source Sans 3**, then Segoe UI, then a generic sans. The logo artwork is the exception. It is an image.

| Role | Size | Weight | Features |
|---|---|---|---|
| Screen title | 20px (`--font-size-title`) | 600 | Normal figures |
| Card title and section heading | 16px | 600 | Normal figures |
| Body, table cell, input | 14px (`--font-size-body`) | 400 | Tabular figures for results, money, dates, order numbers, and rates |
| Column header | 12px (`--font-size-caption`) | 600 | Uppercase tracking is not used. Headers are the Spanish labels in title case |
| Caption and status chip | 12px | 600 | Tabular figures when the chip contains a rate |

Line height is 1.4 for body text and 1.3 for table cells. The smallest text on a work screen is 12px. A result value is never set smaller than 14px.

**Design rule.** Results, prices, totals, the BCV rate, invoice numbers, control numbers, and order numbers use `font-variant-numeric: tabular-nums`. Columns of amounts line up. The decimal mark in the new application is a comma, and the thousands separator is a period (`13.100`, `12,7`, `889,26`), matching the dominant shape in [../data-model/exam-and-result.md](../data-model/exam-and-result.md) and the shell rate in [../session/README.md](../session/README.md). Dates are `DD/MM/YYYY`.

## Voice and language

Staff screens, patient-facing delivery text, and the issued report are in Spanish. These brand documents stay in English and quote the Spanish labels, consistent with the rest of `docs/`.

| Kind of string | Form | Examples taken from the session, restyled |
|---|---|---|
| Command | Sentence case, verb first | Guardar, Nuevo, Cancelar, Salir, Generar PDF, Enviar WhatsApp, Enviar correo |
| Field label | The observed Spanish label, in title case when it was shouted | Factura N°, Control N°, Fecha de nac., C.I., Razón social |
| Status on a chip or printed flag | Capitals. A single word or short fixed label the operator can read aloud | `ACTIVO`, `INACTIVO`, `DISPONIBLE`, `NO DISP.`, `ALTO`, `BAJO`, `INCOMPLETO`, `LIBERADO`, `PENDIENTE` |
| Status in running text, a filter option, or a field value | Sentence case | Activo, Disponible, Pendiente, En revisión |
| Empty | What is missing, and the action that fills it | “Sin exámenes en esta orden.” |
| Error | What failed, and what remains stored | “El envío no salió. La orden sigue guardada.” |

The October program prints many commands in capitals (`NUEVO`, `GUARDAR`, `GENERAR PDF`). **Design rule.** The new application uses sentence case so a dense invoice stays readable. The feature catalog in [07-feature-catalog.md](07-feature-catalog.md) keeps the October command names so each item can be traced to the session.

Tone is clinical and short. A label names the fact. It does not coach (“¡Ingrese el paciente aquí!” is out). Confirmation is reserved for a similar client name, the retyped name in Fusionar, the same-day motivo, and the actions marked `C` or `S` in [../product/06-access-control.md](../product/06-access-control.md).

## Layout

| Measure | Value | Use |
|---|---|---|
| Base unit | 4px | Padding inside chips and icon gaps |
| Card padding | 16px | Patient header, billing identity, totals |
| Card radius | 8px | Cards only. Tables are square at the cell |
| Control radius | 4px | Inputs and buttons |
| Row height | 36px | Every data table |
| Shell height | 56px | Bar with emblem, user, rate, and flags |
| Page margin | 24px | Between the shell and the first card |
| Gap between cards | 16px | Vertical stack on an invoice or a result |

A work screen stacks in this order:

1. Shell.
2. Screen title and the primary action for that screen.
3. One patient header card, when the screen is about one visit.
4. The working table or result grid.
5. Totals or the release bar, pinned to the bottom of the card, not to the viewport, so a short form does not leave a floating total over empty space.

The content column maxes at 1200px on administrative lists and uses the full width on the result grid and the price matrix. Tables scroll inside the page. The column header sticks. The patient header card stays put above the scroll on invoice, result entry, and the issued-report preview.

## Print

The issued report is a separate pattern, specified in [04-display-patterns.md](04-display-patterns.md). It uses the same type family, the same decimal rules, and the full lockup. Screen chrome (shell, buttons other than the delivery actions, focus rings) is absent from the paper. Result flags print as the word `ALTO` or `BAJO` next to the value. The color fill is allowed on a color printer and is not required for the meaning.

Page footer of the clinical report carries the page count in the form the October viewer showed (`1 de 1`, while its paper printed `Page 1 of 1`) and the laboratory RIF. A product credit line is omitted unless the laboratory record explicitly stores one. The October BIOMEG preview is the layout to follow for the laboratory block. Older public PDFs that end with “Impreso por el Sistema de Control de Exámenes Clínicos (SICOEXC)” are other laboratories’ templates. See [../data-model/laboratory-and-template.md](../data-model/laboratory-and-template.md).

## What staff see of the brand in a day

| Moment | Brand elements on screen |
|---|---|
| Sign in | Full lockup, navy primary button Entrar |
| Shell, all day | Emblem, BIOMEG, user name, Tasa BCV, QR, Precio sábado |
| Invoice, worklist, registries | Navy titles, burgundy section rule, no logo image |
| Result value outside range | Text flag plus semantic fill |
| Preview and PDF | Full lockup, QR when the shell flag is Activo, result grid |
| WhatsApp and email | The message body is plain Spanish and includes the order number and the laboratory name as text. An attached PDF carries the lockup. A portal link carries no attachment |
