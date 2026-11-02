# Test catalog

**Catalog:** “Más de 600 exámenes de diagnóstico de laboratorio clínico.”  
**Release named by the vendor:** 9.0  
**Evidence:** [Published] on the services page.

The catalog is the list of exams a laboratory can order, price, run, and report. The vendor states a count. It does not publish the list, the coding system, or how a laboratory adds a test that is not in the 600.

## Published behavior

- More than 600 clinical diagnostic exams are available.
- Exams are part of the path from patient registration to validation and delivery.
- Report layouts can be adapted to the laboratory. That implies an exam’s presentation is not fixed for every customer. See [reports.md](reports.md).
- Analyzer connectivity maps instrument output onto exams in this catalog. The mapping rules are not published. See [analyzer-connectivity.md](analyzer-connectivity.md).

The marketing URL `/lista-de-examenes/` does **not** contain a test list. Checked on 1 November 2026, the page's title is “Lista de Clientes e interfaz lis con equipos automatizados”, and its body is a client and equipment photo gallery. The URL is historical. Do not treat that page as the catalog.

## What “600 exams” does not specify

The count is a **published claim**. It does not say:

- whether 600 is orderable panels, individual analytes, or both
- whether every customer receives the same 600 or a subset
- which disciplines are included (chemistry, hematology, immunology, microbiology, urinalysis, and others are not enumerated by the vendor)
- whether the catalog ships with reference ranges, methods, units, sample types, and turnaround times
- whether the laboratory can add, rename, disable, or reprice an exam

A Vitalab client photograph shows that laboratory offering pregnancy tests, clinical chemistry, hematology, immunology, urinalysis, stool tests, and rapid tests. That is the laboratory’s own sign, not SICOEXC’s catalog structure.

## Who uses it

| Role | Likely use | Label |
|---|---|---|
| Reception, secretary | Select exams during admission | Inferred |
| Bioanalyst | Define how an exam is resulted and validated | Inferred |
| Physician | Request exams. Whether physicians browse the catalog in the system is not published | Not published |
| Vendor implementation staff | Load or adapt the catalog for a new laboratory | Inferred from “nos adaptamos a la forma de trabajar” |

## Place in the flow

The catalog is master data. [Patient admission](patient-admission.md) consumes it. [Billing](billing-and-payments.md) prices it. [Quality control](quality-control.md) follows the sample for an ordered exam. [Analyzer connectivity](analyzer-connectivity.md) and [result entry](result-entry.md) write values against it. [Reports](reports.md) print it.

## What a catalog record must hold

**Inferred.** Without at least these ideas, the other modules have nothing to point at. Columns are unknown.

| Idea | Used by |
|---|---|
| A stable exam identity | Orders, results, statistics |
| A name printed for the patient | Reports |
| A price | Multi-currency billing |
| A link to an analyzer code | Bidirectional instrument interface |
| A place in a report layout | Personalized reports |

Reference ranges, units, methods, panels, profiles, preparatory instructions, and tube types are standard catalog attributes in a LIS. They are **not published** for SICOEXC. Reports print units and reference text, and the session's Crear Perfiles was not opened.

## Relationships

| Module | Link |
|---|---|
| [Patient admission](patient-admission.md) | Exams are chosen here |
| [Billing and payments](billing-and-payments.md) | Exams become charge lines |
| [Analyzer connectivity](analyzer-connectivity.md) | Instrument codes must match catalog exams |
| [Reports](reports.md) | Layout is per laboratory, and therefore depends on how exams are grouped |
| [Statistical reports](statistical-reports.md) | Statistics of results only make sense by exam |

## Open questions

1. Is the 600-exam figure a starter catalog, and can a laboratory exceed it?
2. Are profiles (a hemogram, a chemistry panel) one catalog row or many?
3. Are prices national, per laboratory, per currency, or per customer type?
4. Is there a code standard (LOINC, local codes, or both)?
