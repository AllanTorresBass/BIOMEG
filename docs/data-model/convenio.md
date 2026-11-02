# Convenio

**Status:** The label `CONVENIO` is observed. Only one value was seen on the public reports. The BIOMEG preview shows a second, described below.

## What was printed

Every sampled report, Template A and Template B, prints:

`CONVENIO: AMBULATORIA`

So the result header has an agreement or patient-class field, and ambulatory is a real value in Venezuelan installations.

The BIOMEG preview prints CONVENIO as a company name, not as the word Ambulatoria. The invoice also has Razón Social, a billing C.I., and Dirección, and a cost type Seguro/Empresa. Convenio can be an organization. Whether that organization is the same record as Registro de Empresas was not shown. See [../session/print-preview.md](../session/print-preview.md).

## What the public value cannot prove

| Possible meaning of convenio | Status |
|---|---|
| A patient class: ambulatory versus hospitalized | Fits the word on the public reports, where no second value was printed. The BIOMEG preview's company name shows the field isn't only a class |
| An insurer, company, or price list | Normal in laboratory software. **Not** on these reports. No price is printed |
| A free-text label | Possible. Five reports using the same word do not show a catalog |

No other convenio (`HOSPITALIZACION`, a company name, an insurer) appears in the public reports. Do not build a price-list model from this field alone. Billing remains in [records-not-on-the-report.md](records-not-on-the-report.md).

## Relationship

One order prints one convenio. Whether the patient has a default convenio across visits is **not** shown. Whether a convenio has its own fields, such as an active mark, is also **not** shown.
