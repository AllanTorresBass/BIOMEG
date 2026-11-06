# Gate C — questions to send

**Authority:** This page sets no answers. Copy the questions to the named people. Write their replies only into [gate-c.md](gate-c.md).  
**Also open:** G1 (catalog), G3 (migration), G4 (providers) — all recorded on the Gate C checklist.

## To the lead bioanalyst (G1 + Decisions)

1. From captures of Precio Exámenes and Crear Perfiles: how does one exam map to many analytes?
2. Is Categoría a report section? Where are units and reference text maintained?
3. Confirm each row marked “Lead bioanalyst to confirm” in `product/06-access-control.md` (per-section Liberar, license, auxiliary, self-entered values, Fecha reporte, `SIN PRECIO`, clinical audit events, Procesado por, etc.).
4. Define urgent results for an outage.
5. Who confirms, and on what date?

## To the laboratory (G4, RIF, captures)

1. Which RIF is correct for print and screen (`V-…` vs `Y…`)?
2. Providers: WhatsApp, correo, analyzer protocol (or keep fake), fiscal Control N° medium (talonario / forma libre / máquina fiscal / digital), BCV rate source, portal OTP delivery channel.
3. Provide captures of still-unopened forms needed for go-live.
4. Confirm encryption-at-rest expectations for Neon, files, and backups with whoever hosts them.
5. Who confirms, and on what date?

## To the owner (Gate C ops + G3)

1. Approve production only from a protected branch (v0 cannot publish prod).
2. Commission an independent security review; close critical and high findings.
3. Set outage targets; complete and rehearse `product/11-outage-procedure.md` with the laboratory and accountant.
4. Provide or authorize a SICOEXC backup/export; decide what migrates (G3).
5. Who confirms, and on what date?

## To Venezuelan counsel

1. May production BIOMEG store health data in hosted Neon (or named host), under what conditions?
2. Retention for clinical results, audit rows, and portal credentials?
3. Rules for minors (cédula, portal, representative)?
4. Allowed form of the portal credential; what must be refused?
5. Who signs, and on what date?

## To the accountant

1. Paper steps for payments and facturas during an outage (with the owner’s rehearsal).
2. Confirm Control N° medium once the laboratory chooses G4 fiscal emission (if different from Gate B Pendiente rule).
3. Who confirms, and on what date?

## After replies arrive

1. Paste into [gate-c.md](gate-c.md) with dates.
2. Spread settled facts into product / brand pages with the right evidence label.
3. Only then put real patient data in any environment.
