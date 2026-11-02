# Exam traceability

**Catalog:** “Trazabilidad de exámenes rápida,” on the about page, under personalization and precise results.  
**Release named by the vendor:** The about page does not pin this sentence to version 9.0. The current site presents it as a product property.  
**Evidence:** [Published] as a short claim. No traceability screen is described.

Traceability is the ability to reconstruct what happened to an exam. The vendor says that reconstruction is fast. It does not say which events are kept.

## Published behavior

- Exam traceability exists.
- It is described as fast (“trazabilidad de exámenes rápida”).
- It is listed next to adaptable report formats, in a block about precise results.
- Version 9.0’s quality-control bullet adds central storage and analytical follow-up of samples. That is the operational cousin of traceability. Sample follow-up is documented in [quality-control.md](quality-control.md). This module is the historical view.

“Rápida” describes speed of lookup. It does not describe completeness.

## Events a laboratory trail usually contains

None of these events is confirmed. They are the questions the one-line claim leaves open.

| Event | Why it matters | Status |
|---|---|---|
| Who admitted the patient and when | Start of the exam | Not published |
| Who collected and received the sample | Custody | Not published |
| Whether the value was typed or imported from an analyzer | Source of the number | Not published |
| Who changed a value, and the previous value | Correction history | Not published |
| Who validated | Professional responsibility | Not published |
| When the report was issued and to which channel it was sent | End of the exam | Not published |
| Who viewed the result later | Access audit | Not published |

The CEO’s background includes database administration. That does not document an audit table.

## Who uses it

| Role | Likely question | Label |
|---|---|---|
| Bioanalyst | Where is this exam, and who released it? | Inferred |
| Reception | Has this patient already been given the result? | Inferred |
| Laboratory director | Reconstruction after a complaint | Inferred |
| Physician | Status of an order. Physicians are named users. A tracking view for them is not published | Not published |

## Place in the flow

Traceability reads every other operational module. It does not create the exam.

- [Patient admission](patient-admission.md) opens the exam.
- [Quality control](quality-control.md) moves the sample.
- [Analyzer connectivity](analyzer-connectivity.md) and [result entry](result-entry.md) write the value.
- [Validation](validation.md) releases it.
- [Result delivery](result-delivery.md) sends it.

If those modules do not store actor and time, this module has nothing to show. That dependency is **inferred**.

## What the module must handle

**Inferred** from the word traceability:

| Concern | Why it is required |
|---|---|
| An exam identity that survives the whole visit | Lookup has to find one exam |
| A time-ordered set of events | A single current status is tracking, not traceability |
| A way to open that history quickly | The vendor’s adjective is “rápida” |

How far back history is kept, and whether it can be deleted, are **not published**. The website privacy notice does not set a retention period for clinical data.

## Relationships

| Module | Link |
|---|---|
| [Quality control](quality-control.md) | Live sample follow-up |
| [Validation](validation.md) | The release event that should appear on the trail |
| [Result delivery](result-delivery.md) | The send event that should appear on the trail |
| [Statistical reports](statistical-reports.md) | Aggregates of results, not the trail of one exam |

## Open questions

1. Is traceability a timeline per exam, a status field, or a search by patient?
2. Are corrections stored, or does a new value replace the old one?
3. How long is the trail kept?
4. Can a laboratory export the trail for an inspection?
