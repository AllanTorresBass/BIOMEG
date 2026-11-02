# Quality control

**Catalog:** “Control de calidad: centraliza el almacenamiento y seguimiento analítico de las muestras para evitar errores.”  
**Release named by the vendor:** 9.0  
**Evidence:** [Published] on the services page.

In laboratory software, “control de calidad” often means Westgard rules, control sera, and Levey-Jennings charts. The SICOEXC sentence is narrower and different. It says the system **stores samples in one place and follows them analytically so that errors are avoided**. Read it as sample custody and analytical follow-up unless the vendor says otherwise.

## Published behavior

- Sample information is stored centrally.
- Samples are followed through analysis (“seguimiento analítico”).
- The stated purpose is to avoid errors.
- This sits beside analyzer connectivity, which is separately described as removing transcription errors. Quality control and the analyzer interface are two claims, not one feature.

No mention is published of control materials, lots, means, standard deviations, rules, calibration, or external quality programs.

## What “seguimiento analítico” can mean

The phrase is **published** and undefined. These readings are **inferred** and must stay labeled as such:

| Reading | What it would cover | Status |
|---|---|---|
| Sample status | Ordered, collected, received, in process, resulted, validated | Not published. This is the usual meaning of sample follow-up |
| Analytical checks | Flags when a result is outside a range or disagrees with the analyzer | Not published |
| Statistical QC | Controls, charts, rule violations | Not published. Do not assume this module is statistical QC |

The error-avoidance claim overlaps the analyzer module, which also claims fewer transcription errors. The vendor does not say which errors quality control catches that the interface does not.

## Who uses it

Bioanalysts and auxiliaries are the roles whose daily work is the sample. That link is **inferred**. The vendor does not name a quality officer or a sample-receiving screen.

## Place in the flow

After [patient admission](patient-admission.md) orders an exam from the [test catalog](test-catalog.md), a sample has to exist for [analyzer connectivity](analyzer-connectivity.md) or [result entry](result-entry.md) to attach a value. [Exam traceability](exam-traceability.md) is the later ability to reconstruct that path. Quality control is the operational follow-up. Traceability is the record of it. The vendor never draws that distinction. It is a useful split, and it is **inferred**.

## What the module must handle

**Inferred** from “almacenamiento y seguimiento” of samples:

| Concern | Why it is required |
|---|---|
| A sample identity | Follow-up needs something to follow |
| A link to the admission and the exam | A sample that is not tied to an order cannot be reported |
| A status or location over time | “Seguimiento” means the sample is not only stored once |
| A person or station that last handled it | Otherwise central storage is only a file, not follow-up |

Collection time, sample type, tube, barcode, rejection reason, and aliquot are standard. They are **not published**.

## Relationships

| Module | Link |
|---|---|
| [Patient admission](patient-admission.md) | Origin of the order the sample belongs to |
| [Test catalog](test-catalog.md) | Which exam the sample is for |
| [Analyzer connectivity](analyzer-connectivity.md) | The instrument result has to land on the right sample |
| [Result entry](result-entry.md) | Manual results attach to the same sample or exam |
| [Validation](validation.md) | Follow-up should end when a result is released. That end state is not published |
| [Exam traceability](exam-traceability.md) | The historical view of the same path |

## Open questions

1. Does “control de calidad” include statistical process control, or only sample tracking?
2. Can a sample be rejected, recollected, or split?
3. How is the sample identified to the analyzer (accession number, barcode, position)?
4. What error types does this module stop that the bidirectional interface does not?
