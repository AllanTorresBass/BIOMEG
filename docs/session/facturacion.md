# Facturación de Consultas

**Opened:** a blank form. Title on the window: Facturación de Consultas. Reached from Pacientes, and consistent with Facturar Consulta.

Commands on the form: **NUEVO**, **GUARDAR**, **CANCELAR**, **SALIR**.

No patient was entered in the capture. The only prefilled value is Fecha de Nac.

## Header

| Field | On the blank form |
|---|---|
| FACTURA N° | Empty |
| CONTROL N° | Empty |
| Tipo de Costo | Radios: Rutina, Seguro/Empresa, Emergencia, Hospitalizado. None selected in the capture |

Control number is the fiscal-looking field. The form does not show a SENIAT authorization code or a printer name.

## Detalle Recepción — Datos del Paciente

| Field | On the blank form |
|---|---|
| C.I. | Empty, with a dropdown beside it |
| Nombre y Apellido | Empty. One field, not split into given name and surnames |
| Fecha de Nac. | Prefilled **07/10/2012** |
| Edad | Empty. Not calculated from the prefilled date in this capture |
| Sexo | Dropdown, empty |
| Teléfono | Empty |
| Email | Empty |
| Motivo | Empty |
| Médico | Dropdown, empty |
| Emergencia | A control at the right edge. Its exact widget was partly cut off |

The birth-date default is a defect risk: a new patient can be saved as born on 7 October 2012 if the operator does not change it. Age did not fill itself from that date.

Email and Teléfono are the destinations ENVIAR CORREO and ENVIAR WhatsApp need. They are on this form. The preview later prints the telephone. It does not print the email.

Médico is a dropdown, so the list comes from somewhere, most likely Registro de Médicos. The registry form was not opened.

## Datos Facturación

| Field | On the blank form |
|---|---|
| C.I. | Empty, with a dropdown |
| Razón Social | Empty |
| Dirección | Empty |

Billing identity can differ from the patient. Razón Social is a legal name, which fits Ingreso Empresa and Seguro/Empresa. The capture does not show both filled at once.

## Exámenes a Realizar

| Piece | What is on screen |
|---|---|
| Indique Examen | A text box |
| List headed EXAMEN | A scrolling list. The visible rows are biopsy studies (tongue, intestinal obstruction, tonsil, lower colonoscopy, adenoid, cecal appendix, and others cut off) |
| Detalle de los Examenes Solicitados | Empty panel on the right |

Ordering and billing are the same form. The earlier split between “admit and bill” and “order from the catalog” is one screen here. See [workflow step 1](../workflow/01-admit-and-bill.md) and [step 2](../workflow/02-order-from-catalog.md).

The visible exam names are a slice of the catalog, not the catalog. Prices are not on this list. They are on [lista-de-precios.md](lista-de-precios.md).

## Forma de Pago

| Field | Notes |
|---|---|
| % de Descuento | Dropdown |
| Forma de Pago | Dropdown. The options were not opened |
| Resultados por | Dropdown. Not opened. Do not treat it as the validation step |
| Observación | Free text |
| Efectivo USD$ | Amount |
| Zelle | Amount |
| Efectivo Bs | Amount |
| T. Débito | Amount |
| Pago Móvil | Amount, plus a dropdown |
| Transferencia | Amount, plus a dropdown |
| T. Crédito | Amount |
| Banco | Text |
| Refer. | Reference, beside the electronic methods |

Cashea is not a field on this form. It is the Administrativo command Cobros Cashea and the report Ventas por Cashea. A Cashea payment may still be one of the Forma de Pago options. That dropdown was not opened.

## Totales

All zero on the blank form:

Sub Total, Total Exento, Total Base Imp., I.V.A., IGTF, Desc. 0%, Total Bs, Total USD$, Abono, Resta.

IGTF is the Venezuelan tax on payments in foreign currency. Its presence next to USD and Bs totals matches Tasa BCV on the shell (889,26 that day). The form does not show the rate it will apply. Whether it reads the shell rate is not demonstrated.

Abono and Resta match Agregar Abono. A visit can be partly paid.

## What this form proves

These labels are on the screen. They are still not column names.

- A patient can have a birth date, and age is a separate box.
- Sex, phone, email, motivo, and physician are captured at billing time.
- The billed party can be a razón social with its own cédula and address.
- An invoice has a number and a control number.
- Cost type is Rutina, Seguro/Empresa, Emergencia, or Hospitalizado.
- The form has money fields in USD and bolívares, with IVA, IGTF, exempt amount, discount, abono, and resta. A blank form does not show how they are stored.
- Payment instruments include cash in both currencies, Zelle, debit, credit, pago móvil, and transfer, plus bank and reference.
