# Order

**Status:** `N° ORDEN`, both dates, and the link to a patient and a convenio are observed. Numbering rules are not.

The BIOMEG preview of 30 October 2026 prints **N° ORDEN** `0001`, with FECHA MUESTRA and FECHA REPORTE both 30/10/2026. The invoice on the same day has FACTURA N° and CONTROL N° as separate empty boxes, plus Motivo and Médico. See [../session/print-preview.md](../session/print-preview.md) and [../session/facturacion.md](../session/facturacion.md).

## Attributes

| Attribute | Observed shape | Reading |
|---|---|---|
| `N° ORDEN` | The shape `NNNN`, on all five reports | Four digits, zero padded. Small integers. Different laboratories |
| `FECHA MUESTRA` | `DD/MM/YYYY` | On Template A. Same calendar day as the report date in every A sample |
| `FECHA REPORTE` | `DD/MM/YYYY` | Template A only, as its own label |
| `FECHA` | `DD/MM/YYYY` | Template B’s single date. May be sample date, report date, or both |
| Patient | The header person | One order prints one patient |
| Convenio | `AMBULATORIA` on the public reports, and a company name on the BIOMEG preview | See [convenio.md](convenio.md) |

The order is the header of the result document. Every result row on pages 1 and 2 of a two-page report shares that same `N° ORDEN`. So an order has many result lines. That relation is **observed**.

## Numbering

The samples do not show whether a number is global, per day, per year, or per laboratory. They do show that the printed number is short and padded, not a long universal id.

Uploader file names sometimes glue a date to this number (day, month, year, and order number run together). That pattern belongs to the person who named the PDF. It is not printed as a SICOEXC key, so it is not part of the model.

## Dates

On Template A the sample date and the report date are separate labels, and in these files they are the same day. The product can therefore print both. It is **not** shown whether they can differ. A report issued the day after collection would be the test.

Template B does not print `FECHA REPORTE`. Either that laboratory’s template dropped the label or the product stores only one date for that site. Both readings fit the paper.

## What an order row must point at

**Inferred** from the header plus the grid:

| Target | Why |
|---|---|
| Patient | The header is one person |
| Convenio | The header has one agreement value |
| Result lines | Many rows, one order number |
| Laboratory template | The captions and footer differ by site |

Physician, price, and currency are not on the printed header. The invoice shows a Médico dropdown, a tipo de costo, money, and Motivo, and groups Médico and Motivo under Datos del Paciente. Whether they are stored on the order, on the patient, or on an invoice record is **not** shown. See [../session/facturacion.md](../session/facturacion.md).

## Relationship to a sample

`FECHA MUESTRA` is the only sample fact on the paper. A sample id, type, or status is not printed. Quality control, as the vendor describes it, still needs somewhere to follow a specimen. That store is not this header. See [records-not-on-the-report.md](records-not-on-the-report.md).
