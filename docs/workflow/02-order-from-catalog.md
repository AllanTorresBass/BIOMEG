# Step 2 — Order from the catalog

**Workflow status:** Inferred as its own step. The vendor publishes a catalog of more than 600 exams and an admission module, not a separate ordering manual.  
**Modules:** [Test catalog](../modules/test-catalog.md), [Patient admission](../modules/patient-admission.md)  
**Previous:** [Admit and bill](01-admit-and-bill.md)  
**Next:** [Track the sample](03-track-the-sample.md)

**Named command:** Indique Examen and the EXAMEN list on Facturación de Consultas. Prices live on Lista de Precios, not on this list. See [../session/facturacion.md](../session/facturacion.md) and [../session/lista-de-precios.md](../session/lista-de-precios.md).

## Purpose

Decide which exams this visit will run. The catalog is master data. This step is the moment those exams become lines on one admission.

## When it starts and ends

| | |
|---|---|
| Starts | A visit exists, or it is being created in step 1 |
| Ends | One or more catalog exams are attached to that visit |
| Shares a screen with step 1 | Likely. “Ingreso y facturación” plus a catalog does not require two menus. The split is for reading, not a confirmed navigation |

Ordering after the patient has left, or adding an exam to a visit already in analysis, is **not published**.

## Published behavior used here

- More than 600 clinical diagnostic exams are available.
- Admission is where the laboratory takes the patient in.
- Report layouts can differ by laboratory, so the exam that is ordered must be one the laboratory’s layout knows how to print.
- Analyzer connectivity later maps instrument output onto exams. An ordered exam that has no instrument map can still be typed in step 4.

The marketing URL `lista-de-examenes` is a photo gallery. It is not the ordering screen and not the list of 600 exams.

## Actors

| Role | Part in this step | Label |
|---|---|---|
| Receptionist or secretary | Selects the exams the patient asked for or arrived with | Inferred |
| Physician | Is the clinical requester in ordinary practice. A physician ordering inside SICOEXC is not published | Not published |
| Bioanalyst | May add or change exams after seeing the sample. Not published | Not published |

## What happens

1. Staff search or pick exams from the catalog. **Inferred** from the existence of a catalog larger than a person can scroll without a search. Search itself is not described.
2. Each chosen exam becomes a line on the visit. **Inferred.** A charge, a sample, and a result all need that line.
3. Step 1 prices those lines. If pricing is on the same screen, finishing the order also finishes the charge. **Published** only as joined intake and billing.
4. The visit is ready for a sample. The vendor’s quality-control sentence is about following samples, which presupposes that the exams have been chosen.

Profiles (a hemogram that expands into many analytes) may be one pick or many. That structure is **not published**.

## Inputs

| Input | Status |
|---|---|
| An open visit from step 1 | Inferred as necessary |
| The catalog | Published as 600+ exams. The laboratory’s enabled subset is unknown |
| A requester | Not published. Most labs store the ordering physician on the order |

## Outputs

| Output | Used by |
|---|---|
| Order lines | Billing, sample tracking, result entry, the analyzer map, the report, and statistics |
| A priceable set of exams | Step 1, if billing is calculated from the lines |
| Work for the bench | Step 3. A worklist or label is the usual handoff and is **not published** |

## Handoff

[Track the sample](03-track-the-sample.md) needs at least one order line. An exam with no sample (a calculation, a send-out) is not discussed by the vendor. Assume a sample until a given exam is known to be otherwise. That assumption is **inferred** and will be wrong for some tests.

## Not part of this step

- Entering the numeric result
- Defining a new exam. Catalog maintenance may exist and is not described
- Reference ranges, tubes, and patient preparation. Not published
- Appointments

## Open questions

1. Is ordering a grid on the admission screen or its own menu?
2. Can an exam be added after the sample was received?
3. Does the catalog show prices and turnaround time at the moment of ordering?
4. Are panels a single line?
