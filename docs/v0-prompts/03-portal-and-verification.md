# Stage 4: Patient-facing pages

[Back to the catalog](README.md)

These two surfaces are open to the internet, and they don't use the staff shell. Counsel hasn't reviewed the portal credential. Fecha de nac. is weak against relatives, and `product/06-access-control.md` records this as open.

## V0-17. Portal: Ingresar, Mis visitas, download

**Attach:** `product/02-client-flow.md` (Portal), `product/04-edges.md` (Portal), rows R-140 to R-143 and E-20, E-21, E-37 to E-42 from `product/06-access-control.md`.

```text
Build the client portal at /portal. It has its own simple layout with no staff shell, staff menu, or staff data. It must work at phone width with a 16px gutter and no horizontal scroll. Use the full lockup on Ingresar. A client session never carries staff rights.

INGRESAR. Fields: cédula type (V, E, J, P, G), number, Fecha de nac. No password exists or is stored. Sign-in requires a complete cédula and a matching Fecha de nac. on a client with at least one order and a phone on file.

ONE-TIME CODE. After those fields, the screen always says "Si los datos coinciden, enviaremos un código al teléfono registrado.", whether or not they matched, and asks for the code. If they matched, the fake IDeliveryPort sends a six-digit code to the phone on file, as Sistema: sender under R-148. The code is stored hashed, lasts 10 minutes, works once, and five wrong entries cancel it. Never use email for this code. Writes portal.code.sent and portal.code.failed. The real provider comes later, and the portal doesn't open to real clients until it works.

ONE GENERIC ERROR. An incomplete cédula, Sin verificar, an unknown cédula, a wrong Fecha de nac., a client with zero orders, a wrong type on a right number, and a soft-deleted client all show exactly the same message, in the same time. The screen never says which. Put the wording under pendingReview.

FAILURE WINDOW. A failed attempt is recorded against a keyed hash of laboratory, type, and number, and against the address. The log keeps a hash prefix, never the digits. Further attempts pause when the window fills. Writes portal.login or portal.login.failed. The secret is a server-only environment variable.

An inactive client with orders CAN still sign in. A soft-deleted client cannot.

SESSION. Lasts three hours, with a 15-minute idle timeout. It holds only the ids of clients matching both that cédula and that Fecha de nac., the display cédula, the name, and the expiry. Rows with the same cédula and Fecha de nac. brought over from the old program open as one list. A row with a different Fecha de nac. stays out. After expiry, return to Ingresar.

MIS VISITAS. Header with the client's name and a visible Salir. Filters: Todos, Con resultado, Pendientes. Voided orders are omitted.
- LIBERADO: date, order number, Descargar informe, and the result grid.
- INCOMPLETO with released sections: only those sections, clearly labeled partial. Download holds those sections, labeled partial.
- INCOMPLETO or ABIERTA with no released section: a Pendiente card with the date and order number ONLY. No exam names.
- EN_CORRECCION: En revisión, no grid, no download. For an INCOMPLETO order, only the section under correction reads En revisión.
- Money owed never blocks anything.

Never show a section before its Liberar, even in the response payload. Apply scope released_sections_labeled_partial and date_and_number_until_released on the server.

"No disponible" for a foreign or unknown order, and for a result that is not released. A link that belongs to another cédula gets the same answer.

DESCARGAR INFORME writes portal.download with the order id and creates no clinical result. PDF responses use no-store caching, so nothing remains on a shared device.

A minor's representative has no portal link in this release. Add none. A Sin verificar client has no portal entry.

Add no result editing, messages, appointments, or profile editing.
```

**Check:**
- Try each failure case and compare the responses, which must be identical.
- Try another client's order URL: "No disponible".
- Inspect network responses on a Pendiente row: no exam names.

## V0-18. QR verification page

**Attach:** `brand/04-display-patterns.md` (QR section), `brand/06-edge-cases.md` (QR off), R-144 and E-43 to E-45 from `product/06-access-control.md`.

```text
Build the public verification page at /verificar/[token], and put the QR code on the issued report.

TOKEN. Each issue gets a long random token, not derived from the order number. The QR code encodes the URL with that token. An order number alone reveals nothing. Rate limit this route. Use the same "No disponible" answer for anything not found.

THE PAGE SHOWS ONLY: the order number, the laboratory name, the report date, the state (Liberado, Incompleto, or En revisión), and whether the issue was replaced.
It NEVER shows a cédula, phone, patient name, exam name, or result value.

CASES.
- Current issue, LIBERADO: Liberado.
- INCOMPLETO: Incompleto.
- EN_CORRECCION: En revisión.
- A replaced issue: "Esta versión fue reemplazada" and the date, no values.
- A voided order, an order with state ABIERTA, or an unknown token: "No disponible".

The page always says "Esta página confirma el estado de la orden. No confirma los valores impresos."

VALUE CHECK, R-149, behind a deployment setting that's off by default. When it's on, the page has a field for Código de consulta, and the sentence says that the code opens the original report. The code has at least 10 random characters, is stored hashed, and is never in the QR. It works only on a current issue of a LIBERADO order, for 90 days. Anything else reads "No disponible". Five wrong codes pause that token for 15 minutes. Serve the file with no-store, and write verify.file.read.
 The page has no staff shell and no links into the application. It does not replace the portal. Add noindex, and Referrer-Policy: no-referrer, because the URL holds the token. Tokens have at least 128 random bits, and are stored hashed.

QR SWITCH. With the laboratory setting QR INACTIVO, the code is absent from the preview and PDF, and the rest of the page stays. The printed page still makes sense if the code is covered.
```

**Check:**
- Confirm the payload holds no name.
- Scan the code on a replaced issue.
- Guess a sequential token, and nothing is revealed.
