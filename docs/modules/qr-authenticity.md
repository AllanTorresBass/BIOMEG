# QR authenticity

**Catalog:** “Códigos QR para seguridad.” The site says COVID-19 diagnostic tests were the initiative for this control, and the QR is now used for every test.  
**Release named by the vendor:** 9.0  
**Evidence:** [Published] on the services page.

The QR is the published security control on the patient-facing result. It is how the vendor says a recipient can trust that a report is authentic. It is not described as an electronic signature.

## Published behavior

- Reports carry a QR code.
- The purpose is security and authenticity.
- The practice began with COVID-19 tests.
- It now applies to all tests (“todas las pruebas”).
- The general product sentence joins “entrega vía WhatsApp con códigos QR,” so the QR travels with the result that is sent on WhatsApp.
- Email is a second delivery channel. The site does not repeat the QR sentence for email. A QR printed on the report would be present in both channels if both channels send the same report. That is **inferred**.

## What the QR is not, on the evidence available

| Idea | Status |
|---|---|
| A code the patient can scan to open a result | Common pattern. **Not published.** The destination URL, if any, is unknown |
| A code that only confirms a document number | Also possible. Not published |
| An electronic signature of the bioanalyst | **Not published.** Validation is a separate catalog item |
| A fiscal QR for SENIAT | **Not published.** Fiscal homologation is a billing claim. Do not merge it with the clinical QR |
| Limited to COVID-19 | **Contradicted** by the vendor. The site says the COVID use was the start, and all tests use it now |

The client-panel login could be where a scanned code lands. The panel page publishes only “Inicia sesión en tu cuenta.” A scan-to-login or scan-without-login flow is **not published**. See [client-panel.md](client-panel.md).

## Who uses it

| Actor | Use | Label |
|---|---|---|
| Patient or physician | Scans or looks at the code to trust the report | Inferred from “seguridad” |
| Laboratory | Issues the report that contains the code | Inferred |
| SICOEXC | Generates the code when the report is produced | Inferred |

No verification portal, mobile page, or “documento válido” screen is published.

## Place in the flow

The QR belongs to the issued [report](reports.md), after [validation](validation.md), and it is part of what [result delivery](result-delivery.md) sends. Generating a QR for a draft that can still change would weaken the authenticity claim. Whether the code is bound to a final document is **not published**.

## What the module must handle

**Inferred:**

| Concern | Why it is required |
|---|---|
| A unique value per issued report | Otherwise the code cannot identify one document |
| Something a phone can resolve or a person can compare | Otherwise the code is decoration |
| Stability after issue | An authenticity mark that changes with every reprint is not a control |
| Coverage of every test type | The vendor says all tests, not a COVID subset |

The payload (URL, document id, hash, patient id) is unknown. Storing a patient identifier inside an unscanned-public QR would be a privacy issue. The privacy notice on the website does not discuss QR payloads.

## Relationships

| Module | Link |
|---|---|
| [Reports](reports.md) | The document that carries the code |
| [Validation](validation.md) | Professional release. Different control |
| [Result delivery](result-delivery.md) | WhatsApp delivery is published together with the QR |
| [Client panel](client-panel.md) | Possible landing place. Unconfirmed |
| [Billing and payments](billing-and-payments.md) | Separate. A tax QR is not this feature |

## Open questions

1. What does a scan open, and is login required?
2. Does the code survive a corrected report, or is a new code issued?
3. Is the same QR on the printed page, the email, and the WhatsApp message?
4. Does the code expose patient identity to anyone who scans it?
