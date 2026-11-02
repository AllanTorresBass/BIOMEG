# Lista de Precios

**Opened** from Reportes. Window commands: **CANCELAR**, **SALIR**. The SICOEXC logo is on the form. A button **IMPRIMIR LISTA** sits at the bottom.

## Filters

| Filter | Value in the capture |
|---|---|
| Indique Columna de Precio | Dropdown, not chosen in the visible state |
| Indique Moneda | Dropdown, not chosen in the visible state |
| Indique Categoría | QUIMICA SANGUINEA |
| Indique Status | Disponible |

Categoría and status are filters. Química Sanguínea is one category, not the whole catalog. Disponible is one status. Another status, not available, appears in the grid as **No Disp** on at least one row in the full capture. The status filter was set to Disponible, so that row is the exception visible inside the filtered list. Do not invent further status names.

## Columns

| Column | Role |
|---|---|
| EXAMEN | Exam name |
| PARTICULAR | Price column |
| ALIADOS | Price column |
| HOSPITALIZADO | Price column |
| EMERGENCIA | Price column |
| ESTATAL | Price column. The header is partly tight against the status column |
| Status | Disponible or No Disp |

These price columns are not the same list as Tipo de Costo on the invoice (Rutina, Seguro/Empresa, Emergencia, Hospitalizado). Emergencia and Hospitalizado appear in both. Particular, Aliados, and Estatal appear only here. Rutina and Seguro/Empresa appear only on the invoice. How a Tipo de Costo picks a price column is not shown.

Moneda is its own filter, so the numbers on screen belong to one currency at a time. The capture does not show which currency was selected. Amounts are not copied here.

## Exams visible under Química Sanguínea

The grid is a chemistry list: iron saturation, urine sodium, 17-hydroxyprogesterone, urine potassium, vitamin D, urine chloride, lactic acid, uric acid, uric acid in 24-hour urine, lipid acid, adenovirus, and further rows cut off. Names vary in spelling and punctuation from row to row. That is the catalog text, not a cleaned standard.

A separate slice of the catalog, biopsies, is visible on the invoice exam picker. See [facturacion.md](facturacion.md). Panels versus single analytes are not labeled in this grid.

## How this sits against the earlier notes

[Test catalog](../modules/test-catalog.md) can now say the catalog has a category, a status, and five price columns, plus a currency filter. Reference ranges, units, and sample type are not on this screen. Reference ranges and units appear on the printed result. Sample type appears on neither.
