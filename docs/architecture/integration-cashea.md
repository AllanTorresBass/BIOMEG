# Integration — Cashea

**Architecture status:** Named as a payment method inside version 9.0. The technical contract is not published.  
**Related:** [Billing and payments](../modules/billing-and-payments.md), workflow step [Admit and bill](../workflow/01-admit-and-bill.md)

The live menu names Cashea twice: Administrativo **Cobros Cashea**, and Reportes **Ventas por Cashea**. The blank invoice does not show a Cashea box. The payment dropdown on that form was not opened. See [../session/administrativo.md](../session/administrativo.md) and [../session/reportes.md](../session/reportes.md).

## Contract, as published

| | |
|---|---|
| Role | A payment method on patient admission and billing |
| Product | Cashea, a Venezuelan buy-now-pay-later service |
| Other methods | “Métodos de pago modernos y locales” as a class. No second brand is named. The session's invoice lists Zelle and pago móvil |
| API, merchant id, or settlement | Not published |
| Countries | Not stated. Cashea is a Venezuelan service. The product is also sold in Peru and elsewhere |

The marketing checkout at `labsicoexc.com/pago/` is a website cart, including test-mode text. It is not this integration. Laboratory payments happen in the desktop product. See [web-layer.md](web-layer.md).

## Where it sits

```text
Admission screen  →  payment record in the clinical or billing store
                 ↘
                   Cashea (external)  — installment agreement with the patient
```

Two settlements are possible and neither is confirmed:

| Model | What SICOEXC must store | What Cashea stores |
|---|---|---|
| The laboratory is paid, and Cashea collects from the patient | Approval id and amount | The installment plan |
| The laboratory records only that Cashea was chosen | A method flag | Amount and plan |

Physician commissions are not part of this integration. They are not a published feature.

## Boundary

Money approval crosses out of the laboratory to Cashea. The clinical result path does not. Nothing published ties “Cashea approved” to “WhatsApp may send.” A laboratory might add that rule locally. It is not an architectural fact.

Reversals and failed approvals are unpublished. A fiscal invoice may already have been issued in [integration-fiscal.md](integration-fiscal.md) before Cashea responds. That race is a real design problem and is not addressed in public material.

## Open questions

1. Is Cashea called from the desktop client at the moment of admission?
2. What identifier is stored when the payment is approved?
3. Who is merchant of record, the laboratory or the vendor?
4. Is Cashea offered on installations outside Venezuela?
5. How is a rejected or cancelled Cashea payment reflected on the invoice?
