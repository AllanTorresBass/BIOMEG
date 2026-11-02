# Step 1 — Admit and bill

**Workflow status:** Inferred. The vendor publishes admission and billing as one intake. It does not publish this as step 1 of a manual.  
**Modules:** [Patient admission](../modules/patient-admission.md), [Billing and payments](../modules/billing-and-payments.md)  
**Next:** [Order from the catalog](02-order-from-catalog.md). In the 30 October 2026 session they are the same form, Facturación de Consultas. Commands: Ingreso Particular, Ingreso Empresa, Facturar Consulta. See [../session/facturacion.md](../session/facturacion.md).

## Purpose

Open a visit for a person and charge it. Everything later — sample, result, report, delivery — hangs off this visit.

## When it starts and ends

| | |
|---|---|
| Starts | A person presents for laboratory work, or a staff member opens a new visit for someone already known |
| Ends | The patient is registered, the visit exists, and a charge has been taken or at least calculated in one or more currencies |
| Does not wait for | A sample, a result, or a report |

Whether the visit can end this step unpaid is **not published**. Cashea is a published payment method, so “charged” can mean an installment arrangement rather than cash in hand.

## Published behavior used here

- Patient registration is a core function (CEO project description).
- Version 9.0 has an admission module with several currencies and modern payment methods.
- Patients can be charged in more than one currency.
- Cashea is a named payment method.
- In Venezuela the vendor claims SENIAT homologation. That claim is not independently confirmed.
- The services page joins registration to later delivery and validation, so this step is the start of that span.

## Actors

| Role | Part in this step | Label |
|---|---|---|
| Receptionist | Opens the visit and collects payment. This is the usual front-desk job | Inferred |
| Secretary | Same desk, same unpublished permission | Inferred |
| Patient | Provides identity and a way to pay. Not a system user in any published sentence | Inferred |
| Physician | May be recorded as the requester. The vendor does not say this happens at admission | Not published |

## What happens

1. Staff find an existing patient or register a new one. **Published** as registration. The search keys are **not published**.
2. Staff open a visit. **Inferred.** Billing and later results need an encounter, not only a person.
3. Exams to be charged are selected. The catalog is step 2. The vendor’s phrase “ingreso y facturación” puts selection on this same intake. Treat the boundary as analytical.
4. The system prices the visit in one or more currencies. **Published** as multitasa billing. Rate source, currency list, and whether one invoice mixes currencies are **not published**.
5. Staff take a payment method. Cashea is the only method named. Other “modern and local” methods are **published** only as a class.
6. A fiscal document is produced where the country requires one. **Published** as a Venezuela SENIAT claim and as country-adapted fiscal options. Document type, control number, and credit notes are **not published**.

## Inputs

| Input | Status |
|---|---|
| Patient identity | Required by the registration claim. Which fields are mandatory is unknown |
| Exams | Required to calculate a charge. May be completed in step 2 |
| Currency and rate | Required by multitasa billing. Who maintains the rate is unknown |
| Payment method | Required if a payment is recorded. Cashea is the named example |

## Outputs

| Output | Used by |
|---|---|
| A patient record | Later visits, delivery addresses if phone and email are captured here |
| A visit or admission | Steps 2 through 7 |
| A charge and a payment or payment arrangement | Billing history. No sales report is published |
| A fiscal document, where claimed | The laboratory’s tax file. Not a clinical report |

Phone and email are the destinations for step 7. Capturing them at admission is **inferred**. The vendor never says the admission form has those fields.

## Handoff

Step 2 needs the visit and the catalog. If exam selection already happened inside admission, step 2 is done and the handoff is to [sample tracking](03-track-the-sample.md).

[Exam traceability](../modules/exam-traceability.md) should be able to show who opened the visit and when. The vendor does not confirm that admission writes a trail.

## Not part of this step

- Drawing the sample
- Sending the result
- Physician commissions
- Insurance authorization and corporate account rules. The session shows Ingreso Empresa, and its account rules were not captured
- Cash closing and shift reports

## Open questions

1. Can results be produced before the visit is paid?
2. Which currencies and rates does version 9.0 store with the charge?
3. What does a cancelled admission do to the fiscal document?
4. Are phone and email required before the visit can be saved?
