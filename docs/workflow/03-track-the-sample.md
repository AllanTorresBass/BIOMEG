# Step 3 — Track the sample

**Workflow status:** Inferred. Version 9.0 publishes central storage and analytical follow-up of samples. It does not publish the statuses between collection and result.  
**Module:** [Quality control](../modules/quality-control.md)  
**Previous:** [Order from the catalog](02-order-from-catalog.md)  
**Next:** [Produce the result](04-produce-the-result.md)

**Named command:** none of the opened menus is a sample screen. Hoja de Trabajo is the nearest name and was not opened. See [../session/hoja-de-trabajo.md](../session/hoja-de-trabajo.md).

## Purpose

Keep one identity for the specimen and follow it until a result is attached, so the value from the analyzer or the keyboard lands on the right exam.

The vendor calls this quality control. The published sentence is about sample storage and analytical follow-up to avoid errors. It is not a published Westgard or Levey-Jennings module. Do not run this step as statistical process control unless the vendor confirms that.

## When it starts and ends

| | |
|---|---|
| Starts | At least one exam is ordered on a visit |
| Ends | The sample is identified and has been followed to the point where step 4 can write a value |
| Continues | Follow-up can remain visible after the result exists. The vendor does not say the trail stops |

Collection at the chair, receipt in the laboratory, rejection, and recollection are the usual middle of this step. None of those states is named in public material.

## Published behavior used here

- Samples are stored centrally.
- Samples are followed analytically (“seguimiento analítico”).
- The purpose is to avoid errors.
- This claim sits beside the analyzer claim, which is specifically about transcription errors. The two error-reductions are separate sentences.

## Actors

| Role | Part in this step | Label |
|---|---|---|
| Auxiliary or assistant | Collects or receives the specimen. The role is published. The task assignment is inferred | Inferred |
| Bioanalyst | Responsible for analytical follow-up | Inferred |
| Reception | May print a label or tell the patient the sample was taken. Labels are not published | Not published |

Client photographs show microscopes, a centrifuge, and an ultrasound room in customer sites. Those are the laboratories’ instruments, not SICOEXC sample states.

## What happens

1. A sample identity is created for the ordered exams. **Inferred.** Follow-up needs an object to follow.
2. The sample is tied to the visit and to one or more order lines. **Inferred.** A sample that is not tied to an order cannot be reported.
3. Status or location changes as the sample moves. **Inferred** from “seguimiento.” The status names are unknown.
4. The identity used by the analyzer is the same identity, or is mapped to it. How that key is printed or typed at the instrument is **not published**. Barcodes are not in the catalog.
5. Step 4 is allowed to post a result only against this sample. That guard is **inferred** from the error-avoidance claim.

## Inputs

| Input | Status |
|---|---|
| Order lines from step 2 | Required |
| A sample identifier | Inferred. Format unknown |
| Sample type, tube, and collection time | Not published |

## Outputs

| Output | Used by |
|---|---|
| A sample linked to exams | Step 4, both the analyzer and manual entry |
| A current place or status | Staff looking for the specimen. The screen is unknown |
| History of that follow-up | [Exam traceability](../modules/exam-traceability.md), if the product stores it |

## Handoff

[Produce the result](04-produce-the-result.md) needs a sample key the instrument or the typist can match. If the key is wrong, the transcription-error claim of the analyzer interface fails in practice. The vendor does not describe an unmatched-sample queue.

A sample that is rejected never reaches step 4. Rejection is **not published**, so this workflow has no confirmed cancel path.

## Not part of this step

- Statistical quality control, control lots, and charts
- Entering the patient-facing number
- Validating or sending the report
- Inventory of tubes and reagents

## Open questions

1. What statuses does a sample pass through?
2. Can one sample cover several exams, and can one exam need several samples?
3. How does the analyzer know which sample it is measuring?
4. Can staff reject and recollect inside the system?
