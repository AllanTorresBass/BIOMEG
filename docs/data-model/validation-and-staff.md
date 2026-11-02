# Validation and staff

**Status:** A label and a legal sentence are observed. A stored validator id is not.

## `Procesado por`

Template B prints `Procesado por` and, in the text taken from both Coro reports, no name after it. So the layout has a slot for the person who processed the exam. In that text, the slot is empty on a report that was still issued. A text extract can't show a signature image, so a name in another form isn't ruled out.

That does not prove a user-account foreign key. It proves a printable name, optional on those copies.

## Wet signature

One Caracas report prints a note that the document is fully valid only with:

- an original signature
- the wet stamp of the responsible bioanalyst (`lcdo/lcda en Bioanalisis`)
- the wet stamp of the laboratory

This is that laboratory’s template text. It is evidence that **this** installation treats a handwritten signature as the validity rule. It matches the gap in the vendor catalog: electronic signature is not a published feature. It does not prove that every SICOEXC site uses the same sentence. Template B does not print it.

The vendor still says exams are validated before delivery. Validation inside the software and a wet stamp on the paper can both exist. The reports do not show a digital-signature block, a license number next to a system user, or a timestamp of release.

## Colegio number

The same Caracas note includes the laboratory’s registration number at the Colegio de Bioanalistas. That number is laboratory identity, not a per-result validator. See [laboratory-and-template.md](laboratory-and-template.md).

## Roles from the vendor, not from the report

Receptionist, auxiliary, secretary, bioanalyst, and physician are published as concurrent users. None of those role names is printed on these results. A physician is not in the header of any sampled report. If the order stores a requester, these templates do not show it. The 30 October invoice has a Médico dropdown. The BIOMEG preview's header doesn't print it.

## What the 30 October session adds

| Fact | Status |
|---|---|
| `Procesado por` on the BIOMEG preview | The session's note doesn't record it, so it's unknown whether that layout prints the slot |
| Usuario Activo | The shell shows one signed-in name. See [../session/README.md](../session/README.md) |
| Nuevo Usuario, Clave, Auditoría | Commands exist. None was opened |
| A command named Validar | None appears on the captured menus. See [../session/hoja-de-trabajo.md](../session/hoja-de-trabajo.md) |

## What remains unknown

- Whether `Procesado por` is a user, a typed name, or a fixed blank
- Whether validation changes a status that the report hides
- Whether a correction keeps the previous processor’s name
