# Validation

**Catalog:** Automation “desde el registro de pacientes hasta la entrega y validación de exámenes clínicos.”  
**Release named by the vendor:** 9.0  
**Evidence:** [Published] on the services page, inside the operational-advantages paragraph. Validation is not given its own bullet.

Validation is the step that turns a loaded result into a result the laboratory is willing to release. The vendor names it. The vendor does not describe who performs it, how many steps it has, or what credential it uses.

## Published behavior

- Clinical exams are validated.
- Validation is part of the same span as registration and delivery. The sentence order is registration, then delivery and validation. Do not read that word order as a sequence. Delivery of an unvalidated result would contradict the usual meaning of validation. The sequence “validate, then deliver” is **inferred**.
- [QR authenticity](qr-authenticity.md) is the published authenticity control on the document the patient receives. It is not described as the validation act inside the laboratory.

## What people often add, and the catalog does not

| Expectation | Status |
|---|---|
| Electronic signature of the bioanalyst | **Not published.** The research dossier records this as a common attribution. The site says validation and QR, not a digital signature |
| A second reviewer or supervisor release | Not published |
| Automatic validation rules (auto-verify) | Not published. Automatic reading from the analyzer is a different feature |
| A hold for critical values | Not published |
| A printed name, license number, and signature image on the report | Not published. Report personalization could include a signature block. That is **inferred**, not stated |

Iliani Lozada, a cofounder, is a bioanalyst. That explains why the product is built with that profession in mind. It does not document a signature feature.

## Who uses it

The bioanalyst is the professional who validates clinical results in Venezuela and in comparable Latin American practice. The vendor lists bioanalysts as concurrent users and does not assign validation to that role in writing. The assignment is **inferred**.

Physicians are also concurrent users. In a LIS, the ordering physician usually reads the result. The vendor does not say the physician validates it.

## Place in the flow

Validation sits between a value existing and a report leaving the building.

- Upstream: [result entry](result-entry.md) and [analyzer connectivity](analyzer-connectivity.md).
- Downstream: [reports](reports.md), [QR authenticity](qr-authenticity.md), [result delivery](result-delivery.md).

Whether every exam on an admission must be validated before any delivery, or each exam can be released alone, is **not published**.

## What the module must handle

**Inferred:**

| Concern | Why it is required |
|---|---|
| A state change from “entered” to “validated” | Otherwise validation is only a word |
| The person who validated | A professional act without an actor cannot be traced |
| A time | [Exam traceability](exam-traceability.md) is advertised |
| A block on delivery of a result that is not validated | This matches the purpose of the step. The vendor does not confirm the block |

## Relationships

| Module | Link |
|---|---|
| [Result entry](result-entry.md) | Produces the candidate value |
| [Analyzer connectivity](analyzer-connectivity.md) | Another producer of the candidate value |
| [Quality control](quality-control.md) | May supply the reason a result should be held. No rule is published |
| [Reports](reports.md) | The document should show only validated content. Not confirmed |
| [Result delivery](result-delivery.md) | Should run after validation. Inferred |
| [QR authenticity](qr-authenticity.md) | Authenticity of the issued document, which is a different control |

## Open questions

1. Is validation one click, a password re-entry, or a certificate?
2. Can a validated result be unvalidated, and is the previous value kept?
3. Are interfaced results auto-validated inside defined ranges?
4. Does the report show the name and license of the bioanalyst who validated?
