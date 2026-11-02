# Outage procedure

**Security baseline:** [10-security-baseline.md](10-security-baseline.md#a10-mishandling-of-exceptional-conditions)  
**Who may act:** [06-access-control.md](06-access-control.md)

This page says how the laboratory keeps working, and recovers, when the application or its data is unavailable.

**Status: a draft for the laboratory to complete.** It's a **design rule** proposed on 1 November 2026, with no real-world testing behind it. Every number is a proposal for the owner to set. Items marked **To complete** can only come from the laboratory, and clinical steps need the lead bioanalyst's agreement. The fiscal steps need the accountant, and no part of it is legal advice. No application implements any of this.

## What can't change during an outage

These rules hold whether or not the system is up.

- A result isn't released without a signed-in bioanalyst (E-36). Paper doesn't replace Liberar.
- A fiscal number is never invented or reused.
- Nothing is backdated. An entry keeps its real time, and the real sample date stays in Fecha muestra.
- Real patient data goes only on the laboratory's paper forms, and never to a personal phone or chat.

## Proposed targets

| Target | Means | Proposed | Who sets it |
|---|---|---|---|
| Recovery point | The most recent data that could be lost | 1 hour | Owner |
| Recovery time | How long the system may be down | 4 working hours | Owner |
| Restore test | How often a real restore is tried | Every 3 months | Owner |
| Rehearsal | How often staff practice this page | Every 6 months | Owner, lead bioanalyst |

The hosting chosen has to be able to meet these targets. Each one affects its cost.

## Who does what

| Task | Role | Person |
|---|---|---|
| Declares and ends the outage | Owner, or the administrator on duty | **To complete** |
| Contacts the technical provider | Administración | **To complete** |
| Decides what to do about urgent results | Lead bioanalyst | **To complete** |
| Keeps the paper records | Recepción | **To complete** |
| Enters the paper records afterward | Recepción and Bioanalista | **To complete** |

Keep a printed copy of this page, with its contact numbers, at reception and at the bench. **To complete:** provider, owner, and lead bioanalyst contact numbers.

## 1. Declare

Declare an outage when the application can't be used, or when it refuses work with "No se pudo registrar la acción. No se guardó ningún cambio."

1. Write down the time.
2. Tell all desks.
3. Contact the technical provider.
4. If data may have been altered or exposed, also follow the [incident steps](09-audit-log.md#reviewing-it), and don't try to fix anything first.

## 2. Keep working on paper

| Work | What to do |
|---|---|
| New client | Fill in the paper form: name, cédula, Fecha de nac., sex, phone, and email. Check the cédula against the person's document |
| New order | Paper order with the exams and Fecha muestra. Use a temporary outage number (`TEMP-01`, `TEMP-02`), and never a N° orden |
| Payment | Paper receipt with the amount, instrument, and the time. **To complete with the accountant:** whether a receipt can be given, and how a factura follows |
| Rate | Use the last Tasa BCV the shell showed, and write down which one. **To complete with the accountant** |
| Bench work | Work from the paper orders. Keep analyzer printouts with the order |
| Results | Write them on the paper order. They're unreleased until entered and released in the system |
| Urgent result | **To complete by the lead bioanalyst:** which results count as urgent, and how a bioanalyst tells the physician or client. Record who was told, what, and when |
| Delivery | None by WhatsApp, email, or portal |

## 3. If the outage is only partial

| What's down | What still works |
|---|---|
| Rate limiter | Signed-in staff keep working. New sign-ins, the portal, and verification wait |
| WhatsApp or email provider | Everything except sending. The failure is stored, and sends can repeat later |
| Portal | Staff work continues. Staff deliver results |
| Audit writing | Writes and clinical reads stop on purpose, so treat this as a full outage |

## 4. Recover

1. **Check first.** The provider confirms that the system is up, and the audit chain check passes. After a restore, compare it with the outside copy of the hash.
2. **Find any lost time.** Compare the last saved work with what staff remember and hold on paper. The log records the gap.
3. **Enter the paper records, oldest first.** Search for each client before creating one. Each order gets its real N° orden, and the paper is marked with that number.
4. **Enter results second.** A second person compares them with the paper or printout. The entry time stays real.
5. **Release.** A bioanalyst reviews and releases as usual.
6. **Deliver and reconcile.** Send what's waiting. Compare the day's paper receipts with the payments entered, and close the drawer.
7. **Keep the paper.** Store it with the outage record. **To complete with counsel:** for how long.

## 5. Afterward

Within 5 working days, the owner records the following, and changes this page if needed:

- When it started and ended, and the cause
- What was lost, and how it was recovered
- Whether any patient was affected, and whether anyone must be notified, with counsel's advice
- What should change

## Rehearsal checklist

- [ ] Staff can find the printed copy and the paper forms.
- [ ] A test order goes from paper into the system, with its real number.
- [ ] A backup is restored to a separate environment, and its checksum and audit chain pass.
- [ ] The time taken is compared with the targets.
- [ ] The results are recorded, and the page is corrected.
