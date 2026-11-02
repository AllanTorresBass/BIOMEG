# Patient

**Status:** The printed attributes are observed. The table that holds them is not.

The 30 October 2026 invoice adds fields these older printouts did not show: **Fecha de Nac.**, **Email**, **Motivo**, and a **Médico** dropdown. The form groups them under Datos del Paciente. That grouping doesn't show which record stores them, and Motivo and Médico may belong to the visit. Nombre y Apellido is one box. Edad is a separate empty box and did not fill from the prefilled birth date. See [../session/facturacion.md](../session/facturacion.md).

## Attributes the report shows

| Attribute | Printed as | Notes |
|---|---|---|
| Name | `PACIENTE` or `NOMBRE` | One string on the report. Given name and surnames are not separate labels |
| Identity document | `C.I.` or `CEDULA` | Numeric on the samples. The label is the Venezuelan cédula. No passport, RIF, or foreign-id type was printed |
| Sex | `GÉNERO` or `SEXO` | Values seen: masculine and feminine, in mixed case and in capitals. Blank on both Coro Template B reports |
| Age | `EDAD` | Printed as a count of years (`Años`). No date of birth, no months, no days |
| Telephone | `TELÉFONO` | `+58` followed by a mobile number on every sample |

## What the printout does not settle

| Question | Why it matters |
|---|---|
| Is the patient one master row reused on the next visit? | Registration is a published function, so a master is likely. These reports are single visits and cannot prove reuse |
| Is the name one column or several? | Only one label is printed |
| Is age stored, or calculated from a birth date that is not printed? | Both designs print `EDAD` |
| Is `Años` a unit column? | It may be fixed text in the template |
| Is the phone the WhatsApp destination? | [Delivery](../modules/result-delivery.md) needs a phone. The report and the invoice both show a phone. That either is the send destination is **inferred** |
| Is there an email on the patient? | Not printed. The invoice has an Email field, and email delivery is a published channel |
| Is sex required? | Template B left it empty and still printed the report |

## Identity

`C.I.` / `CEDULA` is the identifier these Venezuelan laboratories print. Uniqueness inside one laboratory is **inferred**. A national uniqueness rule is **not published**. No check digit or `V-` / `E-` prefix appears on the samples. The invoice has a dropdown beside C.I. Its options were not opened, so the document types it offers are **not** shown.

## Relationship

A patient has one or more orders. Only one order is on each of these reports, so the “many” side is **inferred** from the idea of registration rather than from a second visit in the sample set.

See [order.md](order.md) and [report-fields.md](report-fields.md).
