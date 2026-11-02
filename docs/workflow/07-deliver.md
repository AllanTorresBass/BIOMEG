# Step 7 — Deliver

**Workflow status:** The preview toolbar names the trigger. GENERAR PDF, ENVIAR WhatsApp, and ENVIAR CORREO were visible and were not pressed. See [../session/print-preview.md](../session/print-preview.md).  
**Modules:** [Result delivery](../modules/result-delivery.md), [Client panel](../modules/client-panel.md)  
**Previous:** [Report](06-report.md)  
**Next:** [Review](08-review.md), which does not block this step

## Purpose

Get the report to the patient without relying on paper. On the live preview the channels are three buttons: GENERAR PDF, ENVIAR WhatsApp, and ENVIAR CORREO. A website login exists and is not confirmed as a further channel.

## When it starts and ends

| | |
|---|---|
| Starts | A report with a QR exists, and a destination exists |
| Ends | A message has been sent, or a user has been shown that the send failed. Failure handling is not published |
| Automatic | The services page says WhatsApp delivery is automatic. It does not say which event fires it. The preview's button suggests a person may start it |

The safe reading is that automatic means the transport runs without retyping the result. It may still wait for validation, for a button, or for a paid visit. Those gates are **not published**. This dossier keeps validation in step 5 so delivery does not send a draft. That is a reading, not a vendor rule.

## Published behavior used here

- Results go to the patient on WhatsApp.
- Results go by email (“WhatsApp o Correo”).
- WhatsApp sending is described as automatic.
- The product summary joins WhatsApp delivery with QR codes.
- The panel page says “Inicia sesión en tu cuenta” and nothing else. Download after login is **not published**.
- Online download is not a named channel.

Email is published. Calling email automatic is **inferred**, because the word “automático” is on the WhatsApp bullet.

## Actors

| Role | Part in this step | Label |
|---|---|---|
| Patient | The published recipient | Published |
| SICOEXC | Sends the WhatsApp message automatically | Published |
| Reception or secretary | Confirms the number and resends when a patient asks. Resend is not described | Inferred |
| Physician | Not named as a recipient. May still be handed a copy outside the product | Not published |
| Holder of the client-panel account | Unknown. May be the patient or the laboratory that bought SICOEXC | Not published |

## What happens

1. A destination is chosen. Phone for WhatsApp, address for email. Captured in step 1 is the likely place. **Inferred.**
2. The report from step 6, or a link to it, is sent. **Inferred** payload. The QR is published as part of WhatsApp delivery.
3. WhatsApp goes out through an integration the vendor does not name: official API, a linked phone, or a gateway. **Not published.**
4. Email goes out by a mail path that is also unnamed.
5. The patient receives the result on the phone or in the inbox. **Published** as the comfort claim.
6. Optionally, someone signs in to the client panel. **Observed** login only. Do not document a download from this SICOEXC panel. The BIOMEG portal is a separate design rule in [../product/02-client-flow.md](../product/02-client-flow.md).

Consent to send clinical data over WhatsApp is **not published**.

Payment status from step 1 is not a published hold. A laboratory may refuse to send until the visit is paid. That would be a local rule, not a documented product rule.

## Inputs

| Input | Status |
|---|---|
| The report and QR from step 6 | Required for the published WhatsApp claim |
| A phone number | Required for WhatsApp. Field location unknown |
| An email address | Required for the email channel |
| A released result | Inferred gate from step 5 |

## Outputs

| Output | Used by |
|---|---|
| A WhatsApp message | The patient |
| An email | The patient |
| A send record, if stored | Traceability and a resend. Not confirmed |
| A possible login session | Unknown screens |

## Handoff

The patient-facing path ends here. [Review](08-review.md) does not have to finish before the message goes out, and a successful send does not produce a statistical report.

Paper at the desk can still happen. It is outside the published digital path.

If the send fails, the result still exists in steps 5 and 6. The vendor does not describe a retry queue, so staff have no published way to see the failure.

## Not part of this step

- Creating the clinical content
- A confirmed patient portal
- Physician commission notices
- Fiscal delivery of the invoice to SENIAT. That is step 1, if it exists

## Open questions

1. Which event triggers the automatic WhatsApp message?
2. Which WhatsApp product is used, and in which countries?
3. Can staff see and resend a failure?
4. Is the ordering physician copied?
5. Does the QR or the client panel offer a download?
