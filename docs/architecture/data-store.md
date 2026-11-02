# Data store

**Architecture status:** A shared store is inferred from multi-PC use. The engine is not published. This file is not a schema.  
**Related:** [Desktop client](desktop-client.md), [Observed runtime](observed-runtime.md). Conceptual records are section 7 of [the research dossier](../sicoexc-research.md). Do not copy those records into tables and call them SICOEXC.

Mantenimiento includes **Respaldo de la BD**. The product therefore exposes a database backup command. The 30 October 2026 session did not open it, so the engine, path, and schedule are still unknown. See [../session/mantenimiento.md](../session/mantenimiento.md).

## Evidence

| Point | Label |
|---|---|
| Several PCs in one laboratory run the program | Observed. That they run at the same time is the vendor's claim |
| Reception, the bench, bioanalysts, and physicians are expected to work on the same operation | Published |
| The about page sells “centralización de datos” | Published. No storage design |
| The CEO’s public profile describes him as a database administrator | Published biography. Not a product diagram |
| The CTO lists Microsoft SQL Server and MySQL | Published skills. The product does not choose between them |

Centralized data plus concurrent PCs is how a laboratory LIS usually behaves. The photographs never show the server. A shared SQL database is the best fit for the CTO’s skills and for concurrent admission and results. It is still a hypothesis. A shared file, Microsoft Access, or a vendor-hosted database would also produce the same photographs.

## Hypothesis

```text
PC at reception ──┐
PC at the bench ──┼──►  one store per laboratory installation
PC for validation ┘         engine unpublished
```

“One store per laboratory” is the conservative reading of the photographs, which are single sites. A vendor-hosted store for many laboratories is possible and **not published**. The company’s offices in two countries are not evidence of one database.

SQL Server and MySQL cannot both be “the” engine. Listing both on a résumé means the founder can run either. Version 9.0 might use one of them, or a different engine entirely.

## What the store has to hold

These are responsibilities, not table names. They are **inferred** from features that are published.

| Responsibility | Because |
|---|---|
| Patients and visits survive the day | Registration and later delivery |
| Many users write the same visit | Concurrent roles |
| Exam definitions outlive a single visit | A catalog of 600+ exams |
| Results keep their origin | Manual entry and analyzer import both exist |
| A released result stays stable enough for a QR | Authenticity of the issued report |
| Money keeps the rate used that day | Multitasa billing |
| History can be opened quickly | “Trazabilidad de exámenes rápida” |

Whether history is an audit table, a status column, or a paper log outside the database is **not published**. Fast traceability only says the laboratory can find the path. It does not say the database stores every change. The session's Mantenimiento has an Auditoría command, not opened.

## Boundaries

| Crosses into the store | Does not have to live in the clinical store |
|---|---|
| Admission, orders, samples, results, validation, users | The WordPress brochure |
| Prices and payments, if billing is in the same product | Cashea’s own installment ledger. The laboratory may store only a reference |
| Analyzer maps | The analyzer’s internal memory |
| The document that was issued, or a key to it | WhatsApp’s message store |

Mixing the website shop (`/pago/`, including test-mode labels) with the clinical database would be a serious boundary error. Nothing shows that the marketing checkout writes into laboratory data. Keep them apart until the vendor says otherwise. See [web-layer.md](web-layer.md).

## Backup, retention, and access

Not published for the clinical store:

- Backup product, frequency, or who holds the copies
- Encryption at rest or on the wire between the PC and the store
- Retention. The website privacy notice does not apply to this database
- A laboratory’s export when it leaves SICOEXC
- Row-level access so a physician sees only that physician’s patients

The SENIAT claim, if it refers to digital invoicing, usually implies the taxpayer can reproduce fiscal documents for years. That obligation is the laboratory’s. The product’s backup design for it is **not published**. See [integration-fiscal.md](integration-fiscal.md).

## Open questions

1. Which engine and which major version does 9.0 install?
2. Is the server a PC on the laboratory LAN or a service the vendor hosts?
3. One database per site, or one database for a chain?
4. What is the backup and restore procedure?
5. Can the laboratory read its own data with a report tool, or only through SICOEXC?
