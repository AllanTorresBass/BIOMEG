# Print preview

**Opened** from the result path. The capture is one page, “1 de 1” in the viewer and “Page 1 of 1” on the paper. Toolbar commands read from the full preview:

**GENERAR PDF**, **ENVIAR WhatsApp**, **ENVIAR CORREO**, **SALIR**.

Those three outputs are buttons. Delivery is not an undocumented background job in this screen. Whether WhatsApp and email send immediately, or only after a further confirm, was not exercised.

## Laboratory block

| Printed | Value |
|---|---|
| Name | BIOMEG |
| Line under the name | LABORATORIO CLINICO |
| RIF | Y241355540 |
| Mark | A QR code at the upper right of the page |

The shell at the same time said QR: ACTIVO. This page is the code that flag allows. The payload inside the QR was not decoded.

## Patient and order block

Labels, without the person’s values:

| Label | What the capture shows about the value |
|---|---|
| PACIENTE | One name string |
| C.I. | Digits |
| EDAD | A number of years |
| GÉNERO | A sex word |
| TELÉFONO | A +58 number |
| CONVENIO | A company name. Not the word Ambulatoria |
| FECHA MUESTRA | 30/10/2026, the session date |
| FECHA REPORTE | 30/10/2026, the same day |
| N° ORDEN | 0001 |

Email, birth date, médico, and motivo are on the invoice and are not in this header.

## Result grid

Columns: **DESCRIPCIÓN DEL EXAMEN**, **RESULTADO**, **UNIDADES**, **VALORES DE REFERENCIA**.

Sections on this page:

- HEMATOLOGIA COMPLETA
  - SERIE ROJA
  - SERIE BLANCA
  - SERIE PLAQUETARIA
- QUIMICA SANGUINEA, with the four column headers repeated and no result rows under them

An empty section still prints. A partial order is not held back until chemistry exists.

Reference text for hemoglobin and hematocrit includes both **HOMBRE** and **MUJER** ranges in the cell. The patient’s sex is also printed. The report does not hide the other sex’s range.

At least one result is printed in red. The page has no separate high/low column. Color is the flag.

## How this sits against the earlier notes

[Report fields](../data-model/report-fields.md) came from other laboratories’ PDFs. This preview is the same four columns and the same kind of header, with three additions those PDFs did not settle:

- A QR is on the page.
- Convenio can be a legal entity, not only “Ambulatoria”.
- The order number on this copy is `0001`.

[Result delivery](../modules/result-delivery.md) can name the three buttons. [QR authenticity](../modules/qr-authenticity.md) can say the code is on the BIOMEG layout while QR is ACTIVO.
