# Observed runtime

**Architecture status:** Observed, except where a sentence is marked otherwise.  
**Related:** [Desktop client](desktop-client.md), [Data store](data-store.md), [Web layer](web-layer.md)

This file is the short list of runtime facts that do not depend on the CTO’s résumé. If another architecture note conflicts with this one, this one wins. What was on a screen on 30 October 2026 follows [../session/README.md](../session/README.md), as [../README.md](../README.md) says.

A live session on 30 October 2026 is transcribed in [../session/README.md](../session/README.md). It confirms a Windows desktop shell titled Menú Principal del Sistema de Control de Exámenes Clínicos (SICOEXC), with the BCV rate, a QR on/off flag, and a Saturday-price flag on the status line. The wallpaper advertises version 10. The marketing site still says 9.0. Mantenimiento includes Respaldo de la BD, so a database backup is named. The form was not opened. The engine is still not named.

## What was seen

| Fact | Evidence | Label |
|---|---|---|
| The laboratory program runs on desktop monitors | Client photographs on the official gallery, including Vitalab (Ecuador) and Rivas Zulab (Venezuela), show the SICOEXC screen on a PC monitor | Observed |
| Those PCs are Windows desktops | Window chrome and the desktop around the application in the same photographs | Observed |
| One site has more than one PC | Reception and bench photographs show several workstations in the same laboratory | Observed |
| The program is used at the front desk and in the lab room | Placement of those PCs | Observed |
| It is not a phone-only product | No mobile clinical screen is published, and the working pictures are PCs | Observed |
| The public website is WordPress | `https://labsicoexc.com/wp-json/wp/v2/pages` responds as a WordPress REST API | Observed |
| That website is a brochure | Its pages are company text, photo galleries, a contact form, and a shop-style payment page | Observed |
| A login page exists at `/panel-de-clientes/` | The only sentence retrieved from it is “Inicia sesión en tu cuenta” | Observed |
| Two pages that sound like interface manuals are galleries | `/lista-de-examenes/` and `/customer-cabinet/` | Observed |
| Some pictures on the interface page are generated | File names contain “ChatGPT Image” | Observed |
| Marketing names the product release 9.0 | Services page | Published |
| No release notes, installer, server requirements, or upgrade path are on the site | Absence after reviewing the public pages | Not published |

Photographs are small. Menu labels, the database server, and cables to analyzers cannot be read from them. Do not read a menu from them. The menus are in the session notes. See section 6 of the research dossier.

## What one site implies

Several Windows PCs in one laboratory, all expected to see the same patient, imply a shared store on that site. The store might be a database server, a shared file, or a hosted service. The photographs do not show a server room. The implication of sharing is **inferred**. The engine is documented in [data-store.md](data-store.md) as unknown.

The vendor says receptionists, auxiliaries, secretaries, bioanalysts, and physicians work at the same time. That sentence agrees with the photographs. It still does not name the network.

## What is not a runtime fact

| Statement | Why it stays out of this file |
|---|---|
| The client is Visual Basic 6.0 | Résumé skill. See [desktop-client.md](desktop-client.md) |
| The database is SQL Server or MySQL | Same |
| Reports are Crystal Reports | Same |
| Delivery is a PHP service | Same |
| Each country has its own server | The company lists 13 countries of clients. It does not describe hosting |
| The Huancayo office is a data center | It is a published branch address and a business listing with weekday hours |

## Version and change

Only **9.0** is named on the public site. The session's wallpaper advertises version 10, and the running build's version is not shown. There is no public list of what 8.x contained, whether 9.0 replaces the desktop program or adds services beside it, or how a laboratory upgrades. Client photographs are not captioned with a version number, so they cannot be tied to 9.0.

## Open questions

1. Does each laboratory run its own server, or does the vendor host the data?
2. Are the bench PCs fat clients or remote-desktop sessions onto one PC?
3. Which Windows versions are supported?
4. Is there an installer, a license server, or a dongle?
5. How does a site move from an older build to version 9.0?
