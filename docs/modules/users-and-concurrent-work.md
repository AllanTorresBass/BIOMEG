# Users and concurrent work

**Catalog:** The system is built so bioanalysts, auxiliaries, and receptionists work at the same time, in an orderly way. A second sentence adds physicians to the simultaneous users: “recepcionistas, bioanalistas y médicos.” The about page also names assistants and secretaries.  
**Release named by the vendor:** 9.0 for the operational-advantages paragraph.  
**Evidence:** [Published] on the services page and the about page.

This module is access and shared use. It is not a human-resources system. Nothing is published about payroll, shifts, or licenses of the staff.

## Published behavior

- Several people use the system at the same time.
- The work is described as orderly (“de forma ordenada”).
- Named roles, taking the services page and the about page together:
  - receptionist (recepcionista)
  - auxiliary (auxiliar)
  - secretary (secretaria)
  - assistant (asistente)
  - bioanalyst (bioanalista)
  - physician (médico)
- The about page says these roles work simultaneously “sin complicaciones.”
- Client photographs show more than one desktop PC in a single laboratory, with the program on the screen. Multi-workstation use is **observed**.

“Ordenada” is not defined. It may mean separate tasks, record locking, or only that the software does not require paper handoff. Do not promote it to a concurrency-control specification.

## Roles and the work they are associated with

The association is **inferred** from the role name and from the modules. The vendor never publishes a permission matrix.

| Role | Published fact | Work this dossier attaches to the role |
|---|---|---|
| Receptionist | Concurrent user | [Admission](patient-admission.md), [billing](billing-and-payments.md), handing over [delivery](result-delivery.md) |
| Secretary | Concurrent user | Front desk, overlapping reception |
| Assistant / auxiliary | Concurrent user | [Samples](quality-control.md), possible [result entry](result-entry.md) |
| Bioanalyst | Concurrent user | [Results](result-entry.md), [validation](validation.md), [quality control](quality-control.md) |
| Physician | Concurrent user | Requesting and reading. No commission module and no physician portal are published |

Assistant and auxiliary may be two words for one job. The site uses both and does not define them.

## What is not published

- Login inside the desktop application. The only published login text is the website [client panel](client-panel.md), which says “tu cuenta” without naming the holder, and does not describe a bioanalyst’s workstation.
- Passwords, lockout, password expiry, or per-user accounts versus a shared Windows login.
- Which role can validate, refund, change a result, or edit the catalog.
- Record locking when two people open the same admission.
- Multi-site: whether a user in Maracay and a user in another branch share one database. The company has offices in two countries. That is the vendor’s organization, not a multi-branch module.
- Audit of who signed in.

Photographs show a Windows desktop application. A shared database is the usual way several PCs work on the same patients. The database product is **not published**. See the architecture section of the research dossier.

## Place in the flow

Every other module assumes a person is logged in and allowed to act. This module does not have a step number. It is the condition for the flow.

Implementation staff also exist. The company says it adapts the system to how the laboratory works. An implementer role inside the product is **not published**.

## What the module must handle

**Inferred** from simultaneous named roles:

| Concern | Why it is required |
|---|---|
| A user identity | Simultaneous work without identities cannot be orderly |
| A role or set of allowed actions | The named jobs are different |
| Shared current data | Reception and the bench must see the same admission |
| Protection against two writes destroying one result | “Ordenada” is otherwise only a slogan |

## Relationships

| Module | Link |
|---|---|
| [Patient admission](patient-admission.md) | Front-desk roles |
| [Validation](validation.md) | Bioanalyst, by professional practice, not by a published permission |
| [Client panel](client-panel.md) | A different login, for a customer, not for these staff roles |
| [Exam traceability](exam-traceability.md) | Needs the user identity if the trail records actors |

## Open questions

1. Is there one account per person?
2. Can permissions be changed by the laboratory, or only by the vendor?
3. What does a second user see when the first user is editing an admission?
4. Are physicians a full workstation role or a read-only role?
5. Does one installation serve more than one site?
