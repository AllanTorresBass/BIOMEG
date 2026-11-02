# Desktop client

**Architecture status:** The Windows desktop placement is observed. The programming language is a hypothesis.  
**Related:** [Observed runtime](observed-runtime.md), [Data store](data-store.md), [Report engine](report-engine.md), [Users and concurrent work](../modules/users-and-concurrent-work.md)

The program staff use all day is a desktop application on the laboratory’s PCs. It is **inferred** to be the system of record for admission, samples, and results. The public website is not this program. The 30 October 2026 session shows the real menu bar and toolbar; see [../session/README.md](../session/README.md). Language is still a hypothesis.

## Evidence

| Point | Label |
|---|---|
| Monitors at reception and in the lab show a windowed application, not a phone app and not the WordPress theme of labsicoexc.com | Observed |
| More than one PC in a site runs it | Observed |
| Roles work simultaneously: receptionist, auxiliary, secretary, bioanalyst, physician | Published |
| Miguel Dias, CTO, lists Visual Basic 6.0 among the languages he programs in | Published on his profile. **Not** a statement that SICOEXC is written in Visual Basic |

Visual Basic 6.0 would fit an older Windows LIS that is still in production. It is also a skill a founder can have without the current version being a VB6 executable. Version 9.0 may be another language, a rewrite, or the same client with new services around it. Treat “VB6 client” as the weakest part of the hypothesis.

## What this component is responsible for

**Inferred** from where the screens sit in the photographs and from the workflow those screens have to support:

| Responsibility | Workflow step |
|---|---|
| Register the patient and open the visit | [Admit and bill](../workflow/01-admit-and-bill.md) |
| Choose exams | [Order from the catalog](../workflow/02-order-from-catalog.md) |
| Follow the sample | [Track the sample](../workflow/03-track-the-sample.md) |
| Type results the analyzer did not send | [Produce the result](../workflow/04-produce-the-result.md) |
| Release results | [Validate](../workflow/05-validate.md) |
| Issue the laboratory’s report | [Report](../workflow/06-report.md) |
| Start delivery, if sending is a button in this program | [Deliver](../workflow/07-deliver.md). The automatic WhatsApp path may live outside this client |

Analyzer traffic may be read by this client or by a small companion program on the same PC. The vendor says the system reads analyzers. It does not say which process owns the serial port or the socket. See [integration-analyzers.md](integration-analyzers.md).

## Boundaries

```text
Staff  →  desktop client  →  shared store
                │
                ├─→ analyzer line (process owner unknown)
                ├─→ report output (engine unknown)
                └─→ delivery and payment services (may leave the PC)
```

The client is inside the laboratory’s trust boundary. WhatsApp, Cashea, and a tax authority are outside it. A design that puts patient results on a PC without a shared store cannot explain two receptionists opening the same visit. The shared store is [data-store.md](data-store.md).

## What is not known about the client

- Executable name, install path, and whether it needs a local runtime.
- Online-only or able to keep working if the server on the LAN is down.
- How a user signs in. The only published login sentence belongs to the website panel.
- Record locking when two people edit one admission. The vendor says the work is “ordenada” and does not define it.
- Whether physicians use this same client or another one.
- Automatic update versus a technician visit. The company sells adaptation to each laboratory, which is compatible with a technician-installed client and proves nothing about the mechanism.

## Open questions

1. Is version 9.0 still a native Windows executable?
2. One codebase for every country, or a build per fiscal regime?
3. Can the bench PC run if the reception PC is off?
4. Where are logs written when an analyzer message fails?
