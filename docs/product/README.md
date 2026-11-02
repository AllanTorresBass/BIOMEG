# BIOMEG application

This folder says what the BIOMEG application is and how a client moves through it. The current program, captured on 30 October 2026, stays evidence in [../session/](../session/) and [../workflow/](../workflow/). Colors, components, and field display stay in [../brand/](../brand/).

The documents here are in English. The application is in Spanish.

## Which sentence wins

A design rule in this folder wins over a design rule in [../brand/](../brand/) when they describe behavior: who is saved, when a cédula is required, and how the portal opens. [../brand/](../brand/) wins for color, type, and layout. A sentence about what was on a screen on 30 October 2026 follows [../session/](../session/). If a short edge line in [02-client-flow.md](02-client-flow.md) differs from [04-edges.md](04-edges.md), the edge page wins. [04-edges.md](04-edges.md) states what is shown, stored, and refused for each client and laboratory edge. [06-access-control.md](06-access-control.md) wins on who may run a command and on access edge cases.

## Labels

| Label | Meaning |
|---|---|
| **Observed** | Printed, or on a screen from 30 October 2026 |
| **Design rule** | How the new application behaves. A rule taken from MediLab is marked as such |
| **Unknown** | A real command whose form was not opened |

Patient names, cédulas, and telephone numbers from the October preview are not copied here.

## Documents

| Order | File | What it settles |
|---|---|---|
| 1 | [01-application-type.md](01-application-type.md) | The kind of system BIOMEG is, and what it leaves out |
| 2 | [02-client-flow.md](02-client-flow.md) | The client, from search through the visit, the result, and the portal, including the edge catalog |
| 3 | [03-processes.md](03-processes.md) | Cash, fiscal documents, registries, and reports after the client is on an order |
| 4 | [04-edges.md](04-edges.md) | What each client edge shows, stores, and refuses, then the October laboratory edges |
| 5 | [05-data.md](05-data.md) | How, when, where, and why the client, the order, the result, and the portal session are kept |
| 6 | [06-access-control.md](06-access-control.md) | Who may run each command, in which state, with which gesture, and what is recorded |
| 7 | [07-rule-reference.md](07-rule-reference.md) | How a decision reads the table, and each row's command names and conditions |
| 8 | [08-logical-data-model.md](08-logical-data-model.md) | Every record and field the other pages require, in one place. It adds no behavior |
| 9 | [09-audit-log.md](09-audit-log.md) | What the audit log records, how it's protected, read, and reviewed, including best practices awaiting confirmation |
| 10 | [10-security-baseline.md](10-security-baseline.md) | The minimum security, by OWASP Top 10 category, and what must be true before real patient data |
| 11 | [11-outage-procedure.md](11-outage-procedure.md) | A draft of how the laboratory works and recovers when the system is down |

## Reading order

1. The application type, before any screen.
2. The client flow, before admission or the portal.
3. The rest of the day, for billing and the back office.
4. The edge catalog, before copying a MediLab or SICOEXC behavior.
5. The data page, before deciding what a save or a portal sign-in stores.
6. Access control, before building any command.
7. The logical data model, before designing a schema.

The client path follows MediLab’s structure: the person exists in Clientes before an order exists, and the same cédula, with Fecha de nac. and a one-time code, opens the portal. Clinical results, the factura, and the October defects stay BIOMEG’s. MediLab’s imaging reports, several sites, nómina, honorarios, and finiquitos are not part of this application.
