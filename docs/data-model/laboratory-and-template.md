# Laboratory and template

**Status:** Observed. The vendor’s “identity of the laboratory” claim is visible as different headers, captions, and legal lines on the same product footer.

## Product line versus laboratory line

Every report ends or includes:

`Impreso por el Sistema de Control de Exámenes Clínicos (SICOEXC)`

That line does not change. Around it, each laboratory prints its own block:

| Piece | Seen |
|---|---|
| Street address | Different on every site, including a hospital line in Coro |
| Telephone | Local numbers, not the vendor’s +51 sales number |
| Email | The laboratory’s mailbox |
| WhatsApp | On some headers, as a laboratory contact, not as proof of the result-delivery integration |
| Instagram invitation | Template B footer |
| `HOMOLOGADO POR EL SENIAT` | Printed under the product name on some reports. No fiscal number, providencia, or control number next to it |
| Colegio sentence | One report names the Colegio de Bioanalistas del Distrito Federal y Miranda and a registration number |
| Wet-stamp sentence | One report says full validity needs an original signature and wet stamps |
| Page language | `Página` on the public reports and, once, `Page`. The BIOMEG preview also prints `Page 1 of 1` |
| RIF and QR | On the 30 October 2026 BIOMEG preview. See [../session/print-preview.md](../session/print-preview.md) |

The session's transcription of that preview doesn't record the `Impreso por` line, an address, or a phone. It doesn't say they were absent.

`HOMOLOGADO POR EL SENIAT` on the clinical report supports the vendor’s fiscal claim only as **footer text a laboratory chose to print**. It is not an authorization document and not a control number. See [integration-fiscal.md](../architecture/integration-fiscal.md).

## Two caption sets

Documented in [report-fields.md](report-fields.md) as Template A and Template B. Same facts, different words (`PACIENTE` / `NOMBRE`, `C.I.` / `CEDULA`, `GÉNERO` / `SEXO`, `VALORES DE REFERENCIA` / `Valores Referenciales`). The data model has to survive a rename of the label. The label is template text.

## What the laboratory record must be able to hold

**Inferred** from the differences above:

| Item | Why |
|---|---|
| Name and address block | Printed, and different per site |
| RIF | Printed on the BIOMEG preview. The logo artwork and the preview show different values, so this folder repeats neither |
| Phones and email | Printed |
| Which caption set and which optional sentences to include | SENIAT line, colegio line, and wet-stamp line are not on every report |
| Exam names, units, and reference text used by that site | The same analyte is worded differently across laboratories |

A logo was not extractable from the text of the PDFs. The vendor says the design can carry the laboratory’s identity, so a logo is likely. It is **not** confirmed from this text pass. BIOMEG's own logo is a file in this workspace. See [../brand/09-logo-assets.md](../brand/09-logo-assets.md). The session's note on the preview lists the name, the line under it, the RIF, and a QR, and doesn't record whether that logo image printed.

## Multi-site

These reports are single laboratories. They do not show a chain with several branches on one database. The vendor’s offices in Maracay and Huancayo are the company’s offices, not rows in this entity.
