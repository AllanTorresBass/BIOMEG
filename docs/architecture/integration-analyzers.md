# Integration — analyzers

**Architecture status:** Result import is published. The protocol, the port, and the host-to-instrument half are not.  
**Related:** [Analyzer connectivity](../modules/analyzer-connectivity.md), workflow step [Produce the result](../workflow/04-produce-the-result.md), [Data store](data-store.md)

A live session on 30 October 2026 is transcribed in [../session/README.md](../session/README.md). Its wallpaper advertises equipment transmission and pictures a BC-20 and a BS-240, and Registros has Equipos, not opened. That is advertising inside the program, not a supported-device list.

## Contract, as published

| | |
|---|---|
| Direction claimed | Bidirectional |
| Direction described | Instrument to SICOEXC. The system reads results automatically |
| Purpose | Fewer transcription errors |
| Devices named | None. “Equipos” and “analizadores” only |
| Protocol named | None |

Bidirectional normally means the laboratory system also sends orders or demographics to the instrument. That send is **inferred** from the adjective. The only verb the vendor writes is “lee los resultados.”

The pages titled as LIS interface documentation are photo galleries. Several images are generated. They are not interface specifications.

## Where it sits

```text
Analyzer  →  link (serial, network, or file; unknown)
                 →  reader (desktop client or a companion; unknown)
                       →  map instrument code to catalog exam (unpublished)
                             →  match sample identity (unpublished)
                                   →  clinical store
```

The reader has to run on a machine that can see both the instrument and the store. In the photographed laboratories that machine is one of the Windows PCs. A dedicated interface PC is a common pattern and is **not** visible in the material.

## Boundary rules that are not specified

| Situation | Architectural effect | Status |
|---|---|---|
| Unknown instrument code | Must not invent an exam | Handling not published |
| Unknown sample id | Must not attach the value to the wrong patient | Handling not published |
| Person already typed the same exam | One writer has to win | Not published |
| Result arrives before [validation](../modules/validation.md) | Store as unreleased | Inferred. Auto-release is not published |
| Instrument sends graphs or flags | Extra payload beside the number | Not published |

## What not to assume

- ASTM, HL7, or a particular manufacturer’s serial dialect
- A port number, a baud rate, or a folder drop
- A middleware product between SICOEXC and the instrument
- A certified list of hematology or chemistry models

Hematology and chemistry analyzers are the usual meaning of this feature in a clinical lab. The vendor does not name those disciplines in the connectivity sentence. A client photograph of a centrifuge or a microscope is not an interfaced analyzer.

## Open questions

1. Which brands and models are already mapped?
2. What, if anything, does SICOEXC send to the instrument?
3. Which process owns the connection, and does it survive the client being closed?
4. Where does unmatched traffic go?
