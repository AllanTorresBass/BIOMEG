# Statistical reports

**Catalog:** “Reportes estadísticos de los resultados,” in the CEO’s public project description.  
**Evidence:** [Published] as one of the processes the software automates, together with patient registration and result entry.  
**Not the same module as** clinical [reports](reports.md). Clinical reports are the patient document. This module is management information about those results.

## Published behavior

- The system produces statistical reports of results.
- No report name, filter, or example is published.
- Version 9.0’s feature bullets do not repeat this item. It remains part of the founder’s description of the product and should be treated as in the product unless the vendor withdraws it.

The about page says the system centralizes data. Statistics are a natural use of that store. Centralized data is not itself a report.

## What the one sentence does not include

| Possible report | Status |
|---|---|
| Volume by exam, day, or month | Not published |
| Results by physician | Not published |
| Turnaround time | Not published |
| Abnormal or critical counts | Not published |
| Revenue, currency, or Cashea totals | Not published. Billing is a separate module, and the CEO’s phrase says statistics **of results**, not of sales |
| Export to Excel or PDF | Not published |
| Epidemiology or public-health notification | Not published |

Do not fill this module with a standard laboratory dashboard. The vendor has not listed one.

## Who uses it

A laboratory director or a bioanalyst is the usual reader of result statistics. The vendor does not name a management role. Receptionists, auxiliaries, assistants, secretaries, bioanalysts, and physicians are the only roles published. Which of them can open a statistical report is **not published**.

## Place in the flow

Statistics read [results](result-entry.md) after they exist. They are not on the path that produces a patient report. They can include pending work only if the product counts orders that have no value yet. That is **not published**.

Useful inputs, if the report is truly “of results”:

- exam, from the [test catalog](test-catalog.md)
- patient and date, from [admission](patient-admission.md)
- value and status, from result entry, the [analyzer](analyzer-connectivity.md), and [validation](validation.md)

## What the module must handle

**Inferred:**

| Concern | Why it is required |
|---|---|
| A query over stored results | A statistical report is an aggregate |
| A period | Otherwise “statistics” is a single lifetime number |
| A grouping | By exam is the minimum that matches the words “de los resultados” |

Filters, charts, and scheduled email of the report are **not published**.

## Relationships

| Module | Link |
|---|---|
| [Reports](reports.md) | Different output. Do not document patient PDFs here |
| [Result entry](result-entry.md) | Source values |
| [Test catalog](test-catalog.md) | The categories being counted |
| [Billing and payments](billing-and-payments.md) | Not a published source for this module |
| [Exam traceability](exam-traceability.md) | One exam’s history, not an aggregate |

## Open questions

1. Which statistical reports ship with version 9.0?
2. Can a laboratory build its own, or only run vendor-defined ones?
3. Do the figures include unvalidated results?
4. Is there any commercial statistic, or only clinical counts?
