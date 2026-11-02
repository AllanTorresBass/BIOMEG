# Integration — QR

**Architecture status:** A QR code on every report is published. The payload and the verifier are not.  
**Related:** [QR authenticity](../modules/qr-authenticity.md), [Report engine](report-engine.md), [Web layer](web-layer.md), workflow step [Report](../workflow/06-report.md)

A BIOMEG preview from 30 October 2026 shows a QR at the upper right of the result page while the shell says QR: ACTIVO. Mantenimiento has a QR command. The payload was not decoded. See [../session/print-preview.md](../session/print-preview.md).

## Contract, as published

| | |
|---|---|
| Where it appears | On diagnostic reports |
| Scope | All tests. COVID-19 was the start, not the limit |
| Purpose | Security and authenticity |
| Travels with | WhatsApp delivery, in the product summary |
| Encoding, URL, or signature algorithm | Not published |

This is not described as an electronic signature, and it is not described as a fiscal QR for SENIAT. Those are different controls. See [validation](../modules/validation.md) and [integration-fiscal.md](integration-fiscal.md).

## Two architectures fit the same sentence

| Kind | What a phone does | What the laboratory must run |
|---|---|---|
| Lookup code | Opens a page that shows or checks the report | A verifier. Possibly the [client panel](../modules/client-panel.md). Not confirmed |
| Self-contained code | Shows an identifier a person compares to the paper | No server. Weaker if someone copies the code onto a forged page |

The vendor’s word is “seguridad,” which fits a lookup better than a decoration. A lookup is still **inferred**. Generated images on the LIS page are not examples of the code.

## Boundary

If the code contains a URL, scanning it crosses from the paper or the WhatsApp chat onto a server:

```text
Report engine embeds code
        │
        ▼
Patient phone
        │
        ▼
Verifier (hostname unpublished)  →  reads the issued report in the store
```

That verifier is on the public side of the trust boundary in [web-layer.md](web-layer.md). It must not return another patient’s result. No such rule is published because no verifier is published.

If the code contains a name, a national id, or a diagnosis in clear text, anyone who photographs the page learns that data without logging in. The payload contents are unknown, so this risk is open.

## Stability

An authenticity code has to keep meaning after the send. A code that changes on every reprint, or that still resolves after a silent edit of the result, does not do the job the vendor claims. Whether the code is bound to a hash of the issued document is **not published**.

## Open questions

1. Is the payload a URL, a token, or a document number?
2. What hostname answers a scan?
3. Is login required?
4. Does a corrected report get a new code, and does the old code die?
