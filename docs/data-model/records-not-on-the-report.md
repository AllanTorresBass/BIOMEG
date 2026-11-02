# Records the reports do not show

The printouts fix the clinical header and the result grid. The vendor also sells behavior that never appears on those pages, and the 30 October menus name further commands. Those need stored facts. The shapes below are **inferred**. They are not column names, and they must not be merged with the observed report labels as if they had been printed.

## Sample

| Needed because | Minimum fact | Observed on the report |
|---|---|---|
| Quality control: store and follow samples | An identity and a status over time | Only `FECHA MUESTRA` |

Tube, barcode, rejection, and aliquot remain unpublished.

## Analyzer map

| Needed because | Minimum fact | Observed |
|---|---|---|
| Automatic reading of analyzer results | Instrument code to exam description | No analyzer name on the report. The session has Registro de Equipos, not opened, and a wallpaper advertisement for instrument transmission |

The result cell can hold the imported value and a typed value in the same column. The report does not say which one it was.

## Validation event

| Needed because | Minimum fact | Observed |
|---|---|---|
| The vendor includes validation in the path to delivery | A state, a person, a time | `Procesado por` with no name. A wet-stamp sentence on one template. No electronic signature. No captured menu command is named Validar |

See [validation-and-staff.md](validation-and-staff.md).

## Invoice, currency, payment

The clinical report still does not print money. The invoice form from the same session does. See [../session/facturacion.md](../session/facturacion.md).

| Needed because | Minimum fact | Observed |
|---|---|---|
| Multitasa billing, Cashea, SENIAT claim | A charge, a currency, a rate, a method, a fiscal document | On the invoice: Factura N°, Control N°, USD and Bs totals, IVA, IGTF, exempt base, discount, abono, resta, and payment lines for cash, Zelle, debit, credit, pago móvil, and transfer, with bank and reference. Also Tipo de Costo, % de Descuento, and Forma de Pago, whose options were not opened. Cashea is a menu command, not a box on the blank form. The shell shows Tasa BCV |
| A billed party that can differ from the patient | A document, a legal name, an address | On the invoice: a billing C.I. with a dropdown, Razón Social, and Dirección |
| Originals and copies | A stored document that can be emitted again | Re-Imprimir commands for factura, notes, retentions, and orders. Nota de Crédito and Nota de Débito are separate commands. None was opened |
| Closing the drawer and the month | A close and its period | Cierre de Caja and Cierre Mensual, not opened |
| A quote | A priced list that isn't a factura | Presupuesto and Generar Presupuesto, not opened |

`CONVENIO` on older public PDFs was the word Ambulatoria. The BIOMEG preview uses a company name. See [convenio.md](convenio.md). The price list is a different screen, with five price columns. See [../session/lista-de-precios.md](../session/lista-de-precios.md).

## Exam catalog and prices

| Needed because | Minimum fact | Observed |
|---|---|---|
| “More than 600 exams”, and exams chosen on the invoice | An exam with a name | Lista de Precios shows Examen, a category, a status, and five price columns, one currency at a time. The invoice has an exam picker. Prices were not copied |
| Panels | Which exams a panel holds | Crear Perfiles, not opened. The word “panel” is a reading of the name |
| Reference text and units per analyte | Text the report prints | Printed on reports. No form that maintains them was opened. Modificar Valores has no object in its name |
| Saturday pricing | A switch, and what it changes | Precio Sábado on the shell. What it changes was not shown |

See [../session/lista-de-precios.md](../session/lista-de-precios.md) and [../session/mantenimiento.md](../session/mantenimiento.md).

## Masters and back office

These commands prove a list or a document exists. They prove no fields. See [../session/registros.md](../session/registros.md), [../session/administrativo.md](../session/administrativo.md), [../session/estructura-de-costos.md](../session/estructura-de-costos.md), and [../session/reportes.md](../session/reportes.md).

| Area | Commands |
|---|---|
| Masters | Médicos, Empresas, Proveedores, Reactivos y Servicios, Equipos |
| Bacteriology | Parásitos, Antibióticos, Microorganismo, Muestra de Bacteriología, Observaciones de Bacteriología, Agregar Nota de Bacteriología |
| Stock and purchases | Restar Inventario, Ordenes de Compra, Lista de Inventario de Reactivos, Libro de Compras |
| Receivables and payables | Cuentas por Cobrar, Cuentas por Pagar |
| Fiscal outputs | Libro de Ventas, Resumen de IGTF, Tipos de Retenciones (ISLR), ARCV, XML de Retenciones de ISLR, Retenciones del IVA |
| Cost | Insumos, Servicios y Otros, Salarios de Personal, Costos Reactivos, Promedios Pacientes/Pruebas |
| Referrals and relaciones | Imprimir Referidos, Relación de Referidos, Generar Relación de Paciente, whose label is cut off, Reversar Relación. What a relación is was not shown |
| Reading across visits | Evolución de Pacientes, Estadísticas |
| Status and notes | Status de Impresión. The home panel's Nueva Observación |
| System | Registro de Correo, Respaldo de la BD |

## Report file and QR

| Needed because | Minimum fact | Observed |
|---|---|---|
| Adaptable layout and a QR on every test | A template and a code bound to the issued report | Older PDF text extracts had no QR. The BIOMEG preview shows a QR while the shell says QR: ACTIVO. The payload was not decoded |

See [../session/print-preview.md](../session/print-preview.md).

## Delivery

| Needed because | Minimum fact | Observed |
|---|---|---|
| WhatsApp and email | A destination and a send | The preview toolbar has GENERAR PDF, ENVIAR WhatsApp, and ENVIAR CORREO. The invoice has Teléfono and Email. The send itself was not pressed |

## Users and roles

| Needed because | Minimum fact | Observed |
|---|---|---|
| Several jobs work at once | A person and a role | Not printed, except the empty `Procesado por` slot. The session shows Usuario Activo and Nuevo Usuario, not opened |

## Audit

| Needed because | Minimum fact | Observed |
|---|---|---|
| “Trazabilidad de exámenes rápida” | A history that can be opened | Not printed. Current value only. No previous result. The session's Mantenimiento has Auditoría, not opened |

## Explicitly still missing

Field types, primary keys, indexes, and SQL names for every entity in this folder, including the ones that are printed. Observing `N° ORDEN` does not reveal whether the column is called `orden`, `nro_orden`, or something else.

If the vendor provides a backup or a data dictionary under a normal agreement, replace this folder’s inferred half and attach the real names beside the labels in [report-fields.md](report-fields.md). Until then, the printed labels are the detail that can be defended.
