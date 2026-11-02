# Integration — WhatsApp

**Architecture status:** Outbound automatic delivery is published. The WhatsApp product and the trigger are not.  
**Related:** [Result delivery](../modules/result-delivery.md), workflow step [Deliver](../workflow/07-deliver.md), [Web layer](web-layer.md)

A live session on 30 October 2026 is transcribed in [../session/README.md](../session/README.md). Its result preview has an ENVIAR WhatsApp button, not pressed, and the workstation's taskbar shows WhatsApp installed. Neither proves which process sends. See [../session/print-preview.md](../session/print-preview.md).

## Contract, as published

| | |
|---|---|
| Direction | Laboratory system to the patient |
| Channel | WhatsApp |
| Behavior | Automatic sending of results |
| Companion control | QR codes are named in the same product sentence |
| Recipient | The patient |
| Provider, phone number, or API | Not published |

“Automático” means staff are not retyping the result into a personal chat. It does not say whether a validation event, a button, or a schedule starts the send.

## Where it can sit

| Placement | Fits the evidence | Risk if true |
|---|---|---|
| The desktop client opens WhatsApp on that PC | Fits a Windows program and needs no extra server | Tied to one phone session and to that PC being on |
| A small service next to the store calls the official WhatsApp Business API | Fits a version 9.0 add-on and the CTO’s web skills | Needs a hosted token and a template policy. Not described |
| A third-party gateway | Also fits an “integration” sentence | Another company holds the message. Not named |

All three are **inferred**. The official site never chooses one.

## Data that crosses the boundary

**Inferred**, because a message cannot be empty:

| Leaves the laboratory | Must already exist |
|---|---|
| Patient phone number | Captured somewhere, probably admission. Field not published |
| The report, a link, or both | [Report engine](report-engine.md) |
| The QR, if the code is inside the message | [integration-qr.md](integration-qr.md) |

Clinical content on a consumer messenger is personal data. No consent step, retention rule, or country restriction is published. The website privacy notice does not cover this send.

## Failure

A failed send must not look like a delivered result. No retry queue, status column, or receptionist alert is published. The result itself remains in the clinical store either way.

## Open questions

1. Business API, linked device, or gateway?
2. Does anything besides the ENVIAR WhatsApp button trigger the message?
3. Is the payload a PDF, an image, or a link?
4. Does the same integration work in Venezuela, Peru, and the other listed countries?
5. Can the laboratory see a failed delivery?
