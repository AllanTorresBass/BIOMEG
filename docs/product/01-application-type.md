# Application type

**Brand:** BIOMEG Laboratorio Clínico  
**Language of the application:** Spanish  
**Language of this note:** English  
**Visual standard:** [../brand/README.md](../brand/README.md)

## What it is

BIOMEG is a laboratory information system for one clinical laboratory. Staff use it to find or register a client, open an order, enter results, release them, issue the report, and collect payment. The client later signs in to a portal with their cédula, Fecha de nac., and a one-time code, and downloads the released report.

The client is a master record. The next order reuses that record. The invoice does not create a second person when the cédula already exists. This is the structure of MediLab’s Pacientes module and of the first step of Nueva visita, whose short label is Cliente. It is a **design rule** for BIOMEG. The October invoice typed the person on the billing form. That form is now the later steps of the order, not the place the person is born.

Staff work is the system of record: the order, the result grid, validation, the factura, and the cash drawer. The portal, WhatsApp, email, and the QR page are ways the released report leaves. They do not edit results.

## Who it is for

| Person | Spanish role name | What they do |
|---|---|---|
| Receptionist | Recepción | Clientes, Nueva orden, payment, delivery |
| Secretary | Secretaría | The same front desk. Holds the Recepción permission set |
| Auxiliary | Auxiliar | Hoja de trabajo. Cargar resultados before release. Never Liberar |
| Bioanalyst | Bioanalista | Cargar resultados, Liberar, the issued report |
| Physician | Médico | Optional requester on the order. Reader of the delivered report. No account in the first release |
| Administrator | Administración | Factura and the money after it, registries, prices, users, backup, and Auditoría. No clinical values |
| Client | Cliente | Portal only: Mis visitas and Descargar informe |
| Holder of the paper | Público | Verification page only, with the token in the code |
| Analyzer link, sender, scheduler | Sistema | Limited to their own commands. Cannot sign in |

The vendor of the current program published these staff roles and did not publish a permission matrix. Assigning them to these screens is a **design rule**. Administración is not a vendor role. It is a **design rule** of this application. A person may hold several roles. Who may run each command is in [06-access-control.md](06-access-control.md). See [../modules/users-and-concurrent-work.md](../modules/users-and-concurrent-work.md).

## Language, money, and time

Screen titles, buttons, errors, and the issued report are Spanish. Dates are `DD/MM/YYYY`. Decimals use a comma. Thousands use a period. Money is bolívares and USD. The shell shows Tasa BCV, and every new total copies that rate. Fiscal documents already named at BIOMEG stay in scope: IVA, IGTF, ISLR, ARCV, factura, control number, credit and debit notes, and reprints.

The time zone for “today” on a duplicate-exam warning is America/Caracas, the same zone MediLab uses. That zone was not printed on the October screens. It is a **design rule**.

## What the client can do

Sign in with cédula type and number and Fecha de nac., then a one-time code sent to the phone on file. There is no password to remember. See Mis visitas, filtered as Todos, Con resultado, or Pendientes. Open a visit and download the informe when the order is Liberado. A visit that is still Incompleto shows only its released sections, labeled as partial. With no released section it is listed as Pendiente, with its date and number and no exam names. During a correction it reads En revisión and shows no grid.

MediLab shows written report text in every informe state. BIOMEG does not copy that. An empty chemistry section must not look finished. See [04-edges.md](04-edges.md).

WhatsApp, email, and the QR verification page remain. The QR page shows the order number, the laboratory name, the report date, and Liberado, Incompleto, or En revisión. It also says when an issue was replaced. It opens only with the random token in the code. It does not replace the portal.

## What stays out

These are absent from the captured BIOMEG menus and from the work this application takes from MediLab:

- Appointments and home collection
- Barcode tubes and a sample record beyond Fecha muestra
- Electronic signature and physician commissions. The password re-entry at Liberar confirms who is at the keyboard. It is not an electronic signature
- A medical-history chart
- Several sites, nómina, honorarios, and finiquitos

Inventory, purchase orders, cost pools, and the libros are in the application because the October menus name them. Their columns stay **Unknown** until a form is captured. See [03-processes.md](03-processes.md).

## Brand

The mark, the navy `#203860`, the burgundy `#6C1834`, and the files in [../../assets/brand/](../../assets/brand/) are the identity. The shell uses the emblem. Sign-in and the issued report use the full lockup. The product does not keep the SICOEXC version banner.
