# SICOEXC architecture

This folder records components inferred from public sources and the October session. It is not the proposal for the new application. The map is [../README.md](../README.md). The proposal is [../product/README.md](../product/README.md).

This set expands section 5 of [../sicoexc-research.md](../sicoexc-research.md). Soluciones Informáticas SM has not published an architecture document, a deployment guide, or a technology stack. These notes separate what was seen from what the founder’s public skills only suggest.

Labels match the [module notes](../modules/README.md) and the [workflow](../workflow/README.md):

| Label | Meaning |
|---|---|
| **Published** | Stated on labsicoexc.com or in a founder’s public profile or project text |
| **Observed** | Visible in vendor photos or in the marketing site’s construction. Sightings from the 30 October 2026 session are cited to [../session/](../session/) |
| **Inferred** | A hypothesis that fits the evidence. Not confirmed |
| **Not published** | Absent from public sources |

Version in scope: **9.0**, the only release named in marketing. No release notes or upgrade path are published. Researched 29 October 2026.

## Documents

| Topic | File | Confidence |
|---|---|---|
| How to read the shape | This file | — |
| What the installation looks like | [observed-runtime.md](observed-runtime.md) | Observed |
| Laboratory application | [desktop-client.md](desktop-client.md) | Observed on Windows PCs. Language is a hypothesis |
| Shared data | [data-store.md](data-store.md) | Inferred. Engine unknown |
| Printed and issued results | [report-engine.md](report-engine.md) | Inferred |
| Brochure, login, and delivery services | [web-layer.md](web-layer.md) | WordPress site is observed. The rest is inferred |
| Analyzers | [integration-analyzers.md](integration-analyzers.md) | Published behavior. Protocol unknown |
| WhatsApp | [integration-whatsapp.md](integration-whatsapp.md) | Published outbound send. Provider unknown |
| Email | [integration-email.md](integration-email.md) | Published channel. Provider unknown |
| QR | [integration-qr.md](integration-qr.md) | Published mark on the report. Payload unknown |
| Cashea | [integration-cashea.md](integration-cashea.md) | Named payment method. Contract unknown |
| Currencies | [integration-currencies.md](integration-currencies.md) | Published multitasa billing. Rate source unknown |
| Fiscal rules | [integration-fiscal.md](integration-fiscal.md) | SENIAT claim for Venezuela. Other countries unnamed |

Business behavior of each capability stays in the module notes. These files are about components, boundaries, and evidence.

## Shape

```text
Laboratory LAN (observed: several Windows PCs in one site)
┌─────────────────────────────────────────────────────────┐
│  Desktop client on reception and bench PCs             │
│  Language and report engine: not published             │
│                          │                             │
│                          ▼                             │
│              Shared clinical store                    │
│              Engine: not published                    │
└────────────┬───────────────────────┬──────────────────┘
             │                       │
             ▼                       ▼
     Analyzers (bidirectional         Outside services
     claim; only result-read          WhatsApp, email, Cashea,
     is described)                    fiscal authority

     Shared clinical store → report component → Patient document with QR

     Marketing site (WordPress) is a separate system.
     A client-panel login exists. What it opens is unknown.
```

The box around the desktop client and the store is the part client photographs support. Everything outside that box is a published integration with an unpublished mechanism. The web layer may be a second program, a few scripts, or only the vendor’s brochure. Those three readings are all still open. See [web-layer.md](web-layer.md).

## What not to treat as architecture

| Source | Why it is not a specification |
|---|---|
| Miguel Dias’s public skill list (Visual Basic 6.0, PHP, MySQL, SQL Server, Crystal Reports, HTML, CSS, JavaScript) | A résumé. He is the CTO. The product never says it is built with those tools |
| WordPress on labsicoexc.com | The vendor’s website. Confirmed by the site’s own `/wp-json` endpoints. It is not the LIS |
| Images on the “Interfaz LIS” page named “ChatGPT Image” | Generated pictures, not deployment diagrams |
| Offices in Maracay and Huancayo | Company locations. Not a multi-site product design |
| The conceptual records in the research dossier, section 7 | A reading of features. Not a schema |

## Version 9.0 as a boundary

WhatsApp, Cashea, QR codes, and multi-currency billing are the behaviors the vendor attaches to version 9.0. The desktop program is visible in client photographs that are not dated to that version. A plausible history is an older Windows client with newer delivery and payment services added beside it. Nothing public confirms or denies that split. Do not draw a microservice diagram for it.
