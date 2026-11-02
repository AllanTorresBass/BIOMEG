# Integration — fiscal rules

**Architecture status:** A Venezuela SENIAT claim is published. No other authority is named. No technical fiscal interface is described.  
**Related:** [Billing and payments](../modules/billing-and-payments.md), [Currencies](integration-currencies.md), [Report engine](report-engine.md)

The invoice form has FACTURA N°, CONTROL N°, I.V.A., and IGTF. Reportes lists Libro de Ventas, Resumen de IGTF, Comprobantes de Retenciones Varias (ARCV), XML de Retenciones de ISLR, and Retenciones del IVA. Those are command names from the 30 October 2026 session. No sample of those fiscal reports was captured. See [../session/facturacion.md](../session/facturacion.md) and [../session/reportes.md](../session/reportes.md).

## Contract, as published

| | |
|---|---|
| Venezuela | The vendor says version 9.0 is homologated by SENIAT and complies with current fiscal rules |
| Other countries | “Opciones adaptadas a regulaciones fiscales y sanitarias según el país” |
| Authorities named besides SENIAT | None. SUNAT, SAT, DGII, and others are not mentioned |
| Independent confirmation | Not found in this research. The homologation is a vendor claim |
| Sanitary rules | Mentioned in the same “según el país” sentence. No standard is cited |

The about page uses homologated invoicing as a reason to buy, because it avoids fines. That is a commercial claim about the same feature.

## What “homologated” can mean

The word does not specify the mechanism. Any of these would match the sentence, and none is confirmed:

| Mechanism | What would be in the architecture |
|---|---|
| Digital invoice under a SENIAT providencia | Numbering, control numbers, a file the tax authority can consult, retention for years |
| An authorized fiscal printer | A device driver, separate from the clinical report |
| Forma libre or another local format | A print layout with the laboratory’s fiscal data |
| A third-party fiscal engine | An integration similar to Cashea, with its own credentials |

Do not pick one and document it as SICOEXC. Ask the vendor for the authorization.

Clinical report printing and fiscal printing are different outputs. The QR on the patient result is not, on the evidence, a tax QR. See [integration-qr.md](integration-qr.md) and [report-engine.md](report-engine.md).

## Other countries

The product is marketed in 13 countries. The fiscal sentence promises adaptation and publishes no matrix. An installation in Peru is not evidence of SUNAT electronic invoicing. Sanitary adaptation is equally unspecified: no mention of a ministry of health message, a notifiable-disease feed, or a quality standard.

Architecturally, country adaptation has to be a configuration or a separate build. Which of those version 9.0 uses is **not published**.

## Boundary

```text
Admission charge  →  fiscal component (unknown)
                         │
                         ├─→ document the laboratory keeps
                         └─→ tax authority, only if that channel exists
```

The clinical store may hold the invoice, or a fiscal partner may hold it. Backup and six-year reproduction, where the law requires them, are the laboratory’s duty. The product’s support for that duty is unpublished. See [data-store.md](data-store.md).

## Open questions

1. Which SENIAT regime, and can the vendor show the homologation?
2. Is the fiscal document produced inside SICOEXC or by a partner?
3. What does a credit note or an annulled invoice do?
4. Which fiscal and sanitary rules are actually implemented outside Venezuela?
5. Does “sanitarias” mean anything beyond ordinary laboratory operation?
