# The rest of the laboratory day

**Client path:** [02-client-flow.md](02-client-flow.md)  
**Catalog of commands:** [../brand/07-feature-catalog.md](../brand/07-feature-catalog.md)

These steps start after the client is on an order. They do not create the client and they do not repeat Nueva orden. A command whose form was not opened keeps its name and leaves its columns **Unknown**.

## Payments after the factura

| Step | Who | What it writes | Why |
|---|---|---|---|
| Agregar abono | Recepción, Administración | An amount against the factura. Abono increases. Resta decreases | A visit can be partly paid |
| Registro de pagos | Administración | A payment row. Columns beyond the invoice instruments are **Unknown** | The cash drawer has to list what was taken |
| Cobros Cashea | Administración | A collection. The blank invoice has no Cashea box | Cashea is its own command and the report Ventas por Cashea |
| Cierre de caja | Recepción, Administración | The session day’s totals for this user, the rate, and Resta still open | The drawer closes without deleting payments |
| Cierre mensual | Administración | A month close. It does not run the daily close | The month is a separate act |
| Reverse a payment | Recepción for its own same-day payment. Otherwise Administración | A reversal row with a motivo. The original stays | A typing error must not stay as a wrong total |
| Close another user’s drawer, reopen a close | Administración | The event, with a motivo | Someone can be absent at the end of a shift |

The invoice stays open while Resta is not zero.

## Fiscal documents

| Step | What it does |
|---|---|
| Nota de crédito, Nota de débito | A new document against one factura |
| Re-imprimir factura, notas, retenciones, órdenes | Opens the stored document, marks the paper COPIA, and does not allocate a new number |
| Tipos de retenciones (ISLR) | A registry of retention types. Columns **Unknown** |
| Reversar relación | A reversal. The document a “relación” is remains **Unknown**. The original is not deleted |

Libro de ventas, Resumen de IGTF, ARCV, the ISLR XML, and Retenciones del IVA are read-only reports. Descargar XML exists for the ISLR command. The other libros offer Imprimir. Their columns are **Unknown**.

## Catalog, prices, and cost

Lista de precios is the inquiry: five columns, one currency, a status word. Precio exámenes is the edit. Aplicar aumento general shows the percent and the columns before it writes. Precio sábado applies to the whole laboratory, by calendar or by Administración’s switch, and each priced line says whether it applied.

Insumos, salarios, and costos de reactivos are three cost pools. Promedios pacientes/pruebas does not display an average until a formula is known. None of these fill the client’s price.

## Registries and inventory

Médicos, empresas, proveedores, reactivos, equipos, and the bacteriology masters are name registries. Reception reads médicos and empresas because the order dropdowns need them. Administración edits them, except the bacteriology masters, which the bioanalyst edits. A renamed physician changes the dropdown and leaves issued reports with the previous name.

Órdenes de compra and Restar inventario are real commands. Item columns are **Unknown**. Restar inventario asks for a confirm before it writes a quantity.

## Reading across visits

Evolución de pacientes and Estadísticas are read-only. They are not a gate on Liberar. Their columns are **Unknown**. Until a capture names the columns, the screen says that the columns are not captured and does not invent them.

## Maintenance that is not a client step

Nuevo usuario, Clave, Respaldo de la BD, and Auditoría sit beside the day. Who may run them is in [06-access-control.md](06-access-control.md). A backup is a copy of the store. It is not a second place to edit clients. Modificar valores writes nothing until a capture shows which values it edits. See [04-edges.md](04-edges.md).
