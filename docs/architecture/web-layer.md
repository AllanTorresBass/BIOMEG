# Web layer

**Architecture status:** The public website is an observed WordPress site. Any web application that serves laboratory results is unconfirmed.  
**Related:** [Client panel](../modules/client-panel.md), [Result delivery](../modules/result-delivery.md), [QR](integration-qr.md), [WhatsApp](integration-whatsapp.md), [Email](integration-email.md)

A live session on 30 October 2026 is transcribed in [../session/README.md](../session/README.md). Delivery appears there as buttons on the desktop preview, which fits desktop-only delivery and does not prove it.

Three different things are easy to collapse into “the web system.” They must stay separate.

| Piece | What it is | Confidence |
|---|---|---|
| labsicoexc.com | The vendor’s brochure, shop, and contact site | Observed. WordPress |
| Panel de clientes | A login page on that same site | Observed shell. Functions unknown |
| A service that sends WhatsApp, email, or resolves a QR | Required only if those features are not driven entirely from the desktop PC | Inferred |

## The brochure

Confirmed from the site itself on 29 October 2026:

- WordPress REST API at `/wp-json/wp/v2/pages`
- Pages for home, about, services, contact, privacy, a photo gallery, a checkout (`/pago/`), and the panel
- Privacy notice dated 21 April 2026, covering contact-form data and automatic collection of region, searches, and ads viewed
- ARCO requests by email, answered within 10 business days

That notice is about the website. It does not describe the clinical database. The checkout page shows test-mode labels. It is a marketing or plugin checkout, not the laboratory cashier in [billing](../modules/billing-and-payments.md).

Do not point a laboratory integration at this WordPress site and expect patient results.

## The panel

`/panel-de-clientes/` says “Inicia sesión en tu cuenta.” It does not say whether the account is a patient, a physician, or a laboratory that bought SICOEXC. Until that is known, the panel is not an architecture for result download.

The slug `/customer-cabinet/` is the LIS image gallery, not a customer application. Ignore the slug.

## The hypothesis of a second web tier

The CTO lists PHP, HTML, CSS, and JavaScript. Together with WhatsApp, email, and a QR, that suggests a small web tier beside the desktop client:

```text
Desktop client  →  store  →  optional web tier  →  WhatsApp / email / QR link
                         ↘
                           WordPress brochure (separate, observed)
```

This tier is **inferred**. Equally possible readings:

| Reading | What it implies |
|---|---|
| Desktop-only delivery | The Windows program talks to WhatsApp and SMTP directly. No clinical web app |
| Companion service | A process next to the database sends messages and may host the QR target |
| Patient portal | The panel login is that service. Not demonstrated |

Version 9.0’s new channels (WhatsApp, QR, Cashea) are the features most likely to live outside an old desktop core. That split is a hypothesis stated in the research dossier. It is not a published diagram.

## Trust boundary

| Inside the laboratory | On the public internet |
|---|---|
| Desktop client and clinical store | WordPress site |
| Staff accounts, if they exist | The panel login, whoever it is for |
| Analyzer links on the LAN | WhatsApp, email, Cashea, and any QR URL |

A QR that opens a public URL crosses this boundary. What that URL contains is [integration-qr.md](integration-qr.md). Putting the WordPress site and the clinical store on one database would put brochure traffic next to patient results. There is no evidence they share a database, and they should not be assumed to.

## Open questions

1. Is the panel a WordPress membership page or the front of the LIS?
2. Does any clinical service have a public hostname other than labsicoexc.com?
3. Does version 9.0 include a web application the laboratory installs, or only the desktop program plus vendor-operated sending?
4. Who operates the server that would receive a scanned QR?
