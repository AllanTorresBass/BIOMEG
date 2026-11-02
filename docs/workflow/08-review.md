# Step 8 — Review

**Workflow status:** Inferred as a management step beside the patient path, not as a gate before delivery.  
**Modules:** [Statistical reports](../modules/statistical-reports.md), [Exam traceability](../modules/exam-traceability.md)  
**Previous:** Any step that has already stored data. Placed after [delivery](07-deliver.md) because the founder’s statistical reports are of results, which exist only after step 4, and are meaningful for management after release.

**Named commands:** Reportes > Estadísticas and Reportes > Evolución de Pacientes. Both show an arrow. Neither flyout was opened, so the columns are still unknown. See [../session/reportes.md](../session/reportes.md).

## Purpose

Look back at work the laboratory has done. Two published ideas belong here, and they answer different questions.

| Question | Published claim | Module |
|---|---|---|
| What happened to this exam? | Fast exam traceability | Exam traceability |
| What do the results look like in aggregate? | Statistical reports of results | Statistical reports |

The public material gives neither one a menu name, a filter, or an example. The session names the commands.

## When it starts and ends

| | |
|---|---|
| Starts | As soon as the data the question needs has been stored. Traceability of a sample can be opened in step 3. Statistics of results wait until step 4 |
| Ends | A person has an answer. There is no published “close the day” action |
| Does not block | Steps 6 and 7. The patient does not wait for a statistical report |

This step is last in the folder so the patient path stays readable. It is not last in time.

## Published behavior used here

- The CEO’s project text includes “reportes estadísticos de los resultados.”
- The about page says exam traceability is fast.
- Version 9.0 does not repeat either sentence in its feature bullets. They remain part of the public product description.
- No report catalog is published. Volume, turnaround, abnormal counts, and revenue are all **not published**. The CEO’s phrase is statistics of **results**, not of sales, so billing figures from step 1 are not part of this claim.

## Actors

| Role | Part in this step | Label |
|---|---|---|
| Bioanalyst or laboratory director | Reads result statistics and reconstructs one exam after a complaint | Inferred. A director role is not in the published role list |
| Reception | May only need “has this result been given?” which is a traceability question | Inferred |
| Physician | May want status of an order. A physician review screen is not published | Not published |
| Receptionist, auxiliary, secretary | Published users. Access to statistics is unknown | Not published |

## What happens

### One exam

1. Someone identifies the visit or the exam. **Inferred.**
2. The system shows the path it stored: admission, sample follow-up, who wrote the value, who validated, and whether delivery was sent. Only the speed of traceability is **published**. Which of those events are actually stored is **not published**.
3. The person uses that history to answer a patient, a physician, or an inspector.

### Many results

1. Someone opens a statistical report. **Published** as a capability. The control used to open it is unknown.
2. The report aggregates results, at least by a period and by exam. Grouping is **inferred** from the words “estadísticos de los resultados.”
3. The person uses it for workload or clinical review. The business use is not stated.

Traceability that does not keep the previous value after a correction cannot reconstruct a dispute. Corrections themselves are **not published**.

## Inputs

| Input | From |
|---|---|
| Patient, visit, and time | Step 1 |
| Order lines | Step 2 |
| Sample follow-up | Step 3 |
| Values and their source | Step 4 |
| Release actor and time, if stored | Step 5 |
| Issue of the report | Step 6 |
| Send attempt, if stored | Step 7 |

If an upstream step does not store actor and time, this step cannot invent them.

## Outputs

| Output | Used by |
|---|---|
| A history of one exam | Staff, and possibly an inspection. Export is not published |
| An aggregate of results | Laboratory management. Layout and export are not published |

There is no output back to the patient in the published material.

## Handoff

A review can send the laboratory back to an earlier step:

| Finding | Return |
|---|---|
| Wrong patient or wrong exam | Steps 1 and 2. Fiscal effect of a change is not published |
| Sample problem | Step 3 |
| Wrong value | Step 4, then step 5 again |
| Report already sent | Steps 6 and 7 must be repeated or the first QR stays in the patient’s hands. Not published |

That loop is how a careful laboratory works. It is not a SICOEXC procedure.

## Not part of this step

- The patient PDF. That is step 6
- Cash closing and SENIAT books. Those would be step 1, and no cash report is published
- A dashboard of named charts

## Open questions

1. Which statistical reports exist in version 9.0?
2. Is traceability a timeline or only the current status?
3. Are unvalidated results included in the statistics?
4. Can the history be exported?
5. Who is allowed to open it?
