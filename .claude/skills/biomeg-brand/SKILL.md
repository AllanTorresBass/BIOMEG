---
name: biomeg-brand
description: Apply BIOMEG's visual identity and Spanish interface voice. Use whenever someone asks about BIOMEG colors, fonts, logo files, favicon, report header, email header, screen layout, display patterns, status chips, result flags, Spanish labels and messages, or needs a mockup, document, or slide that should look like BIOMEG.
---

# BIOMEG brand

Read the source page before using a value in final work, because these tables are a quick reference, and the pages win.

| Need | Source |
|---|---|
| Colors, and where each is allowed | `docs/brand/01-palette.md` |
| Exact tokens | `docs/brand/tokens.css` |
| Mark, type, voice, spacing, print | `docs/brand/02-brand-style.md` |
| Regions and states of a surface | `docs/brand/04-display-patterns.md` |
| Which pattern may show which fact | `docs/brand/05-data-display-models.md` |
| Logo files | `docs/brand/09-logo-assets.md`, `assets/brand/` |

## Colors

| Role | Value | Token |
|---|---|---|
| Primary: links, selected rows, focus, key actions | `#203860` | `--color-navy` |
| Shell bar, pressed navy | `#16304F` | `--color-navy-deep` |
| Accent: section rules, laboratory line, RIF | `#6C1834` | `--color-burgundy` |
| Page surface | `#F4F7FB` | `--surface-page` |
| Card surface | `#FFFFFF` | `--surface-card` |
| Primary text | `#14243C` | `--text-primary` |
| Secondary text | `#3E5168` | `--text-secondary` |
| Border | `#D5DEE8` | `--border-default` |

| Status word | Text | Background |
|---|---|---|
| `ALTO` | `#8A1C1C` | `#F8E8E8` |
| `BAJO` | `#0E4D62` | `#E6F3F6` |
| `INCOMPLETO` | `#7A4E00` | `#FFF6E0` |
| `BLOQUEADO` | `#3E4651` | `#EEF1F4` |
| `LIBERADO` | `#1F4B32` | `#E7F4EC` |

**The reasoning behind these:**
- Color is a second channel, so a status always has its word as well. People must be able to read it aloud, and it must survive black-and-white printing.
- A high result doesn't use burgundy, so an abnormal value never looks like the laboratory's name.
- An in-range result uses plain text, with no status color.
- Work screens use flat fills, with no gradients, shadows over 1px, or full-bleed photos.

## Type

Source Sans 3, then Segoe UI, then a generic sans.

| Use | Size and weight |
|---|---|
| Screen title | 20px, 600 |
| Card title | 16px, 600 |
| Body | 14px, 400 |
| Header, chip | 12px, 600 |

A result is never under 14px. Results, money, rates, and document numbers use tabular figures.

## Logo

| Use | File |
|---|---|
| Sign-in | `logo-lockup.png` |
| Report and email header | `report-header.png`, `email-header.png` |
| Shell, on a 40px white tile | `logo-emblem-on-white.png` |
| Browser tab | `favicon.ico`, `favicon-16.png`, `favicon-32.png`, `favicon-48.png` |
| Link preview | `og-image.png` |

Confirm the use in `docs/brand/09-logo-assets.md`.

**Rules:**
- `IMG-20261021-WA0099.jpg` is the only master. Don't redraw, recolor, outline, or shadow it, and don't make a vector from it.
- Clear space is one quarter of the emblem diameter.
- Don't place the logo inside a card, cell, or button.
- Don't retype BIOMEG to imitate the letterforms, and don't use the wordmark alone.
- Below 320px displayed width the RIF line isn't shown, so don't scale the lockup file that far.
- A larger print master has to come from the laboratory.

**Open question:** The logo prints RIF `V-241355540`, and the 30 October preview shows `Y241355540`. Don't state either as correct.

## Display patterns

Use one of these names, and don't invent a widget: Shell, Patient header card, Billing card, Line table, Result grid, Price matrix, Registry table, Fiscal report, Issued report, Worklist, Status chip. A new one must be added to `docs/brand/04-display-patterns.md` first.

Every data region defines empty, single item, partial, error, and no permission. For no permission, the navigation item is absent, and a direct route shows the title and `BLOQUEADO` with no values.

## Spanish voice

Staff screens, patient messages, and the issued report are in Spanish. The tone is clinical and short.

| Rule | Example |
|---|---|
| A label names the fact, and doesn't coach | Not "¡Ingrese el paciente aquí!" |
| Commands are sentence case and verb first | `Generar PDF` |
| Empty states name what's missing and the action | "Sin órdenes para esta fecha." |
| Errors say what failed and what remains stored | "Esta orden fue guardada por [usuario] a las [hora]." |
| Dates and numbers use the local format | `01/11/2026`, `13.100`, `12,7` |

Copy existing Spanish wording from the docs when it exists, and tell the user when you've written new wording, so that someone at the laboratory can check it.

## Capitals on status words

Chips and printed flags use capitals (`LIBERADO`). Running text, filter options, and field values use sentence case (Liberado). `docs/brand/04-display-patterns.md` is the source, and the owner still needs to confirm this.

## Limits

Mockups and documents are fine. Don't build the application, because this workspace is documentation only. Use no real patient data in a sample. Use shapes such as `V-12.345.678`.
