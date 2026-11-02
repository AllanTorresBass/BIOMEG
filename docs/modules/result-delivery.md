# Result delivery

**Catalog:** Automatic sending of exams to patients by WhatsApp. Email delivery, stated in the security section of the same page. The general description also says delivery via WhatsApp with QR codes.  
**Release named by the vendor:** 9.0  
**Evidence:** [Published] on the services page.

Delivery is how a finished result leaves the laboratory without paper. The vendor names two channels, WhatsApp and email, and describes WhatsApp as automatic.

## Published behavior

- Results are sent to the patient on WhatsApp.
- Results are sent by email (“WhatsApp o Correo”).
- WhatsApp sending is described as automatic (“envío automático de resultados”, “automatiza la entrega”).
- The WhatsApp message is associated with QR codes in the product summary.
- The comfort claim is that the patient receives the result on the phone or in the inbox.

Email is published as a channel. The word “automático” is attached to the WhatsApp bullet, not repeated as its own sentence for email. Treating email as equally automatic is **inferred**.

## What is not published

- Whether “automatic” means “as soon as validation finishes” or “when a user presses send, and the transport is automatic.”
- The WhatsApp product used: the official Business API, a linked phone session, or a gateway. Session-based sending has different uptime and policy risks than an official API. The vendor does not say which one version 9.0 uses.
- The address book: which phone number and which email are used, and whether they are captured at [admission](patient-admission.md).
- Consent. A clinical result on WhatsApp is personal data. No consent step is described.
- Message content: a PDF, a link, an image, or text in the chat.
- Failure, retry, and a log the receptionist can see.
- Whether the ordering physician receives a copy.
- Whether delivery waits for [validation](validation.md) and for payment in [billing](billing-and-payments.md).
- Online download as a third channel. A [client panel](client-panel.md) login exists. Download is not described. The research dossier lists “patient portal download” as not published.

## Who uses it

| Actor | Relationship | Label |
|---|---|---|
| Patient | Recipient named by the vendor | Published |
| Reception or secretary | Usually the people who confirm the phone number and resend | Inferred |
| Bioanalyst | Owns the moment the result becomes sendable, if send follows validation | Inferred |
| Physician | Named system user. Not named as a delivery recipient | Not published |

## Place in the flow

Delivery is the last operational step in the advertised path:

[admission](patient-admission.md) → [catalog](test-catalog.md) → [sample](quality-control.md) → [result](result-entry.md) or [analyzer](analyzer-connectivity.md) → [validation](validation.md) → [report](reports.md) with [QR](qr-authenticity.md) → **delivery**.

“Fast digital delivery” is a commercial summary of this module. Speed is not given as a measured time.

## What the module must handle

**Inferred:**

| Concern | Why it is required |
|---|---|
| A destination phone | WhatsApp cannot send without one |
| A destination email | The email channel needs an address |
| A payload | The report, a link, or both |
| A record that a send was attempted | [Traceability](exam-traceability.md) and support both need it. Not confirmed |
| A rule for when sending is allowed | Automatic sending without a rule will emit drafts |

## Relationships

| Module | Link |
|---|---|
| [Patient admission](patient-admission.md) | Likely source of phone and email. Not confirmed |
| [Validation](validation.md) | Should gate the send. Inferred |
| [Reports](reports.md) | The document being sent |
| [QR authenticity](qr-authenticity.md) | Published together with WhatsApp delivery |
| [Client panel](client-panel.md) | Possible additional channel. Unknown after login |
| [Billing and payments](billing-and-payments.md) | No published hold for unpaid visits |

## Open questions

1. What event triggers the automatic WhatsApp message?
2. Which WhatsApp integration is used, and in which countries does it operate?
3. Can staff resend, and can they see a failed send?
4. Is the physician copied?
5. Is there a download page behind the QR or the client panel?
