# Integration — email

**Architecture status:** Email is a published delivery channel. Everything about the mail system is unpublished.  
**Related:** [Result delivery](../modules/result-delivery.md), [WhatsApp](integration-whatsapp.md), workflow step [Deliver](../workflow/07-deliver.md)

A live session on 30 October 2026 is transcribed in [../session/README.md](../session/README.md). Its result preview has an ENVIAR CORREO button, not pressed. The invoice has an Email field. Mantenimiento has Registro de Correo, not opened.

## Contract, as published

| | |
|---|---|
| Direction | Laboratory system to the patient |
| Channel | Email (“Correo”), named beside WhatsApp in the security block of the services page |
| Automatic | The word “automático” is on the WhatsApp bullet, not repeated as its own sentence for email |
| Attachment or link | Not published |
| SMTP host, from-address, or provider | Not published |

Treat email as a second outbound channel that carries the same kind of result. Treat it as equally automatic only as an **inference**.

## Where it sits

Email can leave from the desktop client, from the same companion that sends WhatsApp, or from a mailbox the laboratory already owns. The vendor does not say. Architecturally it is the same boundary as WhatsApp: clinical content leaves the laboratory network.

```text
Report component  →  mail sender (unknown)  →  patient inbox
```

It should not be confused with the website contact address `labsicoexc@gmail.com` or the privacy address `solucionesinformaticasm22@gmail.com`. Those are the vendor’s mailboxes. They are not the laboratory’s result-delivery path.

## Data that crosses the boundary

| Leaves | Status |
|---|---|
| Patient email address | Required. Where it is stored is not published |
| Report body or file | Inferred |
| QR, if the report file contains it | Inferred from “all tests” carrying a QR |

Copying the ordering physician is **not published**.

## Failure and privacy

Same gap as WhatsApp: no published bounce handling. Email at least has a normal failure signal (a bounce). Whether SICOEXC reads bounces is unknown.

The website privacy notice does not describe result email.

## Open questions

1. Does email send on the same event as WhatsApp?
2. Who is the sender identity the patient sees?
3. Is the message a PDF attachment?
4. What happens on a bounce?
