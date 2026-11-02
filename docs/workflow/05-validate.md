# Step 5 — Validate

**Workflow status:** Inferred as the gate before delivery. The vendor names validation inside the span “registro … entrega y validación.” It does not say it is a separate step, who performs it, or what credential it uses.  
**Module:** [Validation](../modules/validation.md)  
**Previous:** [Produce the result](04-produce-the-result.md)  
**Next:** [Report](06-report.md)

**Named command:** none. The 30 October 2026 menus do not contain Validar. The invoice has a dropdown Resultados por, and it was not opened. Do not treat that dropdown as this step. See [../session/facturacion.md](../session/facturacion.md).

## Purpose

Turn a stored value into a result the laboratory is willing to put on a report and send to the patient.

## When it starts and ends

| | |
|---|---|
| Starts | An order line has a value from step 4 |
| Ends | That line is marked released, or the whole visit is marked released |
| Per exam or per visit | **Not published.** Either rule changes when step 7 is allowed to send |

The services-page word order is “entrega y validación.” This dossier still places validation before delivery. Sending an unvalidated clinical result would empty the word validation. That sequence is **inferred**.

## Published behavior used here

- Clinical exams are validated.
- Validation is part of the automated path that begins at registration.
- QR codes are a separate authenticity control on the document. They are step 6, not this step.
- Electronic signature of the bioanalyst is **not published**. Do not add a signature ceremony to this step.

## Actors

| Role | Part in this step | Label |
|---|---|---|
| Bioanalyst | The professional who validates clinical results in this market | Inferred. The role is published. The permission is not |
| Physician | Named user. Usually the reader, not the validator of the laboratory result | Not published as a validator |
| Auxiliary | May prepare results. Releasing them is a professional act and is not given to this role in any public text | Not published |

## What happens

1. A person reviews the value, its exam, and its sample. The review screen is **not published**.
2. The person releases it. **Inferred** from the existence of a validation act. The gesture (button, password, certificate) is unknown.
3. The system records who released it and when. **Inferred** because [traceability](../modules/exam-traceability.md) is advertised and a professional release without an actor cannot be reconstructed.
4. The line becomes eligible for the report. **Inferred.**
5. A value that fails review stays off the report. Hold, repeat, and correct are **not published**.

Automatic validation of interfaced results inside a range would sit inside this step. It is **not published**. Automatic reading in step 4 is not the same thing.

## Inputs

| Input | Status |
|---|---|
| A value from step 4 | Required |
| The exam and sample context | Inferred as what the reviewer looks at |
| The reviewer’s identity | Inferred |

Reference ranges and previous results would make the review safer. They are **not published** as review features. Reports do print reference text. See [../data-model/reference-interval.md](../data-model/reference-interval.md).

## Outputs

| Output | Used by |
|---|---|
| A released result | Steps 6 and 7 |
| An actor and a time, if stored | Traceability and a possible name on the report |
| Unreleased lines | Stay in step 4 or 5. No published work queue |

## Handoff

[Report](06-report.md) should include only released lines. If the visit is only partly validated, the report either waits, lists the rest as pending, or omits them. The vendor does not say which.

Correcting a result after this step is a return to step 4 and a second pass through step 5. That loop is **not published**. If it exists, step 8’s traceability is where the first value must remain visible.

## Not part of this step

- A digital signature or certificate
- A second supervisor, unless the laboratory’s own procedure adds one outside the product
- Sending WhatsApp
- Fiscal approval of the invoice. That belonged to step 1

## Open questions

1. Is release one action per exam or one action per visit?
2. Does release require a password or only a signed-in bioanalyst?
3. Can a released result be taken back?
4. Does the report print the bioanalyst’s name and license?
