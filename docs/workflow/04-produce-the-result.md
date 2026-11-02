# Step 4 — Produce the result

**Workflow status:** Inferred as one step with two sources. Both sources are published separately. The vendor does not publish how they meet.  
**Modules:** [Analyzer connectivity](../modules/analyzer-connectivity.md), [Result entry](../modules/result-entry.md)  
**Previous:** [Track the sample](03-track-the-sample.md)  
**Next:** [Validate](05-validate.md)

**Named command:** Cargar Resultados, on the menu and the toolbar. The form was not opened. The wallpaper says equipment transmission is available and pictures a BC-20 and a BS-240. See [../session/hoja-de-trabajo.md](../session/hoja-de-trabajo.md).

## Purpose

Put a clinical value on an ordered exam. The value comes from an analyzer, from a person, or from both on the same visit.

## When it starts and ends

| | |
|---|---|
| Starts | A sample and an order line exist |
| Ends | At least one exam on the visit has a value that validation can release |
| Two paths | Automatic read from the analyzer, and manual “carga de resultados” |

A visit can leave this step unfinished. Some exams may have values while others are still on the instrument. Partial completion is **not published**.

## Published behavior used here

- The interface is bidirectional and reads analyzer results automatically, to reduce transcription errors.
- The host-to-instrument half of “bidirectional” is not described. Order download in this step is **inferred**, not confirmed.
- Staff load results (“carga de resultados”), from the CEO’s project description.
- The services page includes validation after results exist, so a value produced here is not yet the patient document.

No analyzer brand, protocol, or result type (number, text, graph) is published.

## Actors

| Role | Part in this step | Label |
|---|---|---|
| Analyzer | Writes values when the interface matches a sample | Published as automatic reading |
| Auxiliary | Often loads the instrument and may type bench results | Inferred |
| Bioanalyst | Reviews imported values and types the exams the instrument does not run | Inferred |

Who is allowed to overwrite an imported value is **not published**.

## What happens

### Path A — analyzer

1. The instrument finishes a run. **Outside the software.**
2. SICOEXC reads the message. **Published.**
3. A test code on that message is matched to a catalog exam, and a sample key is matched to step 3. **Inferred.** Without both matches the result cannot file itself.
4. The value is stored on the order line. **Inferred.**
5. An unmatched code or sample is held for a person. **Inferred** from the error-avoidance claim. No queue is described.

### Path B — manual entry

1. A person opens the visit, the sample, or a bench list. The navigation is **not published**.
2. The person types the value. **Published** as carga de resultados.
3. The value is stored on the same kind of order line the analyzer writes to. **Inferred.** Otherwise the report could not mix both sources.

### Where the paths meet

If both write, one of these is true and none is confirmed:

| Rule | Effect |
|---|---|
| Imported value wins until a person edits it | Protects the instrument |
| Typed value wins and blocks a later import | Protects a correction |
| Both are kept and validation chooses | Needs a review screen that is not described |

## Inputs

| Input | Status |
|---|---|
| Sample identity from step 3 | Inferred as the join key |
| Catalog exam and, for path A, an instrument code map | Published catalog. The map is inferred |
| A typed value, or a message from the analyzer | One of the two is published for each path |

## Outputs

| Output | Used by |
|---|---|
| A result value on an order line | Validation, the report, statistics |
| Source of the value, if stored | Traceability. Not confirmed |
| Unmatched instrument traffic, if stored | The bioanalyst. Not confirmed |

## Handoff

[Validate](05-validate.md) should be the only way a value becomes releasable. The vendor names validation and does not say an interfaced result skips it. Skipping validation would be an extra feature (auto-verify) and is **not published**.

## Not part of this step

- Releasing the result to the patient
- Printing the final report
- Statistical quality-control rules
- Histograms and flags, until the vendor says the interface stores them

## Open questions

1. Does the host send the order to the analyzer before the run?
2. What happens when a person and the instrument both write the same exam?
3. Is there a bench worksheet, or only entry by patient?
4. Which result shapes exist besides a single number?
