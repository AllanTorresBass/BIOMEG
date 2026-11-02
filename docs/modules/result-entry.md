# Result entry

**Catalog:** “Carga de resultados,” from the CEO’s public project description.  
**Evidence:** [Published] as a core automated process, alongside patient registration and statistical reports. Version 9.0 does not repeat this phrase. It describes automatic reading from analyzers instead.

Result entry is the manual path. [Analyzer connectivity](analyzer-connectivity.md) is the automatic path. Both have to end on the same exam of the same admission, or the laboratory cannot mix interfaced chemistry with a test that is still read by eye.

## Published behavior

- The system automates “carga de resultados.”
- Separately, version 9.0 reads analyzer results so staff do not transcribe them.
- Results continue to validation and then to delivery. The services page includes validation in the path that starts at registration.

The vendor does not say that every result is typed, or that every result comes from an instrument. The existence of both sentences is the evidence that both paths are in the product.

## What “carga” covers

**Published:** staff can load results into the system.  
**Not published:** the screen, the keyboard flow, or the data types.

A clinical result is not always a single number. The following forms are ordinary and **not confirmed** for SICOEXC:

| Form | Example | Status |
|---|---|---|
| Numeric | Glucose 95 mg/dL | Not published |
| Qualitative | Positive / negative | Not published |
| Text or narrative | A culture comment, a urine microscopy description | Not published |
| Calculated | An index derived from other results | Not published |
| Repeated | A second run that replaces or sits beside the first | Not published |

Reference ranges, units, previous-result display, and critical-value warnings are **not published**. They are listed among the gaps in the research dossier. Reports do print reference text. See [../data-model/reference-interval.md](../data-model/reference-interval.md).

## Who uses it

Bioanalysts are the profession that releases laboratory results, and auxiliaries often type or transcribe them. That split is **inferred** from the role names the vendor lists. The product does not say which role is allowed to type, edit, or overwrite an interfaced value.

## Place in the flow

1. [Patient admission](patient-admission.md) orders an exam from the [test catalog](test-catalog.md).
2. [Quality control](quality-control.md) follows the sample.
3. The value arrives here, or from the [analyzer](analyzer-connectivity.md).
4. [Validation](validation.md) is the next gate. Validation is published, and this order is **inferred**.
5. [Reports](reports.md), [QR authenticity](qr-authenticity.md), and [result delivery](result-delivery.md) use the released value.

Editing a result after delivery is a traceability question. See [exam-traceability.md](exam-traceability.md). The vendor says traceability is fast and does not say whether a released result can be corrected.

## What the module must handle

**Inferred:**

| Concern | Why it is required |
|---|---|
| The exam line being resulted | A value without an order cannot be reported |
| The value and enough context to print it | The report module has to show it |
| Who entered it and when | Traceability is advertised. The vendor does not confirm that entry is part of the audit |
| A distinction between a typed value and an imported value | Both sources exist |

## Relationships

| Module | Link |
|---|---|
| [Analyzer connectivity](analyzer-connectivity.md) | Automatic source for the same slot |
| [Test catalog](test-catalog.md) | Defines what is being resulted |
| [Quality control](quality-control.md) | Sample the value belongs to |
| [Validation](validation.md) | Release step |
| [Statistical reports](statistical-reports.md) | Statistics are of results, so they read this data |

## Open questions

1. Can staff edit a value that the analyzer already wrote?
2. Are partial results saved before the whole order is finished?
3. Is there a worksheet by bench (hematology, chemistry) or only a screen by patient?
4. What result types exist beyond a single number?
