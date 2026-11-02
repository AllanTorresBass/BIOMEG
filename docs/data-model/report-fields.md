# Report fields

**Status:** Observed on printouts whose footer is “Impreso por el Sistema de Control de Exámenes Clínicos (SICOEXC)”.  
**These are labels, not column names.** Two laboratories print different words for the same fact.

## Two templates

| Fact | Template A | Template B |
|---|---|---|
| Person | `PACIENTE` | `NOMBRE` |
| Identity document | `C.I.` | `CEDULA` |
| Sex | `GÉNERO` | `SEXO` |
| Sample date | `FECHA MUESTRA` | `FECHA` |
| Report date | `FECHA REPORTE` | Not printed as its own label on the Template B samples. The single `FECHA` may be doing both jobs |
| Age | `EDAD` | `EDAD` |
| Phone | `TELÉFONO` | `TELÉFONO` |
| Order | `N° ORDEN` | `N° ORDEN` |
| Agreement | `CONVENIO` | `CONVENIO` |
| Exam name | `DESCRIPCIÓN DEL EXAMEN` or `DESCRIPCIÓN DEL EXÁMEN` | `Descripción del Examen` |
| Value | `RESULTADO` | `Resultado` |
| Unit | `UNIDADES` | `Unidad` |
| Reference | `VALORES DE REFERENCIA` | `Valores Referenciales` |

Template A was seen on reports from laboratories in Guayos (Carabobo), Acarigua (Portuguesa), and Caracas. Template B was seen on reports from Hospital Universitario, Coro (Falcón). Personalization is not only a logo. The field captions move. See [laboratory-and-template.md](laboratory-and-template.md).

## Header block

| Label | Value shape seen | Empty allowed? |
|---|---|---|
| Patient name | Family names in capitals or mixed case | Not in these samples |
| `C.I.` / `CEDULA` | Digits, no prefix letter on the samples | Not in these samples |
| `GÉNERO` | `Masculino`, `Femenino`, `FEMENINO` | Not blank on Template A |
| `SEXO` | Blank on both Template B samples | Yes, on that template |
| `EDAD` | A number plus `Años` | Not blank here |
| `TELÉFONO` | International form `+58…` | Not blank here |
| `FECHA MUESTRA` or `FECHA` | `DD/MM/YYYY` | Not blank here |
| `FECHA REPORTE` | `DD/MM/YYYY`, same day as the sample date on every Template A sample | Not shown as a separate label on Template B |
| `N° ORDEN` | Four digits with leading zeros, in the shape `NNNN`, on all five reports | Not blank |
| `CONVENIO` | The word `AMBULATORIA` on every public sample. A company name on the BIOMEG preview | Not blank in any sample |
| Page | `Página 1 de 2`, `Página 1 de 1`, or `Page 1 of 1` | The page marker exists |

`SEXO` blank while `GÉNERO` is filled means sex is stored, and one template can omit it or leave it empty. It is not safe to call the column mandatory for every laboratory.

Age prints with the word `Años`. The store may keep a birth date and calculate age, or keep a number and a unit. No birth date is printed. See [patient.md](patient.md).

## Result grid

Each analytic row has four printed cells:

| Cell | Examples of shape, not of a person’s values |
|---|---|
| Description | Short name (`HEMATIES`, `GLUCOSA`) under a section heading |
| Result | Decimal with a comma (`12,7`), an integer, a qualitative word (`NEGATIVO`, `AMARILLO`), a semi-quantitative mark (`POSITIVO (+++)`), a range (`1-3 XC`), or a word of amount (`ESCASAS`, `MODERADA`) |
| Unit | `g/dL`, `fL`, `%`, `U/L`, `10^6/uL`, sometimes blank on qualitative rows |
| Reference | A range, a one-sided limit (`Hasta 1,10`), a sex split inside the cell (`HOMBRE:` / `MUJER:`), an age hint (`niños`), or a phrase (`Favorable menor de 4.5`, `NORMAL`) |

Section headings are not result rows. They group rows: `SERIE ROJA`, `SERIE BLANCA`, `SERIE PLAQUETARIA`, `HEMATOLOGIA COMPLETA`, `QUIMICA SANGUINEA`, `PERFIL LIPIDICO`, `PROTEINAS TOTALES Y FRACCIONADAS`, `BILIRRUBINA TOTAL Y FRACCIONADA`, `SEROLOGIA`, `ANÁLISIS FÍSICO`, `ANÁLISIS QUÍMICO`, `ANÁLISIS MICROSCÓPICO`.

`OBSERVACIONES` is a free-text line under a section. One sample uses it for a smear comment. Others have no observation.

## Footer and legal lines

| Text | Where |
|---|---|
| `Impreso por el Sistema de Control de Exámenes Clínicos (SICOEXC)` | Every sample. This is the product identification |
| Laboratory address, telephone, email, WhatsApp | Header or footer. Differs by laboratory |
| `HOMOLOGADO POR EL SENIAT` | Some Template A reports only. No control number beside it |
| `Procesado por` | Template B. No name followed it in the text extract |
| A note that full validity needs an original signature and the wet stamp of the bioanalyst, plus the laboratory stamp | One Caracas urinalysis. Includes a Colegio de Bioanalistas registration number |
| A social-network line and a contact phone | Template B footer |

A BIOMEG preview from 30 October 2026 uses Template A labels and adds a QR at the upper right. Convenio on that page is a company name. N° ORDEN is `0001`. An empty QUIMICA SANGUINEA header still prints. At least one result is red, with no flag column. See [../session/print-preview.md](../session/print-preview.md).

## Not on any of the five public reports

Physician, QR image or payload, email of the patient, invoice total, currency, payment method, sample type, tube, analyzer name, flag (high/low) as its own column, and a filled bioanalyst name. Absence from five reports is not proof the database lacks the field, and a text extract cannot show an image or a color. It is proof the usual result layout does not print it. Those candidates are in [records-not-on-the-report.md](records-not-on-the-report.md).
