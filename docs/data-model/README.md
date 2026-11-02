# SICOEXC data model

This folder records labels seen on printouts and forms. It is not the proposal for the new application. The map is [../README.md](../README.md). The proposal is [../product/README.md](../product/README.md).

This set expands section 7 of [../sicoexc-research.md](../sicoexc-research.md). A second pass looked for a data dictionary, table list, or SQL script. None is public. What did turn up are clinical reports whose footer says **Impreso por el Sistema de Control de Exámenes Clínicos (SICOEXC)**. Those printouts are the best evidence of the data the product keeps. They are an output model, not a database schema.

Labels:

| Label | Meaning |
|---|---|
| **Observed** | Printed on a SICOEXC report found in public. Sightings from the 30 October 2026 session are cited to [../session/](../session/) |
| **Published** | Named by the vendor, with no field list |
| **Inferred** | Required for an observed or published fact to be stored. Not a column name |
| **Not published** | Still absent after this pass |

Researched 29 October 2026. Version named by the vendor: **9.0**. The reports below are dated 2025 and 2026, so they are current printouts, not an old format. They are not labeled with a version number.

A live invoice and a BIOMEG preview on 30 October 2026 add birth date, email, motivo, médico, razón social, factura and control numbers, tipo de costo, payment lines, IVA, IGTF, and a QR. A price list adds a category, a status, and five price columns. Those labels are in [../session/facturacion.md](../session/facturacion.md), [../session/lista-de-precios.md](../session/lista-de-precios.md), and [../session/print-preview.md](../session/print-preview.md). Patient identifiers from that preview are not copied into this folder.

## Do not copy identities from the samples

The source PDFs contain real names, identity numbers, and telephone numbers. This folder records **labels and value shapes** only. It does not repeat those identities. On 1 November 2026, the order numbers from those reports and the company name from the BIOMEG preview were also replaced by their shapes, because they could help someone find a report.

## Documents

| Topic | File | Basis |
|---|---|---|
| How the pieces fit | This file | — |
| Every label seen on the printout | [report-fields.md](report-fields.md) | Observed |
| Patient | [patient.md](patient.md) | Observed |
| Order and dates | [order.md](order.md) | Observed |
| Agreement (`convenio`) | [convenio.md](convenio.md) | Observed |
| Exam, section, and result | [exam-and-result.md](exam-and-result.md) | Observed |
| Reference text | [reference-interval.md](reference-interval.md) | Observed |
| Laboratory identity and template | [laboratory-and-template.md](laboratory-and-template.md) | Observed |
| Who processed and who signs | [validation-and-staff.md](validation-and-staff.md) | Observed as labels. Often blank |
| Records the features need but the reports do not show | [records-not-on-the-report.md](records-not-on-the-report.md) | Published or inferred |

## Relationship, as far as the printout goes

```text
Laboratory template 1──* Report
Report *──1 Order
Order *──1 Patient
Order *──1 Convenio
Order 1──* Section
Section 1──0..* Sub-group
Section or sub-group 1──0..* Result line
Result line *──1 Exam description
Result line 1──1 printed reference text
Section 1──0..* Observation
```

A sub-group is printed nesting, such as `SERIE ROJA` under `HEMATOLOGIA COMPLETA`. Whether it is stored as its own level is **not published**.

Sample date is a field on the order header. A separate sample record, with tubes and status, is still only implied by the vendor’s quality-control sentence. See [records-not-on-the-report.md](records-not-on-the-report.md).

## Coverage

How much is known about each record in the current program. The new application's records are in [../product/08-logical-data-model.md](../product/08-logical-data-model.md).

| Record | Printed on a report | On an opened form | Menu name only | Page |
|---|---|---|---|---|
| Patient | Yes | Invoice | | [patient.md](patient.md) |
| Order | Header | Invoice | | [order.md](order.md) |
| Convenio | Yes | Razón Social and Seguro/Empresa may relate. Not shown | Registro de Empresas | [convenio.md](convenio.md) |
| Section, result line, reference text | Yes | | Cargar Resultados | [exam-and-result.md](exam-and-result.md), [reference-interval.md](reference-interval.md) |
| Laboratory and template | Yes | | | [laboratory-and-template.md](laboratory-and-template.md) |
| Validation, staff | A label, often blank | | Nuevo Usuario | [validation-and-staff.md](validation-and-staff.md) |
| Exam catalog and prices | Exam names only | Lista de Precios, exam picker | Precio Examenes, Crear Perfiles | [records-not-on-the-report.md](records-not-on-the-report.md) |
| Invoice, payment, billing party | No | Invoice | Administrativo commands | [records-not-on-the-report.md](records-not-on-the-report.md) |
| Report file, QR, delivery | QR on the BIOMEG preview | Preview buttons | QR, Registro de Correo | [records-not-on-the-report.md](records-not-on-the-report.md) |
| Sample, analyzer map | Only Fecha Muestra | | | [records-not-on-the-report.md](records-not-on-the-report.md) |
| Registries, inventory, purchases, costs, fiscal lists | No | | Yes | [records-not-on-the-report.md](records-not-on-the-report.md) |
| Audit | No | | Auditoría | [records-not-on-the-report.md](records-not-on-the-report.md) |

## What this pass rules out

| Claim | Result |
|---|---|
| A public SQL schema exists | Not found |
| SIGLAB, MINSA SIHCE, or any other LIS manual is the SICOEXC dictionary | Those are different products. They were not used |
| Column names can be taken from the Spanish labels | Labels change between laboratories. `PACIENTE` and `NOMBRE` print the same kind of fact |
| The CTO’s SQL Server or MySQL skill names the engine | Still a résumé, not a catalog |

## Sources

Five public reports, identified by the product footer. Their links were removed on 1 November 2026, because the file names contained patient names. Do not copy the patient block into other documents.

| Public report | What it adds |
|---|---|
| Public report 1 | Two-page chemistry and hematology. Observations. Template A |
| Public report 2 | Sex-split reference text. Footer “HOMOLOGADO POR EL SENIAT”. Template A |
| Public report 3 | Urinalysis, qualitative results. Wet-signature note. Colegio number. Template A |
| Public report 4 | Template B (`NOMBRE`, `CEDULA`, `SEXO`). `SEXO` blank. “Procesado por” |
| Public report 5 | Second Template B report. Same blank sex and “Procesado por” |

Vendor pages used for everything the reports do not show: [labsicoexc.com/services-2/](https://labsicoexc.com/services-2/) and the founder’s public project note. See the research dossier, section 10.
