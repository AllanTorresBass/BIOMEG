# Gaps and edge cases

Only what this session shows. Unopened forms are listed as gaps, not as invented screens.

## Defects and sharp edges

| What is on screen | Why it matters |
|---|---|
| Fecha de Nac. on a blank invoice is **07/10/2012**, and Edad stays empty | A save without editing the date stores a false birth date. Age is not derived in front of the user |
| QR: ACTIVO and Precio Sábado: INACTIVO are shell-wide switches | One setting covers the whole session. Precio Sábado off means Saturday prices are not in effect on this Friday capture. What the Saturday price changes is not shown |
| QUIMICA SANGUINEA prints with column headers and no rows | A partial order is issued. The reader can think chemistry was done and was blank |
| At least one result prints in red, apparently because it is out of range, with no flag column | The signal depends on color. A black-and-white print or a photocopier can drop it |
| Tipo de Costo and the price-list columns do not match | Invoice: Rutina, Seguro/Empresa, Emergencia, Hospitalizado. Price list: Particular, Aliados, Hospitalizado, Emergencia, Estatal. Emergencia and Hospitalizado overlap. The others do not. Which column an invoice uses is not shown |
| Cashea is Cobros Cashea and Ventas por Cashea, not a box on the blank invoice | The payment form lists cash, Zelle, debit, credit, pago móvil, and transfer. Cashea may be inside Forma de Pago. That list was not opened |
| Tasa BCV is on the shell (889,26) and IGTF is on the totals | Two currency mechanisms. The form does not show that it used 889,26 |
| Control N° is empty beside Factura N° | The fiscal control number exists as a field. This blank form does not show how it is assigned |
| Modificar Valores is a maintenance command with no object in the name | It might change prices, reference text, or results. Unopened. Treat it as undefined, not as a safe editor |
| Generar Relación de Paciente is cut off at the edge of the menu | The rest of the label was not captured |

## Two paths that the public notes had collapsed

| Split | Commands |
|---|---|
| Who is being admitted | Ingreso Particular and Ingreso Empresa |
| How the visit is priced | Tipo de Costo, and separately the five price columns |
| How the result leaves | GENERAR PDF, ENVIAR WhatsApp, ENVIAR CORREO |
| Original versus copy | Nota de Crédito versus Re-Imprimir Nota de Crédito, and the same pair for debit notes, invoices, retentions, and orders |

## Version

The public services page describes version 9.0. This program’s wallpaper says version 10 is available. The title bar does not show the version that is actually running. Do not equate the banner with “this build is 10”. It is an advertisement inside the shell.

## Still unopened

Ayuda. Hoja de Trabajo. Cargar Resultados. Every Registro form. Every Administrativo form. Cost screens. QR, Precio Sábado, Registro de Correo, Nuevo Usuario, Respaldo de la BD, and Auditoría. Flyouts for Cuentas por Cobrar, Equipos, Presupuestos, Evolución de Pacientes, and Estadísticas. Modificar and Trasladar. Imprimir Prueba Individual, Status de Impresión, and Imprimir Referidos, and Imprimir por Paciente was not clicked. Aplicar Aumento General, Precio Examenes, Modificar Valores, Crear Perfiles, and Agregar Nota de Bacteriología. Every report except Lista de Precios. The Forma de Pago and Resultados por dropdowns. What an observation stores. The QR payload was not decoded, and no send was pressed.

Until those are captured, their fields stay unknown. Menu names are not a schema.
