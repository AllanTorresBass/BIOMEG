# Integration — currencies

**Architecture status:** Multi-currency charging is published. There is no published rate service.  
**Related:** [Billing and payments](../modules/billing-and-payments.md), [Data store](data-store.md), workflow step [Admit and bill](../workflow/01-admit-and-bill.md)

A live session on 30 October 2026 is transcribed in [../session/README.md](../session/README.md). Its shell shows Tasa BCV, and its invoice shows USD and bolívar totals. Whether the rate is typed or fetched is still not shown. See [../session/facturacion.md](../session/facturacion.md).

## Contract, as published

| | |
|---|---|
| Behavior | “Ingreso y facturación multitasa.” Patients can be charged in more than one currency |
| Where | The admission and billing module |
| Currencies named | None. Bolívar, dollar, and sol are not listed |
| Rate source | Not published |
| Mixed currencies on one invoice | Not published |

In Venezuelan practice, multitasa usually means a reference price converted at a rate that changes often. That local meaning is context. It is not a sentence on the SICOEXC site.

## Where it sits

A rate can enter the system in three ways. The vendor has not chosen among them.

| Source | Architectural consequence |
|---|---|
| A person types today’s rate | No external integration. The store must keep the rate that was used |
| The system pulls an official or market rate | An outbound dependency, unpublished |
| Each price is stored already in each currency | No conversion at sale. Still a data design, unpublished |

Whichever source is real, the charge has to freeze the rate and the currency on that visit. If the master rate changes the next morning, yesterday’s invoice cannot change. That freeze is **inferred** from the need for a fiscal document to stay stable. It is not described.

## Boundary with other money features

| Feature | Relationship |
|---|---|
| [Cashea](integration-cashea.md) | A method of paying a charge that already has a currency |
| [Fiscal](integration-fiscal.md) | The legal document for that charge. Currency rules of SENIAT are the laboratory’s obligation. The product’s support for them is only the homologation claim |
| Clinical results | No published link between currency and the result path |

Statistics of results are not statistics of revenue. Do not extend this integration into a financial warehouse.

## Open questions

1. Which currencies does version 9.0 support in Venezuela and in Peru?
2. Is the rate typed, fetched, or both?
3. Is the rate stored on each invoice line?
4. Can one visit be paid partly in each of two currencies?
