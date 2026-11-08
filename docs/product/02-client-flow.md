# Client flow

**Type:** [01-application-type.md](01-application-type.md)  
**Edges in full:** [04-edges.md](04-edges.md)  
**Fields already captured:** [../brand/05-data-display-models.md](../brand/05-data-display-models.md)

The client is a person in Clientes before any order exists. An order stores that person’s id. The same cédula, with Fecha de nac. and a one-time code, later opens the portal. This is the MediLab sequence. Stages that BIOMEG never captured are a **design rule** taken from MediLab, not an October observation.

```text
Buscar cliente ──► Crear cliente
        │                 │
        └────────┬────────┘
                 ▼
           Nueva orden
           1 Cliente
           2 Exámenes
           3 Personal
           4 Pago
                 │
                 ▼
        Hoja de trabajo
        Cargar resultados
        Liberar
                 │
                 ▼
        PDF, WhatsApp, correo
        Portal por cédula, Fecha de nac. y código
```

## Clientes

**Who.** Recepción.  
**Screen.** Clientes. The Pacientes menu opens only this screen. **Design rule.**  
**Must exist.** A signed-in session.  
**Writes.** The client master: one name string, cédula type and number or neither, Fecha de nac., computed Edad, sex, teléfono, email.  
**Shows.** The client list on `/clientes`. Opening a row opens the ficha on `/clientes/{id}` with tabs Ficha, Contacto, and Acciones when the role may run lifecycle commands.  
**Why.** The next order and the portal have to find the same person.

Search matches nombre or cédula. Incluir inactivos is a checkbox on the list, not a menu command. The October invoice had a dropdown beside C.I. and did not show its options. The types `V`, `E`, `J`, `P`, and `G` are the **design rule** for that dropdown: Venezolano, Extranjero, Jurídico, Pasaporte, Gobierno.

A similar name requires confirmación before a second row is saved. Fusionar, Desactivar, Eliminar, and Corregir cédula run from the Acciones tab after the operator opens the client. Fusionar, run by Administración, keeps one id on the orders. Desactivar hides the client from the default search and leaves the orders. Fecha de nac. is required. Edad is computed from that date and Fecha muestra. It is not typed. Email and teléfono stay on Contacto because Enviar correo and Enviar WhatsApp need them. Email is not printed on the clinical report.

## Nueva orden

Ingreso particular and Ingreso empresa both open this flow. Particular starts with no convenio. Empresa requires an active convenio before Pago can be saved. Tipo de costo is chosen on the order. It is not implied by which button was used.

### 1. Cliente

Siguiente stays disabled until a client is selected or created on this step. An inactive or missing client shows “Paciente no encontrado o inactivo” and does not open Exámenes.

### 2. Exámenes

At least one exam from the catalog. Each line shows tipo de costo and the price column. Those lists stay distinct. See [../brand/05-data-display-models.md](../brand/05-data-display-models.md). The total shows USD, the shell’s Tasa BCV, and bolívares. The same client, the same day, and one shared exam warns and asks for a motivo before the step continues. A voided order does not count.

### 3. Personal

Médico is optional. The October invoice left that dropdown empty. The list is Registro de médicos.

### 4. Pago

Instruments **observed** on the invoice: Efectivo USD, Zelle, Efectivo Bs, T. débito, T. crédito, Pago móvil, Transferencia, plus Banco and Referencia. Convenio is added when the path is Empresa or the channel is Convenio, and only an active convenio can be chosen. A convenio that requires a titular cannot be saved without one. Particular does not ask for a titular.

MediLab requires 4 digits for pago móvil and 6–12 for transferencia. The October dropdowns were not opened, so those lengths apply only when the captured options do not already define a reference. Until then Referencia is the field that was on screen.

Guardar assigns N° orden and Factura N°. Control N° shows a number or Pendiente. A client marked Sin verificar passes this step only with the billing party’s complete cédula on the factura.

## After the order

Hoja de trabajo lists the order for the bench. Cargar resultados fills the result grid. Liberar, per section, asks the bioanalyst to re-enter the password and sets that section Liberado and Procesado por. The order is Liberado once every section is. Empty sections stay off the report. Generar PDF, Enviar WhatsApp, and Enviar correo record the output. The provider behind WhatsApp and correo is **Unknown**. The send still stores destination, time, and operator.

This stretch is the laboratory path. MediLab’s informe images and report password are not copied.

## Portal

**Who.** The client.  
**Screen.** Ingresar, then Mis visitas.  
**Must exist.** A complete cédula and the matching Fecha de nac. on a client who has at least one order and a phone on file, a one-time code, and a released report before the grid is visible.  
**Writes.** A session and a login attempt. No password is stored.  
**Shows.** The client’s own orders.  
**Why.** The client can read a released result without a staff member resending it.

Ingresar asks for type, number, and Fecha de nac., then for a one-time code sent to the phone on file. Mis visitas filters Todos, Con resultado, and Pendientes. Descargar informe is available when the order is Liberado, and for the released sections of a partial order, labeled partial. A Pendiente row stays in the list and hides the grid. One generic error covers an unknown cédula, a wrong Fecha de nac., a client with no orders, a wrong type on a right number, and a soft-deleted client. Repeated failures pause further attempts.

## Edge cases on this path

Each case below is what the stage refuses or allows. What the screen says, what is stored, and what is refused is only in [04-edges.md](04-edges.md). If a line here differs from that page, the edge page wins.

### Identity

- The name is trimmed, spaces collapse, and the display name is title case for `es-VE`. The duplicate key ignores accents and case. An empty name is refused.
- Cédula type and number are both empty or both filled. A half pair is refused. The number is 6 to 10 digits. Punctuation is display only.
- A complete cédula is unique among clients that are not soft-deleted. Confirmación never overrides that match. Code P-01.
- No cédula is allowed and marked Sin verificar. Nombre and Fecha de nac. are still required. Sin verificar cannot open the portal. It passes Pago only with the billing party’s complete cédula.
- A similar name at or above 0.85 requires confirmación. Code P-03.
- Sex is Masculino, Femenino, or blank. Age is computed. A typed age is not stored as the source of truth.

### Change, merge, deactivate, delete

- The cédula cannot change through Modificar once any order exists, including a voided order. Corregir cédula, run by Administración with a motivo, is the only path.
- A name change updates the client and open orders. An issued PDF keeps its printed name.
- Fusionar is run by Administración with a password re-entry, and requires the surviving name retyped. Two complete, different cédulas are refused. Deshacer fusión restores the orders. Orders move. The source is soft-deleted. A client cannot be merged with themselves.
- Desactivar hides the client from search and from Nueva orden. Running it twice changes nothing. The portal still opens for that client.
- Incluir inactivos shows deactivated clients and hides soft-deleted ones.
- Eliminar is run by Administración. It is refused when an order exists in the last 30 days. Code M-02. Otherwise the client is soft-deleted. Orders remain. There is no hard delete.
- Nueva orden loads only an active client.

### Visit and portal

- Cliente and Exámenes cannot advance empty.
- The same-day shared exam requires a motivo. A voided order does not count.
- An inactive convenio cannot be selected. A required titular cannot be skipped.
- The second save of the same client or order reloads the first version.
- Portal sign-in failures share one generic error. The log stores a hash prefix, not the digits.
- Rows with the same cédula and Fecha de nac., brought over from the current program, open as one visit list until Fusionar joins them. The session lasts three hours, with a 15-minute idle timeout.
- Voided orders are omitted. Another client’s order returns “No disponible.”
