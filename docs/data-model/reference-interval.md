# Reference interval

**Status:** The reference **text** printed beside each result is observed. A normalized table of low, high, sex, and age is not.

## What the cell contains

| Pattern | Example of the pattern |
|---|---|
| Closed range | `11 - 18`, `3,80 - 5,80`, `140 - 440` |
| One-sided | `Hasta 200 mg/dL`, `Hasta 1,10`, `< 150 mg/dL` |
| Sex inside one cell | `HOMBRE: 12,0 - 16,0` and `MUJER: 11,0 - 15,0` stacked in the hemoglobin cell |
| Age word inside the cell | `3.70 - 6,20 niños` |
| Interpretation instead of a range | `Favorable menor de 4.5`, `NORMAL` |
| Unit repeated inside the reference | `70 -105 mg/dL` while the unit column also says `mg/dL` |
| Dot or thin placeholder | A ratio whose reference cell did not carry a numeric range |

The sex split is the important modeling fact. Hemoglobin on that report did **not** pick the female range and hide the male range. It printed both, even though `GÉNERO` was female. So at least one laboratory stores or templates the reference as **text that already includes every branch**, not as a single interval chosen for that patient. The BIOMEG preview does the same for hemoglobin and hematocrit. See [../session/print-preview.md](../session/print-preview.md).

Other rows on other reports print only one range. Both styles exist. A structured rule (sex, age-from, age-to, low, high) may exist underneath and be flattened for print. The paper does not prove it. Designing that table and calling it SICOEXC’s would go past the evidence.

## Units inside the reference

Sometimes the unit lives only in `UNIDADES`. Sometimes it is repeated in the reference cell (`70 -105 mg/dL`). The reference is not a pure pair of numbers.

## Decimal and separator style

Commas and periods both appear as decimal marks (`3,80` and `3.70`). Thousands use a period (`13.100`) or nothing (`9160`). The reference text is formatted per laboratory, like the result.

## What not to add

- A mandatory low and high for every analyte. Qualitative rows use words.
- Automatic selection of the range from `GÉNERO` and `EDAD`. One report prints both sexes regardless.
- A flag column (`H`, `L`, `*`). None is printed. Abnormality is left to the reader comparing two cells. These text extracts cannot show color. The BIOMEG preview prints at least one result in red.
