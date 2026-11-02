# Step 6 — Report

**Workflow status:** Inferred. The vendor publishes adaptable report layouts and QR codes on every test. It does not publish when the document is generated.  
**Modules:** [Reports](../modules/reports.md), [QR authenticity](../modules/qr-authenticity.md)  
**Previous:** [Validate](05-validate.md)  
**Next:** [Deliver](07-deliver.md)

**Named command:** Imprimir por Paciente and Imprimir Prueba Individual. The opened preview is a BIOMEG page with a QR and at least one result in red. See [../session/print-preview.md](../session/print-preview.md).

## Purpose

Produce the document the patient or physician receives: the laboratory’s identity, the released results, and a QR code.

## When it starts and ends

| | |
|---|---|
| Starts | At least one result is validated. Whether the whole visit must be validated is not published |
| Ends | A report exists that step 7 can send and a person can scan |
| Reprint | Not published. Patients often ask for another copy. A second issue that changes the QR would weaken authenticity |

## Published behavior used here

- Report design can be adapted to the laboratory’s identity.
- Formats are adaptable (“formatos de reportes adaptables”).
- QR codes are a security control. They began with COVID-19 tests and now apply to all tests.
- The product sentence “entrega vía WhatsApp con códigos QR” puts the QR on the same output that delivery sends.
- File type is **not published**. PDF is the usual file for this sentence and is only **inferred**.

Client photos show printers in laboratories. In public material, printing is **observed** only as equipment in the room. The session names Imprimir por Paciente and Imprimir Prueba Individual, neither followed by clicking. The CTO’s résumé lists Crystal Reports. That is not a product fact. Do not treat Crystal as the engine of this step.

## Actors

| Role | Part in this step | Label |
|---|---|---|
| Bioanalyst | Owns the clinical content that was validated | Inferred |
| Reception or secretary | Often prints or hands over the paper copy | Inferred |
| Vendor implementer | Adapts the layout to the laboratory. Whether day-to-day users can edit the template is unknown | Inferred |
| Patient | Does not design the report. Receives it in step 7 | Published as the recipient of results |

## What happens

1. The system assembles patient and visit data, released results, and the laboratory’s layout. **Inferred** from identity plus results.
2. It places a QR code that covers every test, not a COVID-only subset. **Published.**
3. It emits a document or a message body. **Inferred.** The channel in step 7 needs something to send.
4. The QR is bound to that issue. **Inferred** from the security claim. Payload (URL, document id, hash) is unknown.
5. Pending exams are omitted, shown as pending, or block the document. **Not published.**

A fiscal invoice from step 1 is a different document. This step does not re-bill the patient.

## Inputs

| Input | Status |
|---|---|
| Released results from step 5 | Inferred as the only values that should print |
| Patient and visit from step 1 | Inferred |
| Exam names from the catalog | Inferred |
| The laboratory’s layout | Published as adaptable identity |
| A unique value for the QR | Inferred |

## Outputs

| Output | Used by |
|---|---|
| The clinical report | Step 7 |
| A QR code on that report | The recipient, and possibly the [client panel](../modules/client-panel.md). The scan target is not published |
| An issue moment | Traceability, if stored |

## Handoff

[Deliver](07-deliver.md) takes this document. Paper handover at reception can happen in parallel with WhatsApp. The vendor emphasizes the digital channels and does not describe the desk copy.

If a result is corrected after issue, this step has to run again or the first QR remains the authentic document. That rule is **not published**.

## Not part of this step

- Statistical or management reports. Those are step 8
- Designing the layout during a patient visit. Identity is configured before the path runs
- Electronic signature as a separate control
- SENIAT fiscal printing

## Open questions

1. Is the issued report a PDF, a print job, or an image inside WhatsApp?
2. Who can change the layout after go-live?
3. What does the QR resolve to?
4. Does a corrected result create a new report and a new code?
