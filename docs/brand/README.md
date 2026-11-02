# BIOMEG brand and interface

This folder is the visual and behavioral standard for the new BIOMEG application. It covers staff work, fiscal and inventory commands, and the patient result (print, PDF, WhatsApp, email, the portal, and QR). It does not implement the application.

The laboratory’s current system is documented as evidence under [../session/](../session/), [../data-model/](../data-model/), [../modules/](../modules/), [../workflow/](../workflow/), and [../architecture/](../architecture/). Those notes stay the record of what was seen. This folder says how the new application will show that work. What the application is, and how a client moves from Clientes through the portal, is [../product/README.md](../product/README.md).

When a design rule here disagrees with [../product/](../product/) about behavior, the product note wins. This folder wins for color, type, and layout. What was on screen follows [../session/](../session/).

## Labels

| Label | Meaning |
|---|---|
| **Observed** | Printed, or on a screen from 30 October 2026, or already labeled that way in the research notes |
| **Design rule** | How the new application will show or store the fact |
| **Unknown** | A real command or slot whose form, columns, or payload was not captured |

The rules for writing a further screen note are in [03-documentation-standard.md](03-documentation-standard.md). Patient names, cédulas, and telephone numbers from the preview are not copied into this folder.

## Documents

| Order | File | What it settles |
|---|---|---|
| 1 | [01-palette.md](01-palette.md) | Navy `#203860` and burgundy `#6C1834`, sampled from the logo, plus surfaces and semantic colors |
| 1 | [tokens.css](tokens.css) | The same values as custom properties |
| 2 | [02-brand-style.md](02-brand-style.md) | Lockup, Source Sans 3, Spanish voice, spacing, print |
| 3 | [03-documentation-standard.md](03-documentation-standard.md) | The sections every screen note uses |
| 4 | [04-display-patterns.md](04-display-patterns.md) | Shell, cards, line tables, result grid, price matrix, registries, fiscal reports, issued report |
| 5 | [05-data-display-models.md](05-data-display-models.md) | Which pattern may show which fact |
| 6 | [06-edge-cases.md](06-edge-cases.md) | Rules for the defects and splits in the October session |
| 7 | [07-feature-catalog.md](07-feature-catalog.md) | Every captured command, with its pattern |
| 8 | [08-data-lifecycle.md](08-data-lifecycle.md) | Why a record is kept, when it is written, where it appears, and who sees it |
| 9 | [09-logo-assets.md](09-logo-assets.md) | Every logo file in [../../assets/brand/](../../assets/brand/), and which screen or channel uses it |

## How the pieces fit

```text
Logo file
  ├─ palette and tokens
  ├─ logo assets (favicon, lockup, report, email)
  └─ brand style
        └─ display patterns (cards, tables, report)
              ├─ data display models
              ├─ edge cases
              ├─ feature catalog (all menus)
              └─ data lifecycle (how, when, where, why)
```

A feature row names a pattern. The pattern names the regions and the states (empty, single, partial, error, no permission). The display model names the fields that pattern may carry. The lifecycle names the write, the channel, and the reason. An edge case names the October defect that forced the rule.

## Source of the color

[IMG-20261021-WA0099.jpg](../../IMG-20261021-WA0099.jpg). The wordmark ink is navy. The line LABORATORIO CLINICO, the RIF line, and the emblem’s red strokes are burgundy. The ground is white. Semantic reds and teals for high and low results are not logo colors. They exist so an abnormal value is not painted with the same burgundy as the laboratory’s name.

## Reading order for an implementer

1. Tokens, brand style, and the logo files, before any screen.
2. Documentation standard, before adding a screen note.
3. Display patterns, for layout.
4. Edge cases, before copying a behavior from the current invoice or preview.
5. Feature catalog, to see which menu item uses which pattern.
6. Data lifecycle, before deciding what a save, a reprint, or a send stores.
