# Report engine

**Architecture status:** Inferred. Layout personalization and a QR on the report are published. The component that draws the page is not.  
**Related:** [Reports](../modules/reports.md), [QR](integration-qr.md), [Desktop client](desktop-client.md), workflow step [Report](../workflow/06-report.md)

A live session on 30 October 2026 is transcribed in [../session/README.md](../session/README.md). Its result preview has GENERAR PDF, so a PDF output is named. The button was not pressed. The preview's route, renderer, and file are still not shown.

## Evidence

| Point | Label |
|---|---|
| Report and result layouts can be adapted to the laboratory’s identity | Published |
| A QR code is placed on reports for every test | Published |
| WhatsApp delivery is described together with those QR reports, so some emitted form exists | Published |
| Printers appear in client photographs | Observed equipment in the room. Not a print subsystem |
| The CTO lists Crystal Reports | Published skill. **Not** a statement that SICOEXC uses Crystal Reports |

Crystal Reports is a common companion to an older Windows client and would explain per-laboratory layouts. It remains a hypothesis, same as Visual Basic. A later version could emit PDF from another library and only look like Crystal to the patient.

## Responsibility

The report component turns released clinical data into a document the laboratory is willing to hand out.

| It must do | Status |
|---|---|
| Apply a header and identity that differ by laboratory | Published as adaptable design |
| Place validated results on that layout | Inferred. Printing unvalidated rows would bypass [validation](../modules/validation.md) |
| Place a QR code | Published |
| Produce something WhatsApp or email can carry | Inferred. PDF, image, or HTML are all possible |
| Print on a local printer | Inferred from photographs of printers, not from a manual |

Statistical reports are a different output. They are not this component. See [statistical reports](../modules/statistical-reports.md).

## Where it sits

```text
Shared store  →  report component  →  paper printer
                       │
                       ├─→ file or image for WhatsApp and email
                       └─→ QR payload (see integration-qr.md)
```

The component may be a designer file shipped with the desktop client, a service on the same PC, or a server job. **Not published.** Who is allowed to change the layout — the laboratory or only the vendor — is also unpublished. The company’s line “nos adaptamos a la forma de trabajar” fits vendor-built layouts and does not prove a built-in designer.

## Boundary with fiscal printing

A SENIAT invoice and a clinical report are different documents. Homologated billing may use its own print path or fiscal device. Do not assume the clinical report engine is the fiscal engine. See [integration-fiscal.md](integration-fiscal.md).

## Open questions

1. What product or library renders version 9.0 reports?
2. Is the file from GENERAR PDF the one WhatsApp and email carry?
3. Can the laboratory edit the template, or only request a change?
4. Does a correction emit a new document, and does the old file remain?
