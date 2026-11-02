# Analyzer connectivity

**Catalog:** “Conectividad con equipos: interfaz bidireccional que lee los resultados de los analizadores automáticamente, reduciendo errores de transcripción.”  
**Release named by the vendor:** 9.0  
**Evidence:** [Published] on the services page. The marketing site also has two image pages whose titles mention the LIS interface.

This module connects SICOEXC to laboratory instruments such as hematology and chemistry analyzers. The vendor’s own sentence does two things: it calls the interface **bidirectional**, and it describes only one direction in detail, **reading results automatically**.

## Published behavior

- The system connects directly to medical equipment.
- The interface is bidirectional.
- It reads analyzer results automatically.
- The stated benefit is fewer transcription errors.
- The product is positioned for clinical laboratories that already own analyzers. No brand, model, or protocol is named in public text. The session's wallpaper pictures a BC-20 and a BS-240 as advertising, not as a supported-device list.

Two website pages look like documentation and are not:

| Page | What it actually contains |
|---|---|
| [Lista de clientes e interfaz LIS](https://labsicoexc.com/lista-de-examenes/) | Photographs of client laboratories and staff. Its title, checked on 1 November 2026, is “Lista de Clientes e interfaz lis con equipos automatizados”, which promises an equipment interface list |
| [Interfaz LIS de comunicación](https://labsicoexc.com/customer-cabinet/) | An image gallery. Several files are named “ChatGPT Image,” so those frames are generated pictures, not interface screenshots |

Do not use those galleries as a device list or as a protocol specification.

## Bidirectional, as far as the text goes

| Direction | Status |
|---|---|
| Instrument to SICOEXC | **Published.** Results are read automatically |
| SICOEXC to instrument | **Inferred** from the word “bidireccional.” Order download, patient demographics, or query-by-sample are the usual contents of that direction. None of them is described |

“Lee los resultados” is the only operation written down. A one-way result import can be sold as an interface. Calling it bidirectional without saying what is sent to the analyzer leaves the host-to-instrument half unconfirmed.

## What is not published

- Protocol: ASTM, HL7, manufacturer serial, file drop, or TCP.
- Physical link: serial port, network, or middleware PC.
- Whether one workstation hosts every instrument or each analyzer has its own connection.
- Test-code mapping between the instrument and the [test catalog](test-catalog.md).
- Units, flags, histograms, scattergrams, and images.
- What happens when the analyzer sends a code the catalog does not know.
- Whether a result that arrives automatically still passes through [validation](validation.md) before [delivery](result-delivery.md). The product describes both automatic reading and a validation step. It does not say automatic reading skips validation.
- Conflict handling when a person has already typed a value in [result entry](result-entry.md) and the instrument sends another.

Client photographs show desktop PCs in the same rooms as microscopes and centrifuges. They do not show a named analyzer model connected to SICOEXC. That observation does not add a supported-device list.

## Who uses it

| Role | Relationship | Label |
|---|---|---|
| Bioanalyst | Reviews imported results and validates them | Inferred |
| Auxiliary | Loads the instrument. Whether they operate the interface screen is unknown | Not published |
| Vendor implementer | Builds the mapping for a new analyzer. The 2019 post says the company adapts to how the laboratory works | Inferred |

## Place in the flow

The interface writes into the result that belongs to a sample from [quality control](quality-control.md) and an exam from the [test catalog](test-catalog.md). [Result entry](result-entry.md) is the manual path for the same destination. [Validation](validation.md) is the **inferred** gate before the report is delivered. Whether the interface can post straight to a released report is **not published**.

## What the module must handle

**Inferred:**

| Concern | Why it is required |
|---|---|
| An instrument identity | More than one analyzer can exist in a laboratory |
| A code map | The analyzer’s test code has to become a catalog exam |
| A sample key | The incoming result has to join the correct order |
| A stored raw or parsed result | Automatic reading is only useful if the value is kept |
| An error or unmatched queue | Otherwise a failed message disappears and the transcription-error claim fails |

## Relationships

| Module | Link |
|---|---|
| [Test catalog](test-catalog.md) | Destination exam |
| [Quality control](quality-control.md) | Destination sample |
| [Result entry](result-entry.md) | Alternate way to fill the same result |
| [Validation](validation.md) | Likely next step. Not confirmed as mandatory for interfaced results |
| [Exam traceability](exam-traceability.md) | Should record that the value came from an instrument. Not confirmed |

## Open questions

1. Which analyzer brands and models are already interfaced?
2. What does the host send to the instrument?
3. Is unmatched traffic visible to the bioanalyst?
4. Can the laboratory turn the interface off for one exam and type it instead?
5. Are diagrams, flags, and comments from the instrument stored?
