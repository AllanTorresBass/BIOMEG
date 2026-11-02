# Palette

**Product:** BIOMEG Laboratorio Clínico  
**Source file:** [IMG-20261021-WA0099.jpg](../../IMG-20261021-WA0099.jpg)  
**Machine-readable tokens:** [tokens.css](tokens.css)  
**Sampled:** 31 October 2026

The logo is three inks on white: navy for the word **BIOMEG**, burgundy for **LABORATORIO CLINICO**, the RIF line, and the emblem, and white for the ground. Interface colors start from those two inks. Semantic colors for high, low, and incomplete results are separate, so the brand burgundy is never the only sign that a value is abnormal.

Labels used in this folder are defined in [README.md](README.md).

## How the inks were sampled

The file is 1080×607. Near-white pixels were dropped. Remaining pixels were split by which channel dominated, then quantized. JPEG fringes (pale pink and pale blue halos) were left out of the brand inks.

| Ink | Where it sits in the logo | Sampled value | Token |
|---|---|---|---|
| Navy | Wordmark **BIOMEG**, and the blue strokes of the emblem | `#203860` | `--color-navy` |
| Burgundy | **LABORATORIO CLINICO**, **RIF V-241355540**, and the red strokes of the emblem | `#6C1834` | `--color-burgundy` |
| White | Ground of the lockup | `#FFFFFF` | `--color-white` |

`#203860` is the most frequent navy bin (red 32, green 56, blue 96). `#6C1834` is the most frequent dark burgundy bin (red 108, green 24, blue 52). A row-average through antialiased edges is lighter and is not the brand ink.

## Identity colors

| Token | Hex | Role |
|---|---|---|
| `--color-navy` | `#203860` | Primary. Shell wordmark, links, selected rows, focus ring, key actions |
| `--color-navy-deep` | `#16304F` | Pressed navy, shell bar |
| `--color-burgundy` | `#6C1834` | Accent. Section rules, the laboratory line under a title, the RIF on the issued report |
| `--color-burgundy-deep` | `#4E1226` | Pressed burgundy |
| `--color-white` | `#FFFFFF` | Card surface and text on navy or burgundy |

Navy on white is 11.69:1. Burgundy on white is 11.55:1. White on either ink clears the same ratios. Body text, table text, and button labels all pass WCAG 4.5:1.

## Surfaces, text, and lines

These neutrals are derived. They are not extra inks in the logo. They keep long tables readable without turning the screen into a poster.

| Token | Hex | Role | Contrast |
|---|---|---|---|
| `--surface-page` | `#F4F7FB` | Page behind cards | Navy on this surface is 10.88:1 |
| `--surface-card` | `#FFFFFF` | Cards, tables, the issued report | — |
| `--surface-sunken` | `#E8EEF5` | Table header band, sunken filters | Primary text stays above 4.5:1 |
| `--text-primary` | `#14243C` | Titles, values, money, results | 15.59:1 on white |
| `--text-secondary` | `#3E5168` | Captions, column hints, secondary meta | 8.13:1 on white, 7.57:1 on the page |
| `--border-default` | `#D5DEE8` | Card edge, row rule, input border | Structural, not a text color |
| `--focus-ring` | `#203860` | 2px ring on the focused control | The control keeps its text label as well |

A selected table row uses `--surface-navy-wash` (`#E8EEF5`) and a 3px navy bar on the leading edge. Selection is a bar plus the row’s text, so a grayscale print of a screen capture still shows which row was current.

## Semantic colors

The October result preview prints at least one result in red and has no flag column. A black-and-white copy can drop that signal. See [../session/print-preview.md](../session/print-preview.md) and [../session/gaps-and-edge-cases.md](../session/gaps-and-edge-cases.md).

**Design rule.** An in-range result uses `--text-primary` and no status color. A value outside the reference, an incomplete section, a blocked action, or a released validation uses the pair below **and** a Spanish text flag. Color is a second channel.

| State | Text token | Background | Text flag | Contrast of text on its background |
|---|---|---|---|---|
| High | `--flag-high` `#8A1C1C` | `#F8E8E8` | `ALTO` | 7.82:1 |
| Low | `--flag-low` `#0E4D62` | `#E6F3F6` | `BAJO` | 8.21:1 |
| Incomplete | `--flag-incomplete` `#7A4E00` | `#FFF6E0` | `INCOMPLETO` | 6.69:1 |
| Blocked | `--flag-blocked` `#3E4651` | `#EEF1F4` | `BLOQUEADO` | 8.42:1 |
| Released | `--flag-released` `#1F4B32` | `#E7F4EC` | `LIBERADO` | 8.79:1 |

High is a dedicated red, darker and browner than the brand burgundy, and it never replaces the word `ALTO`. Low is a teal, so it is not the wordmark navy and not “information blue.” Released green is for a validation state, and for the chip words Activo and Disponible. It is not painted onto an in-range analyte.

Qualitative results (`NEGATIVO`, `NORMAL`, `AMARILLO`, and similar words recorded in [../data-model/exam-and-result.md](../data-model/exam-and-result.md)) have no high/low color. When a qualitative line needs a flag, the flag word is the result’s own interpretation, and the row stays in primary text unless a bioanalyst has marked it.

## Where each ink is allowed

| Surface | Navy | Burgundy | Semantic |
|---|---|---|---|
| Shell bar | Bar and primary buttons. BIOMEG and **LABORATORIO CLINICO** are white on it | Only inside the emblem’s white tile, because it would not read on navy | QR and Saturday-price chips use text flags (`ACTIVO`, `INACTIVO`) |
| Work cards and tables | Titles, links, focus, selected row | A 2px rule under a section title | Row flags only |
| Issued report | Laboratory name **BIOMEG** | **LABORATORIO CLINICO** and the RIF | Result flags, including on paper |
| Charts in Estadísticas | Series 1 | Series 2 | A third series uses `--text-secondary`, then a documented hatch, because a third brand ink does not exist |

**Design rule.** Work screens use flat fills. Gradients, drop shadows larger than 1px, and full-bleed photography stay off the shell, the tables, and the issued report.

## RIF ink and the RIF value

The logo artwork prints **RIF V-241355540** in burgundy. The 30 October 2026 preview transcription records the laboratory RIF as `Y241355540`. See [../session/print-preview.md](../session/print-preview.md). Both observations stand. The running application prints the RIF stored on the laboratory record. The logo file is artwork, not a second live source for that number.
