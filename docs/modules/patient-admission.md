# Patient admission

**Catalog:** Patient admission. Patient registration. The intake side of “ingreso y facturación multitasa.”  
**Release named by the vendor:** 9.0  
**Evidence:** [Published] on the services page. Patient registration is also in the CEO’s public project description.

Admission is the front of the laboratory. It records the patient and opens the visit that billing, exams, samples, and results hang from. The vendor calls this an admission module and ties it to multi-currency charging and modern payment methods. Charging itself is documented in [billing-and-payments.md](billing-and-payments.md).

## Published behavior

- Staff register patients. The CEO describes automation of “registro de pacientes” as a core administrative function.
- Version 9.0 has an admission module (“módulo de admisión de pacientes”) with support for several currencies and modern payment methods.
- The same visit continues through exam processing, validation, and delivery. The services page describes automation “desde el registro de pacientes hasta la entrega y validación.”
- Receptionists are among the roles that use the system at the same time as auxiliaries, secretaries, bioanalysts, and physicians. Reception is the usual place admission happens. The vendor does not say reception is the only role allowed to admit.

## Who uses it

| Role | Relationship to admission | Label |
|---|---|---|
| Receptionist | Named concurrent user. Admission is the work this role is associated with in a laboratory | Inferred from the role name |
| Secretary | Named concurrent user. Often shares front-desk work with reception | Inferred |
| Physician | Named concurrent user. May be the person who requests exams. The vendor does not say physicians create admissions | Not published |
| Bioanalyst, auxiliary | Named concurrent users. Their published work is later in the flow | Inferred |

## Place in the flow

Admission is the first operational step. An admission has to exist before an exam can be ordered from the [test catalog](test-catalog.md), before a [sample](quality-control.md) can be followed, and before a [result](result-entry.md) can be attached. [Billing](billing-and-payments.md) is published as part of the same intake, not as a later optional product.

## What the module must handle

These items are **inferred**. A patient-admission module that matches the catalog cannot function without them. Field names are unknown.

| Concern | Why it is required |
|---|---|
| Patient identity | “Registro de pacientes” is a published function. Repeat visits need the same person to be found again |
| A visit or order | Billing, exams, and results are per encounter, not only per person |
| Exam selection | The catalog has more than 600 exams. Admission is where they are chosen for this visit |
| Requesting physician | Physicians use the system, and a clinical order has a requester in ordinary laboratory practice. The vendor never says the physician is stored on the admission |
| Currency and payment context | The admission module is published together with multi-currency billing and payment methods |

## What is not published

- Screen layout, mandatory fields, or search (name, national id, medical record number, phone).
- Whether a patient has a permanent chart or only a row created at each visit. Medical history is **not** a published module. See the research dossier, section 3.3.
- Appointments, home collection, referrals, insurance plans, and price agreements.
- How much demographic data is required before an exam can be ordered.
- Whether admission can be started from a previous visit.
- Labels, barcodes, and worklists at the moment of admission.
- Whether the physician, the patient, or only front-desk staff can open an admission.

## Relationships

| Module | Link |
|---|---|
| [Billing and payments](billing-and-payments.md) | Published as one intake activity with admission |
| [Test catalog](test-catalog.md) | Source of the exams placed on the admission |
| [Quality control](quality-control.md) | Samples belong to the exams ordered here |
| [Users and concurrent work](users-and-concurrent-work.md) | Several front-desk and clinical roles share the database while admissions are opened |
| [Client panel](client-panel.md) | A later login exists. It is not described as a way to create an admission |

## Open questions

1. Which identifiers are required for a patient in Venezuela and in Peru?
2. Can one admission contain exams for more than one physician?
3. Is there a separate order screen after the patient is registered, or is ordering part of admission?
4. What happens to an admission that is cancelled before a sample is taken?
