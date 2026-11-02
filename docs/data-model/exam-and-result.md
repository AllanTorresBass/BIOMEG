# Exam and result

**Status:** The printed grid is observed. Internal codes are not.

## Structure on the page

```text
Order
  └─ Section heading          HEMATOLOGIA COMPLETA, QUIMICA SANGUINEA, …
       └─ Sub-group, optional SERIE ROJA, ANÁLISIS QUÍMICO, …
       └─ Result line
            description       HEMATIES, GLUCOSA, COLOR, REL A/G
            result            number, word, or semi-quantitative text
            unit              may be blank
            reference text    see reference-interval.md
  └─ OBSERVACIONES            optional free text under a section
```

A section heading has no result and no unit. A result line always has a description and a result. Unit and reference are present as columns even when the cell is empty or a dot (one lipid ratio printed a dot in the unit or reference cell).

## Result shapes observed

| Shape | Examples of the pattern |
|---|---|
| Decimal | Comma as the decimal mark: `12,7`, `0,35`, `3,83` |
| Integer | Cell counts and a urine density |
| Qualitative | `NEGATIVO`, `NORMAL`, `AMARILLO`, `LIGERAMENTE TURBIO` |
| Semi-quantitative | `POSITIVO (+++)` |
| Count phrase | `1-3 XC`, `0-2 XC` |
| Amount word | `ESCASAS`, `MODERADA` |
| Blank-looking numeric context | A ratio row whose unit cell was a dot |

The value is stored in a way that can hold text, not only a float. A numeric type alone cannot print `POSITIVO (+++)` or `1-3 XC`. A second numeric column may exist for analyzers. It is **not** visible, because the report shows one `RESULTADO` cell.

Thousands separators vary (`9160`, `13.100`, `659.000`). That is formatting. It does not prove a string column by itself. The qualitative rows do.

## Sections and panels

Headings seen:

| Group | Role on the page |
|---|---|
| `HEMATOLOGIA COMPLETA`, `QUIMICA SANGUINEA`, `PERFIL LIPIDICO`, `PROTEINAS TOTALES Y FRACCIONADAS`, `BILIRRUBINA TOTAL Y FRACCIONADA`, `SEROLOGIA` | Panel or department title |
| `SERIE ROJA`, `SERIE BLANCA`, `SERIE PLAQUETARIA` | Sub-group inside hematology |
| `ANÁLISIS FÍSICO`, `ANÁLISIS QUÍMICO`, `ANÁLISIS MICROSCÓPICO` | Sub-group inside urinalysis |

The same product prints hematology, chemistry, lipids, proteins, bilirubin, serology (as a heading), and urinalysis. Serology had a heading on one report and no rows in the text extract, so a section can exist with nothing under it or with rows the extract dropped. Do not treat that heading as proof of a stored serology result. The BIOMEG preview settles the first reading for its own page: QUIMICA SANGUINEA printed its column headers and no rows, on an order with hematology results. See [../session/print-preview.md](../session/print-preview.md).

Panel versus analyte is a real distinction on the page: `PERFIL LIPIDICO` contains `COLESTEROL`, `TRIGLICERIDOS`, and several ratios. The catalog of “more than 600 exams” can therefore be panels, analytes, or both. These reports show both levels as print structure. They do not show the catalog’s primary key. The 30 October price list adds a category, a status, and five price columns for each exam, and does not label panels versus analytes. See [../session/lista-de-precios.md](../session/lista-de-precios.md). Which orderable exam produces which printed rows is **not published**.

## Calculated rows

These print as ordinary lines, not as a separate formula block:

- `V.C.M.`, `H.C.M.`, `C.H.C.M.`, `R.D.W.`
- `LDL-COLESTEROL`, `COLESTEROL V.L.D.L.`, `COLESTEROL NO HDL`, `RAZÓN CT/HDL`, `RAZÓN LDL/HDL`, `LIPIDOS TOTALES`
- `GLOBULINA`, `REL A/G`, `BILIRRUBINA INDIRECTA`

The report cannot tell a typed value from a formula. Calculation is **not published**. The only fact is that derived names occupy the same four columns.

## Names differ by laboratory for the same analyte

Units for red cells include `x mm3`, `10^6/uL`, and `uL` across laboratories. Reference wording differs too. The exam **description and unit are local**, or the template reformats a shared code. A national code (LOINC or otherwise) is not printed.

## Observations

`OBSERVACIONES` holds a sentence under hematology on one report (“differential verified on a peripheral smear”). It is tied to a section, not to a single analyte, in that layout. Other reports omit it. So the note is optional.

## Ordering of rows

Rows follow clinical section order, and that order is stable inside a panel (red series, then white series, then platelets). Sort order is **observed** on the page. Whether it is a sequence number on each analyte is **inferred**.

## What is not on the row

Analyzer flag, method, sample id, who typed the cell, and previous value. See [records-not-on-the-report.md](records-not-on-the-report.md). A high or low column is absent too. On the BIOMEG preview, at least one result is red, and color is the only sign.
