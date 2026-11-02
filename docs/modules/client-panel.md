# Client panel

**Catalog:** The marketing site has a page titled “Panel” whose only published sentence is “Inicia sesión en tu cuenta.”  
**Evidence:** [Observed] page at [https://labsicoexc.com/panel-de-clientes/](https://labsicoexc.com/panel-de-clientes/). Functions after login are **not published**.

This is the weakest module in the catalog. It is included because the feature list’s digital-delivery story implies a place for the patient, and because the vendor operates a login page. It must not be described as a finished SICOEXC patient portal. That warning is about this vendor page. The BIOMEG portal is a design rule in [../product/02-client-flow.md](../product/02-client-flow.md).

## Published and observed behavior

- A page exists for a client to sign in.
- The instruction is “Inicia sesión en tu cuenta.”
- No fields, recovery flow, or post-login menu are published in the page text retrieved for this research.
- A separate page titled “Interfaz LIS de comunicación” uses the slug `customer-cabinet`. Despite that slug, its content is an image gallery about the instrument interface, not a customer cabinet. Do not merge that page into this module.

## What is easy to assume, and is not evidenced

| Assumption | Status |
|---|---|
| Patients download PDF results here | **Not published.** Delivery that is published is WhatsApp and email |
| Scanning the [QR](qr-authenticity.md) opens this panel | Not published |
| Physicians and companies have their own portals | Not published. Physicians are concurrent users of the laboratory system, which is a different statement |
| Online payment through the panel | A [payment page](https://labsicoexc.com/pago/) exists on the marketing site and shows checkout and test-mode labels. It is not described as the laboratory’s cashier. Do not document it as the billing module |
| Appointment booking | The home page has a “Reservar cita” line with the sales phone number. That is a contact prompt, not a scheduling module |

## Who it is for

“Tu cuenta” does not name the account holder. Candidates:

| Possible user | Why they might fit | Status |
|---|---|---|
| Patient | The delivery story is about the patient | Inferred |
| Laboratory client (the SICOEXC customer) | The page is on the vendor’s marketing site, so the account may be the laboratory, not the patient | Equally plausible. Not published |
| Physician | Physicians are product users. This login is on the public website | Not published |

Until the vendor says who the account belongs to, this module stays an observed login, not a patient portal.

## Place in the flow

If the account is a **patient** account, the panel would sit after [validation](validation.md) and beside [result delivery](result-delivery.md).  
If the account is a **laboratory** account, the panel is a vendor-support channel and is outside the clinical flow.

Both placements are **inferred**. Neither is confirmed.

## What would have to be true for this to be a result portal

These are requirements only if the unpublished assumption is later confirmed. They are not current product facts.

| Concern | Why it would be required |
|---|---|
| A credential issued at admission or delivery | The patient needs a way in |
| A list limited to that patient’s validated reports | Anything broader exposes another person’s results |
| A download or view of the same document WhatsApp sends | Otherwise there are two inconsistent results |
| Alignment with the QR | The authenticity control and the portal have to agree |

## Relationships

| Module | Link |
|---|---|
| [Result delivery](result-delivery.md) | The channels that are actually specified |
| [QR authenticity](qr-authenticity.md) | Possible entry point. Unconfirmed |
| [Patient admission](patient-admission.md) | Possible place a patient account is created. Unconfirmed |
| [Users and concurrent work](users-and-concurrent-work.md) | Staff roles. A different population from “tu cuenta,” unless the vendor says they are the same |

## Open questions

1. Who holds the account: the patient, the physician, or the laboratory that bought SICOEXC?
2. What screens appear after login?
3. Can a result be downloaded there?
4. How is the account created and recovered?
5. Is this panel part of version 9.0 of the LIS, or only a page on the WordPress marketing site?
