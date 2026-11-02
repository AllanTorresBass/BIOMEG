# SICOEXC module documentation

These notes record capabilities the vendor names. They are not the proposal for the new application. The map is [../README.md](../README.md). The proposal is [../product/README.md](../product/README.md).

These notes expand the feature catalog in [../sicoexc-research.md](../sicoexc-research.md). Each file is one module. A module is a business capability the vendor names, not a confirmed menu entry. Soluciones Informáticas SM has not published screen names, field lists, or a permission matrix.

Labels used in every file:

| Label | Meaning |
|---|---|
| **Published** | Stated on labsicoexc.com or in a founder’s public project text |
| **Observed** | Visible in vendor photos or on the marketing site, without a written specification. Sightings from the 30 October 2026 session are cited to [../session/](../session/) |
| **Inferred** | Required for the published feature to work. Not confirmed |
| **Not published** | Absent from public sources |

Version in scope: **9.0**, as marketed on the services page. A live session on 30 October 2026 advertises version 10 and shows the real menus. That session is [../session/README.md](../session/README.md). Researched 29 October 2026. Session transcribed 31 October 2026.

Commands the public catalog did not name, and that this folder does not repeat as separate essays: inventory and purchase orders, bacteriology masters, cost structure (supplies, salaries, reagent costs), credit and debit notes, retentions (ISLR, IVA, ARCV), budgets, referrals, and Evolución de Pacientes. They are transcribed under [../session/](../session/README.md).

## Modules

| Module | File | Catalog items |
|---|---|---|
| Patient admission | [patient-admission.md](patient-admission.md) | Patient admission, patient registration, the admission side of multi-rate intake |
| Billing and payments | [billing-and-payments.md](billing-and-payments.md) | Multi-rate billing, payment methods (Cashea), SENIAT homologation |
| Test catalog | [test-catalog.md](test-catalog.md) | More than 600 clinical diagnostic exams |
| Quality control | [quality-control.md](quality-control.md) | Central storage and analytical follow-up of samples |
| Analyzer connectivity | [analyzer-connectivity.md](analyzer-connectivity.md) | Bidirectional interface that reads analyzer results |
| Result entry | [result-entry.md](result-entry.md) | Manual result entry (`carga de resultados`) |
| Validation | [validation.md](validation.md) | Validation of clinical exams before delivery |
| Reports | [reports.md](reports.md) | Report layouts adapted to the laboratory’s identity |
| QR authenticity | [qr-authenticity.md](qr-authenticity.md) | QR codes on reports, extended from COVID-19 to all tests |
| Result delivery | [result-delivery.md](result-delivery.md) | Automatic WhatsApp delivery and email delivery |
| Exam traceability | [exam-traceability.md](exam-traceability.md) | Fast traceability of exams |
| Statistical reports | [statistical-reports.md](statistical-reports.md) | Statistical reports of results |
| Users and concurrent work | [users-and-concurrent-work.md](users-and-concurrent-work.md) | Reception, auxiliaries, secretaries, bioanalysts, and physicians at the same time |
| Client panel | [client-panel.md](client-panel.md) | Website login, “Inicia sesión en tu cuenta” |

## Catalog lines that are not modules

| Catalog line | Why it has no file |
|---|---|
| Learning curve | A sales claim (“intuitive”, short training). No training product is described |
| Paper reduction | An outcome of admission, results, and delivery |
| Centralized data | A property of the whole system, not a module |
| Customization to local working style | A 2019 sales line. No configuration module is named |
| Public and private labs, clinics, hospitals | Target customers, not a function |

## How the modules connect

This order is inferred from the advertised features. It is not a confirmed screen flow.

1. [Users and concurrent work](users-and-concurrent-work.md) — who can operate the system.
2. [Test catalog](test-catalog.md) — what can be ordered.
3. [Patient admission](patient-admission.md) — who is being served and which exams are requested.
4. [Billing and payments](billing-and-payments.md) — how that visit is charged.
5. [Quality control](quality-control.md) — where the sample is.
6. [Analyzer connectivity](analyzer-connectivity.md) and [Result entry](result-entry.md) — how a number gets onto the order.
7. [Validation](validation.md) — release of the result.
8. [Reports](reports.md) and [QR authenticity](qr-authenticity.md) — the document.
9. [Result delivery](result-delivery.md) and [Client panel](client-panel.md) — how the patient receives it.
10. [Exam traceability](exam-traceability.md) and [Statistical reports](statistical-reports.md) — follow-up and review.
