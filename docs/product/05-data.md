# Data

**Edges:** [04-edges.md](04-edges.md)  
**Event names:** [../brand/08-data-lifecycle.md](../brand/08-data-lifecycle.md) and [06-access-control.md](06-access-control.md)  
**Roles:** [06-access-control.md](06-access-control.md)

This page is the visit-level answer. It says when a fact starts to exist, which Spanish surface shows it, which channel can take it out of the laboratory, and why it is kept. The audit event names are in the brand lifecycle and the access-control page.

## Client

| Question | Answer |
|---|---|
| Why | The next order and the portal have to find the same person |
| When | The first Guardar in Clientes. Not the first factura. A later Modificar updates the master. Fusionar moves orders and soft-deletes the source. Desactivar and Eliminar change visibility, not the orders |
| Where | Clientes. The Cliente step of Nueva orden. The patient header on the order. The portal header after sign-in |
| How | One name, a cédula pair or Sin verificar, Fecha de nac., computed age, sex, teléfono, email |
| Leaving the laboratory | The issued report prints the name, the cédula, the age, the sex, and the phone. Email stays off the paper. A renamed client does not rewrite an issued PDF |

A complete cédula is unique among clients that are not soft-deleted. The portal uses a keyed hash of laboratory, type, and number. It does not store the digits in the attempt log.

## Order

| Question | Answer |
|---|---|
| Why | One visit binds the client, the exams, the convenio, the money, and the results |
| When | Guardar on Pago, after a client is selected and at least one exam exists. N° orden and Factura N° are assigned then. Fecha reporte is written at the first Liberar and updated by each later Liberar of that order |
| Where | The order, Hoja de trabajo, the result chip, Mis visitas |
| How | The client id, not a retyped person. Tipo de costo and the price column are both stored. The BCV rate is copied from the shell at save |
| Leaving the laboratory | The clinical report prints the header. The factura prints the money. A reprint is a copy of the stored document |

An order for an inactive client is not created. A same-day repeated exam stores the motivo with the order.

## Result

| Question | Answer |
|---|---|
| Why | The cell is the care record and the text the report prints |
| When | On leaving the cell in Cargar resultados. Liberar, per section, opens it to reception and the portal and freezes it |
| Where | The result grid. The issued report. The portal detail after Liberar |
| How | Text, so a number and a word share the column. Marca is stored with the line. An empty section is not stored as a blank result |
| Leaving the laboratory | The PDF is a copy of the released lines. Releasing a correction writes a new issue at once, marks the old one Reemplazado, and creates a resend task from the earlier deliveries. The previous text stays in the audit history |

The portal lists a Pendiente order with its date and number and no grid. A partial order shows its released sections, labeled partial.

## Invoice and payment

| Question | Answer |
|---|---|
| Why | The laboratory reprints facturas and has to show IVA, IGTF, both currencies, abono, and resta |
| When | With the order save for the header and the lines. Each payment amount as it is entered. Abono from Agregar abono. The rate is not replaced when the shell rate later changes |
| Where | The Pago step, the totals, the libros once their columns are known |
| How | The instruments captured on the October invoice, plus convenio when that channel is chosen |
| Leaving the laboratory | A fiscal copy waits until Control N° is a number. Reprint stores who printed and when |

Sin verificar reaches this write only with the billing party’s complete cédula.

## Portal session and delivery

| Question | Answer |
|---|---|
| Why | The client can fetch a released report, and the laboratory can see that a send happened |
| When | Portal sign-in, after a complete cédula, the matching Fecha de nac. on a client with at least one order, and a one-time code. PDF, WhatsApp, and correo after Liberar, or after a bioanalyst approves an incomplete staff send. The portal shows only released sections, labeled partial |
| Where | Ingresar, Mis visitas, the preview actions, the QR page |
| How | The session holds the ids of clients matching both the cédula and Fecha de nac., the display cédula, the name, and an expiry three hours ahead. It also ends after 15 idle minutes. No password is stored. A failed attempt stores the keyed hash and the address. A download stores an audit view |
| Leaving the laboratory | WhatsApp uses teléfono. Correo uses email. The message is a portal link, or an attachment with recorded consent. See [10-security-baseline.md](10-security-baseline.md#a04-cryptographic-failures). The provider is **Unknown**. A failed send stores the failure and leaves the order as it was |

A soft-deleted client has no session. An inactive client still can, because Desactivar does not set the deleted time.

## What this page does not open

Tube, barcode, and analyzer payload stay **Unknown**. Modificar valores stores nothing. Estadísticas and Evolución de pacientes have no columns yet. A backup copies the store and is not edited as if it were Clientes.
