# Security baseline

**Who may act:** [06-access-control.md](06-access-control.md)  
**Audit log:** [09-audit-log.md](09-audit-log.md)  
**Code rules:** [../v0-prompts/07-engineering-rules.md](../v0-prompts/07-engineering-rules.md)

This page sets the minimum security the application must have, organized by the [OWASP Top 10:2025](https://top10.owasp.org/2025/). It closes the gaps from the design review of 1 November 2026.

Everything here is a **design rule**, added on 1 November 2026 on the instruction to apply the review's recommendations. It needs the owner's confirmation. Numbers are starting values to adjust after the pilot. No application implements any of this, and no page here is legal advice.

If this page differs from [06-access-control.md](06-access-control.md) on who may act, that page wins.

## Before any real patient record

The application doesn't hold real data until each of these is true.

- [ ] The rules on this page are implemented, and the [audit log checks](09-audit-log.md#checks-a-build-must-pass) pass.
- [ ] Venezuelan counsel has reviewed health data, retention, minors, and the portal credential.
- [ ] Encryption at rest is confirmed for the database, the report files, and backups.
- [ ] Production is deployed only from a protected branch, in a project v0 can't publish to.
- [ ] A restore from backup has been tested, and [the outage procedure](11-outage-procedure.md) completed and rehearsed.
- [ ] An independent security review has been completed, with its critical and high findings closed.

**The portal has one further condition:** it doesn't open to real clients until the one-time code is working. Staff delivery of results doesn't depend on this.

## A01 Broken Access Control

The decision rules are in [06-access-control.md](06-access-control.md) and [07-rule-reference.md](07-rule-reference.md). The review added these.

| Rule | Why |
|---|---|
| Bioanalista can be granted only through R-126, with a license. A new user (R-120), a role change (R-124), or temporary cover (R-125) can't include it | Otherwise an administrator could give themselves a second account with clinical access |
| A portal session holds only client rows matching both the cédula and Fecha de nac. | Rows brought over from SICOEXC can share a cédula by mistake, as with a child under a parent's number |
| Resetting another user's Clave ends their sessions, and notifies them and the owner | An administrator could otherwise sign in as a bioanalyst unnoticed |

**What remains.** An administrator can still enter a false license through R-126, or reset a password and sign in as that person before anyone reacts. A small laboratory can't fully prevent this. The notifications, the audit log, and the owner's review make it visible.

## A02 Security Misconfiguration

**Headers on every response.**

| Header | Value |
|---|---|
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains`. Don't request preload without reviewing its risks |
| `Content-Security-Policy` | No inline scripts where the framework allows it, and `frame-ancestors 'none'` |
| `X-Content-Type-Options` | `nosniff` |
| `Referrer-Policy` | `strict-origin-when-cross-origin`. `no-referrer` on the verification page, because its URL holds the token |
| `Cache-Control` | `no-store` on anything with clinical, identity, or fiscal data |

**Cookies.** `HttpOnly`, `Secure`, and `SameSite=Lax` or stricter. Staff and portal cookies are separate. Every state-changing request has CSRF protection.

**Environments.**
- Development, preview, and production are separate, with separate databases and secrets.
- Previews hold invented data only, and need a sign-in to view.
- The demo role switcher and `/dev` routes exist only behind a demo setting. A production build fails if that setting is on.
- Production shows no stack trace or debug output.
- The database isn't reachable from the public internet, where the hosting allows it.

## A03 Software Supply Chain Failures

- Commit a lockfile, and install from it exactly in builds.
- CI scans dependencies, and a known critical or high vulnerability in production code blocks the merge.
- Add a dependency only when needed. Someone checks its name and its source, because generated code can name a package that doesn't exist or isn't the intended one.
- Updates are reviewed and tested like any other change.
- **v0 is a third party.** No real data goes in prompts, attachments, or previews. Check the training policy for your plan before starting.
- **Deployment.** Connect v0 to GitHub, so that its changes [arrive as a pull request](https://v0.app/docs/github), with required review and required checks on the base branch. [v0's docs](https://v0.app/docs/github) don't settle whether its Builder role can publish to production regardless of project permissions. So production runs from a separate Vercel project, deployed from the protected branch, which v0 isn't linked to.

## A04 Cryptographic Failures

| Data | Rule |
|---|---|
| All traffic | TLS 1.2 or later, with no plain HTTP. Includes the database connection and any analyzer link |
| Database, report files, backups | Encrypted at rest. Backups use a key held apart from the backup |
| Staff passwords | Argon2id, at least 19 MiB of memory, 2 iterations, parallelism 1. Tune it on the real server. Store the parameters with the hash |
| One-time codes, step-up and confirm tokens | Stored hashed, short-lived, single use |
| Verification tokens | At least 128 bits from a cryptographic random source. Stored hashed |
| Portal attempt hash | Keyed, with a server-only secret, because a plain hash of a cédula is easy to reverse |
| Random values | A cryptographic generator only |

**Keys.**
- Keys live in the hosting platform's secret store, never in code, logs, or a prompt.
- Each key has an owner and a rotation procedure. A stored value names its key version, so old values still work after rotation.
- Rotate on any suspected exposure and whenever someone with access leaves.

**Report delivery.** The message body holds no result, cédula, or birth date. A file name holds the order number and no person's name.

| Situation | How it's sent |
|---|---|
| The portal's code works, and the client can use the portal | A link to Ingresar, with no token, order detail, or attachment |
| The code isn't working yet | An attachment, only with recorded consent |
| The client can't use the portal: no cédula, a minor, or no phone on file | An attachment, only with recorded consent. For a minor, the recorded representative's |

Consent is recorded on the client card, by channel, with the operator and the time, and can be withdrawn. An attachment can't be recalled after a correction, so a resend says that the earlier report was replaced. Without consent, the send is refused (E-62), and staff can print the report.

## A05 Injection

The SQL rules are in the [engineering rules](../v0-prompts/07-engineering-rules.md). They also need:

| Context | Rule |
|---|---|
| Sort columns and direction | An allow-list per report. SQL parameters can't protect column names |
| Search text | Escape `%` and `_` in `LIKE` patterns |
| Screen output | Framework escaping. No raw HTML from stored text, including results and motivos |
| PDF | Stored text is drawn as text, never interpreted as markup |
| ISLR XML | Built with an XML library that escapes every value |
| Email and WhatsApp | Validate destinations, and reject line breaks in anything placed in a header |
| Logs and audit | Structured fields, as in [09-audit-log.md](09-audit-log.md) |

## A06 Insecure Design

**The QR page proves less than it looks like it does.** It confirms that an order exists, its state, and whether it was replaced. It can't confirm the printed values, because it shows none. A forged paper with a changed value and a copied, real QR still reads Liberado.

So the page says: "Esta página confirma el estado de la orden. No confirma los valores impresos." This wording is new, so the laboratory should check it.

**Optional value check (R-149). It stays off until the owner, the lead bioanalyst, and counsel confirm it.** When it's on:

- The report prints a second code, Código de consulta, which is never in the QR. It has at least 10 random characters, is unique to the issue, and is stored hashed.
- Entering it on the verification page opens the original PDF, and the page's sentence says so.
- It works only on a current issue of a `LIBERADO` order, for 90 days from the issue. Any other case reads "No disponible".
- Five wrong codes pause that token for 15 minutes.
- The file is shown with `no-store`, and each opening writes `verify.file.read`.
- It's turned on by a deployment setting, so nobody can switch it on from a screen.

**The trade-off.** Anyone holding the paper, or a clear photo of it, can open that person's report for those 90 days. The paper already shows the same values, but this is the first public route to a file with a person's name, so legal review comes first.

**QR tokens don't expire.** Paper reports are kept for years, so this is deliberate. A token reveals no personal data.

**Free text.** The home observation list is visible to all staff. Its form says that it holds no patient data. Software can't enforce that, so the review includes it.

## A07 Authentication Failures

### Portal

1. The client enters type, number, and Fecha de nac.
2. If they match, a six-digit code goes to the **phone on file**. The screen says the same thing whether or not they matched: "Si los datos coinciden, enviaremos un código al teléfono registrado." This wording is new, so the laboratory should check it.
3. The code is valid for 10 minutes and only once. Five wrong entries cancel it.
4. A client with no phone on file can't use the portal, and gets the same answer. Staff delivery still works.

**Email isn't used for this code.** [NIST SP 800-63B](https://pages.nist.gov/800-63-4/sp800-63b.html) prohibits email for this kind of check, because it doesn't prove possession of a device. The review first suggested email as a fallback, and that's withdrawn. Using it would need an explicit, recorded exception from the owner and counsel.

**What remains.** A person holding the client's phone can still sign in. Changing a phone after Liberar needs a confirm and keeps the prior value (R-013), which limits but doesn't stop an insider.

### Staff

| Topic | Rule |
|---|---|
| Password length | At least 15 characters, or 12 with a second factor |
| Password content | Any characters, with no required mix |
| Password check | Refused if it's on a list of common or breached passwords |
| Password change | No scheduled changes. Required on any sign of compromise |
| Second factor | Required for Administración and Bioanalista, using an authenticator app. Recovery codes are stored hashed, and a recovery is audited |
| Session | Ends 12 hours after sign-in, and locks after 10 idle minutes. A new session id is issued at sign-in and at each step-up |
| Temporary password | Expires in 24 hours, and is used once |

### Lockouts

An attacker shouldn't be able to lock out the only bioanalyst.

| Case | Rule |
|---|---|
| Failed staff sign-ins | 5 failures pause that account **from that address** for 15 minutes. Another workstation can still sign in |
| Across addresses | 20 failures on one account in an hour raise an alert, and slow further attempts |
| Wrong password re-entry | 5 in one session end the session, and raise an alert |
| Portal, by cédula | The window pauses attempts on that hash for 15 minutes, and doesn't disable anything. Staff delivery still works |

## A08 Software or Data Integrity Failures

**System actors.** Each Sistema actor has its own credential, for one purpose, stored in the secret store and rotated. A shared credential isn't allowed.

| Actor | Before connecting it |
|---|---|
| Analyzer link | Authenticates, and is limited to known instruments. Its values stay subject to R-145 and Liberar. The protocol is **Unknown**, so no real link exists until one is documented |
| Sender | Can read one approved delivery's file, or send one code. Nothing else |
| Scheduler | Can set the Saturday calendar. Nothing else |

**Files and data.**
- Each issue stores a hash of its file, so a changed file can be detected.
- A backup stores a checksum, and a restore verifies it.
- Data brought over from SICOEXC is checked, marked with its source, and recorded as `data.import`. It's never trusted as already validated.

## A09 Security Logging and Alerting Failures

The rules are in [09-audit-log.md](09-audit-log.md). The review added:

- **Delivery of alerts.** An alert goes by email to the owner, and to the lead bioanalyst for clinical events. It also shows to Administración in the shell, in case mail is down. An unanswered critical alert is repeated daily.
- **More review signals.** Exports per user, and patient record reads per user.
- **Application logs.** Kept for 90 days, with no personal data.

## A10 Mishandling of Exceptional Conditions

| Failure | Behavior |
|---|---|
| Permission decision can't run | Refused |
| Audit row can't be written | The action doesn't happen, as in [09-audit-log.md](09-audit-log.md) |
| Rate limiter is down | Staff sign-in, portal, and verification refuse with their generic message. Signed-in staff keep working |
| A refused-request flood | Rows without a session are batched separately, so that they can't delay clinical writes behind the single audit writer |
| Outside service is down | The send or code fails with a recorded failure. Clinical work continues |
| Unexpected error | The transaction rolls back, and the user sees a generic message |

**Outage and recovery.** [11-outage-procedure.md](11-outage-procedure.md) is a draft of how the laboratory works on paper, recovers, and rehearses. It proposes losing at most 1 hour of data, recovering in 4 working hours, and testing a restore every three months. The owner sets the real targets, and the laboratory completes the procedure before go-live.

## Open decisions

Applied on 1 November 2026, and still needing the confirmations in the Decisions table of [06-access-control.md](06-access-control.md#decisions): the value check, delivery by link or attachment, and the outage draft.

These two wait on facts that nobody has yet.

| Question | Working answer | Who decides |
|---|---|---|
| Where is it hosted? | Any hosting must allow encryption at rest, a private database, the outage targets, and health data under Venezuelan law | Laboratory, counsel |
| Are the second factor and password rules workable at the bench? | Apply them, and test them in the pilot | Owner, lead bioanalyst |

## Sources

Checked on 1 November 2026. These are technical references, and following them isn't a claim of compliance.

- [OWASP Top 10:2025](https://top10.owasp.org/2025/)
- [NIST SP 800-63B](https://pages.nist.gov/800-63-4/sp800-63b.html): password length, content, breach checks, no scheduled changes, one-time codes, session limits
- [OWASP Password Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html): Argon2id parameters
- [OWASP HTTP Headers Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html): header values
- [v0 GitHub integration](https://v0.app/docs/github): branches, pull requests, and deployment
