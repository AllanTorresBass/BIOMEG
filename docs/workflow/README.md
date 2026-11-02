# SICOEXC operational workflow

This set expands section 4 of [../sicoexc-research.md](../sicoexc-research.md). Soluciones Informáticas SM does not publish a process manual. The eight steps are the business path implied by the features they advertise. They are **not** a confirmed screen flow, and two steps may share one screen in the real product. They are the current program’s implied path. The proposal for the new application is [../product/README.md](../product/README.md).

Labels match the [module notes](../modules/README.md):

| Label | Meaning |
|---|---|
| **Published** | Stated on labsicoexc.com or in a founder’s public project text |
| **Observed** | Visible in vendor photos or on the marketing site. Sightings from the 30 October 2026 session are cited to [../session/](../session/) |
| **Inferred** | Required for the published feature to work. Not confirmed |
| **Not published** | Absent from public sources |

Version in scope: **9.0** on the marketing site. The 30 October 2026 session advertises version 10 and names the commands below. See [../session/README.md](../session/README.md). Researched 29 October 2026.

| Step | Command in the live session | Screen opened? |
|---|---|---|
| 1 | Ingreso Particular, Ingreso Empresa, Facturar Consulta | Invoice form, blank |
| 2 | Indique Examen on that same invoice | Yes, same form |
| 3 | Hoja de Trabajo is the nearest command | No |
| 4 | Cargar Resultados. Analyzer transmission is advertised on the wallpaper | No |
| 5 | No menu item is named Validar | No |
| 6 | Imprimir por Paciente, Imprimir Prueba Individual | Preview only |
| 7 | GENERAR PDF, ENVIAR WhatsApp, ENVIAR CORREO | Buttons visible. Not pressed |
| 8 | Estadísticas, Evolución de Pacientes | Menu only |

## Steps

| Step | File | What the step accomplishes | Modules |
|---|---|---|---|
| 1 | [01-admit-and-bill.md](01-admit-and-bill.md) | Register the patient and charge the visit | Admission, billing |
| 2 | [02-order-from-catalog.md](02-order-from-catalog.md) | Choose the exams for that visit | Test catalog, admission |
| 3 | [03-track-the-sample.md](03-track-the-sample.md) | Store and follow the sample through analysis | Quality control |
| 4 | [04-produce-the-result.md](04-produce-the-result.md) | Get a value from the analyzer or from the keyboard | Analyzer connectivity, result entry |
| 5 | [05-validate.md](05-validate.md) | Release the result | Validation |
| 6 | [06-report.md](06-report.md) | Produce the laboratory’s document, with a QR code | Reports, QR authenticity |
| 7 | [07-deliver.md](07-deliver.md) | Send it by WhatsApp or email | Result delivery, client panel |
| 8 | [08-review.md](08-review.md) | Look across results after the visit | Statistical reports, exam traceability |

```text
1 Admit and bill
      │
2 Order from the catalog
      │
3 Track the sample
      │
4 Produce the result ── analyzer import or manual entry
      │
5 Validate
      │
6 Report + QR
      │
7 Deliver ── WhatsApp, email, and an unconfirmed client login
      │
8 Review ── statistics and traceability, off the patient-facing path
```

Steps 1 and 2 are split here so charging and exam selection can be read separately. The vendor publishes them as one intake: “ingreso y facturación” together with a catalog of exams. A laboratory may do both on a single admission screen.

Step 8 is not a gate on the patient’s result. Statistics and traceability run beside the path. They can be used at any time after data exists. They are placed last because they read the finished work.

## Roles on the path

The vendor says these people work at the same time. It does not assign a step to a role. The assignment below is **inferred** from the job name.

| Role | Steps they most likely touch |
|---|---|
| Receptionist | 1, 2, and handing over step 7 |
| Secretary | 1, 2, and 7, overlapping reception |
| Auxiliary / assistant | 3 and possibly 4 |
| Bioanalyst | 3, 4, 5, 6, and 8 |
| Physician | 2 as the requester, and 7 or 8 as a reader. No physician screen is published |

Permissions per role are not published. See [users and concurrent work](../modules/users-and-concurrent-work.md).

## What the whole path does not include

These are absent from the published workflow, not steps that were forgotten in this folder:

- Appointments and home collection
- Barcode labels and worklists. The session names Hoja de Trabajo, whose form was not opened
- Electronic signature of the bioanalyst
- Physician commissions
- A medical-history module
- A confirmed patient download portal
- Inventory, critical-value alerts, and insurance authorization

## How to read a step file

Each file states when the step starts, who acts, which modules it uses, what must already exist, what it leaves for the next step, and which handoffs the vendor never defined.
