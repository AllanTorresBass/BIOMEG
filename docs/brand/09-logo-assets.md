# Logo assets

**Source artwork:** [IMG-20261021-WA0099.jpg](../../IMG-20261021-WA0099.jpg)  
**Files:** [../../assets/brand/](../../assets/brand/)  
**Where the lockup may appear:** [02-brand-style.md](02-brand-style.md)

The JPEG is the only master. **Observed:** 1080×607, about 21 KB, white ground, no transparency. The drawn lockup inside it is about 632×216 pixels. The emblem is the circle on the left. The wordmark, LABORATORIO CLINICO, and **RIF V-241355540** sit to the right.

**Design rule.** Every file in `assets/brand/` comes from one export of the JPEG, made with a temporary script that has since been removed because the project is documentation only. A size changes by replacing the JPEG and exporting the whole set again, following the steps below. A size is not painted by hand. An export is not accepted if the emblem crop is not square or if the lockup is not wider than the emblem, so a bad gap cannot put the wordmark into the favicon.

This pass does not redraw the mark and does not invent an SVG. A monochrome Safari pinned-tab icon is omitted: a one-ink trace of this JPEG would not match the navy and burgundy emblem.

## How a file is made

1. Near-white pixels become transparent. Pale JPEG halos (blue and pink fringes) are unmixed from white so the PNG does not show a box on the navy shell.
2. The ink is split at the empty columns between the emblem and the wordmark.
3. The emblem is centered in a square. The lockup keeps both parts and adds clear space of one quarter of the emblem side, the measure in [02-brand-style.md](02-brand-style.md).
4. White-backed copies flatten that transparency, for mail clients and for the shell tile.
5. Browser and home-screen icons are the emblem on white. The full lockup is never the tab icon.
6. The Open Graph canvas is 1200×630 white with the lockup placed at its native size. The lockup is not enlarged to fill the canvas.

The exported emblem master is 231×231. The lockup master, including clear space, is 744×327. At 300 dpi that height is about 1.1 inches. A larger print master has to be a new file from the laboratory. Scaling this JPEG up is not a substitute.

## Where each file is used

| File | Pixels | Why it exists | Where it is used | Who sees it |
|---|---|---|---|---|
| `logo-lockup.png` | 744×327, transparent | Full mark with clear space | Sign-in screen, any UI surface on a light ground | Staff, and the patient on a sign-in |
| `logo-lockup-on-white.png` | 744×327 | Same pixels on white | Source for the report and email headers | The export |
| `logo-emblem.png` | 231×231, transparent | The circle alone | Source for icons | The export |
| `logo-emblem-on-white.png` | 231×231 | Emblem on white | Shell bar, shown at 40px beside the UI words BIOMEG and LABORATORIO CLINICO | Staff, all day |
| `favicon.ico` | 16, 32, and 48 inside one file | Browser tab, including older clients that ask for `.ico` | `<link rel="icon" href="/favicon.ico">` | Anyone who opens the app |
| `favicon-16.png` | 16×16 | Tab icon | `<link rel="icon" type="image/png" sizes="16x16">` | Browser tab |
| `favicon-32.png` | 32×32 | Tab icon on high-density screens | `<link rel="icon" type="image/png" sizes="32x32">` | Browser tab |
| `favicon-48.png` | 48×48 | Windows shortcut and the largest ICO frame | Shortcut tile | Desktop shortcut |
| `apple-touch-icon.png` | 180×180 | Home screen on Apple devices. Opaque white, because iOS fills transparency with black | `<link rel="apple-touch-icon">` | A patient or a staff member who saves the app |
| `icon-192.png` | 192×192 | Installable app icon | [site.webmanifest](../../assets/brand/site.webmanifest) | Install prompt |
| `icon-512.png` | 512×512 | Larger install icon | The same manifest, `purpose: any` | Install splash |
| `icon-maskable-512.png` | 512×512 | Same mark inside the inner 80 percent, so a circle or squircle crop keeps the helix | Manifest, `purpose: maskable` | Android launcher |
| `mstile-150.png` | 150×150 | Windows tile | Pinned site tile | Windows |
| `og-image.png` | 1200×630 | Link preview | `og:image` and WhatsApp’s preview of a shared link | Someone who receives a link |
| `report-header.png` | 744×327 | Issued-report header at native size | PDF and print preview | Patient, physician, another laboratory |
| `email-header.png` | 744×327 | Mail header on white. Mail clients drop transparency | The message that carries a result | Patient inbox |
| `site.webmanifest` | — | Names the 192 and 512 icons, `theme_color` `#203860`, `background_color` `#FFFFFF` | `<link rel="manifest">` | The browser install path |

**When.** All of them, at once, in one export. A screen does not generate a logo at request time.

**Design rule for the shell.** The 40px tile uses `logo-emblem-on-white.png`. The words BIOMEG and LABORATORIO CLINICO next to it are Source Sans 3, not a second crop of the JPEG. The RIF is not repeated in the shell. It remains in the lockup pixels, which read `V-241355540`. The laboratory record is still the live fiscal RIF. See [01-palette.md](01-palette.md). The app does not set a second RIF in type on top of the image.

## Head markup

```html
<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16.png">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<meta property="og:image" content="/og-image.png">
<meta name="theme-color" content="#203860">
```

Paths are from the site root. The files in the repository live under `assets/brand/` until an app serves them.

## Edge cases

| Situation | What the set does |
|---|---|
| Tab size | The full lockup is illegible. Favicons and the shell use the emblem. Below a displayed lockup width of 320 pixels the RIF line is not shown, which means the lockup file is not scaled down that far |
| JPEG halo | Removed with the white ground before any crop is saved |
| 16-pixel icon | The emblem is centered with padding. Helix lines soften. The icon stays the emblem. It is not replaced with a letter B |
| 512 and maskable 512 | The canvas is larger than the 231-pixel emblem, so the mark is enlarged to fill the tile. It is softer than a vector master would be. The file still exists, because installers require 512. Sizes at 192 and below are reductions of the same emblem |
| Maskable crop | The emblem occupies the inner 80 percent. The outer band is white, the same ground as the shell tile |
| Navy shell | No recolored “dark logo.” The white emblem tile is the adaptation. Burgundy stays visible |
| Open Graph and the report | The lockup is native size on a white canvas. It is not stretched to 1200 pixels wide |
| Two RIF strings | The artwork pixels stay `V-241355540`. A different value on the laboratory record is printed as data beside the logo, not by editing the PNG |
| Transparency in email | `email-header.png` is flattened on white |
| Apple touch | Opaque white. A transparent touch icon would gain a black matte |
| Pinned-tab SVG | Not produced. Recorded here so a later vector master can add it without pretending this JPEG already supplied it |
| Stale tab icon | Browsers cache `favicon.ico` aggressively. After a regenerated file is deployed, the icon URL needs a cache-bust or a hard reload before the tab updates |
| Wordmark-only file | Not exported. [02-brand-style.md](02-brand-style.md) leaves the name without the emblem to body text |

## Checks on an export

An export records the emblem size, the lockup size, and the column gap it used. It is rejected when any expected file is missing or empty, when the emblem is not square, or when the lockup is not clearly wider than the emblem.
