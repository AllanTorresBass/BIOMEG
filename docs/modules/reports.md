# Reports

**Catalog:** “Permite adaptar el diseño de los reportes y resultados clínicos a la identidad de tu laboratorio.” Also “formatos de reportes adaptables.”  
**Release named by the vendor:** 9.0  
**Evidence:** [Published] on the services page and the about page.

Reports are the document the laboratory gives to the patient or the physician. The vendor’s claim is about **identity**: the layout can carry the laboratory’s name and presentation. It is not a claim about a report designer’s feature list.

## Published behavior

- Report and result layouts can be adapted to the laboratory’s identity.
- The about page repeats that report formats are adaptable.
- [QR codes](qr-authenticity.md) are placed on diagnostic reports. They started on COVID-19 tests and now apply to all tests. The QR is part of the report, documented in its own module because the vendor treats it as a security feature.
- Results leave by WhatsApp and email, so a report file or an equivalent message must exist. The file type (PDF, image, printed page) is **not published**.
- Client photographs show desktop PCs and, in some rooms, printers. Printing is **observed** as something laboratories do beside the system. A print button inside SICOEXC is **not published**. The session names Imprimir por Paciente, not clicked.

## What “identidad del laboratorio” covers

**Published:** the design can match the laboratory.  
**Inferred** contents of that identity, none of them confirmed:

- logo, colors, address, and license numbers in the header
- the names of the professionals who direct the laboratory
- the order of sections (hematology, chemistry, notes)
- a signature block

The CTO’s public skills include Crystal Reports. A Crystal-based print layout would fit a Windows desktop LIS and a customizable report. That is a **hypothesis** from a résumé, not a product fact. Do not document Crystal Reports as the SICOEXC report engine.

## Who uses it

| Role | Relationship | Label |
|---|---|---|
| Bioanalyst | Owns the clinical content of the report after validation | Inferred |
| Reception, secretary | Often the people who print or hand the report to the patient | Inferred |
| Vendor | Adapts the layout at implementation. “Nos adaptamos a la forma de trabajar” | Inferred |
| Patient | Receives the report. Does not design it | Published via delivery channels |

Whether a laboratory user can edit the layout, or only the vendor can, is **not published**.

## Place in the flow

A report is produced from a [validated](validation.md) set of [results](result-entry.md) for exams in the [test catalog](test-catalog.md), for a patient opened in [admission](patient-admission.md). [QR authenticity](qr-authenticity.md) marks the document. [Result delivery](result-delivery.md) sends it.

Partial reports (some exams still pending) are **not published**.

## What the module must handle

**Inferred:**

| Concern | Why it is required |
|---|---|
| A template per laboratory | Identity differs by customer |
| Patient and admission data in the header | Otherwise the result has no subject |
| Exam name, value, and any unit or range the catalog stores | The clinical body |
| A way to emit the document more than once | Patients ask for another copy. Reprint behavior is not published |
| A stable moment of issue | The QR and traceability need a document that does not silently change |

## Relationships

| Module | Link |
|---|---|
| [Test catalog](test-catalog.md) | What is listed |
| [Result entry](result-entry.md) | The values |
| [Validation](validation.md) | Which values are allowed on the document |
| [QR authenticity](qr-authenticity.md) | Mark on the document |
| [Result delivery](result-delivery.md) | The document or message that is sent |
| [Statistical reports](statistical-reports.md) | A different kind of report. Do not merge them. Statistics are management output. This module is the clinical result |

## Open questions

1. Can the laboratory edit the layout, or is design a vendor service?
2. Is the issued report a PDF, a print spool, or a WhatsApp image?
3. Are pending exams omitted, listed as pending, or do they block the whole report?
4. Does a corrected result issue a new report, and is the old one marked?
