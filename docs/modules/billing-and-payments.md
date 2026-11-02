# Billing and payments

**Catalog:** Multi-rate admission and billing. Payment methods, including Cashea. Fiscal homologation with SENIAT in Venezuela, and country-adapted fiscal options.  
**Release named by the vendor:** 9.0  
**Evidence:** [Published] on the services page and the about page.

Billing is the commercial close of [patient admission](patient-admission.md). Version 9.0 presents charging, currencies, and payment methods as part of intake, not as a separate accounting product. The about page adds that homologated invoicing is a reason to choose the system, because it avoids fines.

## Published behavior

- Patients can be charged in more than one currency (“ingreso y facturación multitasa”, “múltiples tipos de monedas”).
- Payment methods include modern and local options. The only method named is **Cashea**.
- The admission module itself “soporta múltiples tipos de monedas y métodos de pago modernos.”
- The vendor says the system is homologated by **SENIAT** in Venezuela and complies with current fiscal rules.
- Fiscal and sanitary options can be adapted by country (“según el país”). No country other than Venezuela is named in the fiscal claim.
- The about page calls this “facturación homologada” and links it to avoiding fines.
- “Facturación automática” appears in the general product description. The site does not say what is automatic: price lookup, tax calculation, document numbering, or sending the invoice.

SENIAT homologation is a **vendor claim**. This research did not find an independent SENIAT listing that confirms it.

## Cashea

Cashea is a Venezuelan buy-now-pay-later service. The services page names it as an integrated payment method. Nothing is published about:

- whether the laboratory receives the full fee at once and Cashea collects installments from the patient
- which party stores the installment plan
- what the system records when a Cashea payment fails or is reversed
- whether Cashea is available outside Venezuela

## Currencies

“Multitasa” in Venezuelan laboratory software usually means a price in a reference currency converted at one or more official or commercial rates on the day of the sale. The vendor says multiple currencies can be used to charge the patient. It does not publish:

- which currencies (bolívar, US dollar, sol, and others are not listed)
- who maintains the rate, or how often it changes
- whether one invoice can mix currencies
- how a rate is frozen on a document so a later rate change does not rewrite history

## Fiscal behavior

| Topic | Published | Not published |
|---|---|---|
| Venezuela | SENIAT homologation claimed for version 9.0 | Providencia number, invoice type (digital invoice, fiscal printer, forma libre), control-number source, credit and debit notes |
| Other countries | Adaptation of fiscal and sanitary rules is claimed | SUNAT, DGII, SAT, or any other authority is not named. No matrix by country |
| Document lifecycle | Not stated | Issue, reprint, annul, and the six-year retention SENIAT expects of digital-invoice users are not described for this product |
| Audit access | Not stated | Whether the tax authority can consult the laboratory’s billing database |

## Who uses it

Reception and secretarial staff are the roles that ordinarily collect payment at admission. That assignment is **inferred** from the role names. The vendor does not publish a cashier role, a cash-closing function, or a daily reconciliation.

Physicians are named as concurrent users. Physician commissions are **not** a published feature. Do not treat billing as a commission module.

## Place in the flow

Billing sits on the admission. The published wording joins them: “ingreso y facturación” and “atención y facturación.” A result can still be produced later by the analyzer, result entry, validation, and delivery modules. The vendor does not say whether an unpaid admission can receive results.

## What the module must handle

**Inferred** from multi-currency charging plus a named payment method plus a fiscal claim:

| Concern | Why it is required |
|---|---|
| Price for an exam | Otherwise a multi-currency charge cannot be calculated |
| Rate applied at the time of the sale | “Multitasa” is meaningless if the rate is not stored with the charge |
| Payment record | Cashea and other methods have to be distinguishable |
| Fiscal document | Homologation implies a numbered invoice or equivalent, not only an internal receipt |
| Link to the admission | Billing is published as part of patient intake |

Price lists, discounts, insurers, corporate accounts, and credit sales are normal in this market. They are **not published** for SICOEXC. The session does show Lista de Precios, a discount field, Ingreso Empresa, and a Seguro/Empresa cost type. See [../session/facturacion.md](../session/facturacion.md).

## Relationships

| Module | Link |
|---|---|
| [Patient admission](patient-admission.md) | The visit being charged |
| [Test catalog](test-catalog.md) | The exams that generate charge lines |
| [Result delivery](result-delivery.md) | No published rule ties payment status to WhatsApp or email release |
| [Statistical reports](statistical-reports.md) | The CEO mentions statistics of results, not of sales |

## Open questions

1. Which document does SENIAT homologation cover, and can the vendor show the authorization?
2. Which currencies and rate sources are supported in Venezuela and in Peru?
3. Is there a cash closing, a shift report, or only a payment on the admission?
4. Are credit sales, insurers, and corporate clients in version 9.0?
5. Can a payment be reversed, and does that reversal produce a fiscal credit note?
