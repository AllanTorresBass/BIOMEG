# SICOEXC research dossier

**Product:** SICOEXC — Sistema de Control de Exámenes Clínicos  
**Vendor:** Soluciones Informáticas SM, C.A.  
**Document type:** Public-source research. Not a vendor manual.  
**Researched:** 29 October 2026  
**Primary source:** [https://labsicoexc.com/](https://labsicoexc.com/)

This dossier records what Soluciones Informáticas SM publishes about SICOEXC, what client photos and founder profiles add, and what is not public. Statements are labeled so a vendor claim is not treated as a verified specification.

| Label | Meaning |
|---|---|
| **Published** | Stated on the official site, a founder profile, or a company post |
| **Observed** | Visible in vendor photos or page structure, without a written specification. Sightings from the 30 October 2026 session are cited to [session/](session/) |
| **Inferred** | A reasonable reading of published features. Not confirmed by the vendor |
| **Not published** | Requested or commonly assumed, and absent from public sources |

---

## 1. Product summary

SICOEXC is a laboratory information system for public and private clinical laboratories, clinics, and hospitals. It covers patient admission, exam ordering, analyzer connectivity, result validation, report delivery, and billing.

The company markets **version 9.0** as the current release. Work began in **2012**, started by clinical-pathology professionals (bioanalysts and engineers).

The official description:

> SICOEXC (Sistema de Control de Exámenes Clínicos) es un software especializado en la gestión e informatización de laboratorios clínicos públicos y privados, clínicas y hospitales.

A founder project note from the same period describes a narrower core: administrative functions of clinical laboratories, automated patient registration, result entry, and statistical reports of results.

---

## 2. Company and market

### 2.1 Organization

| Item | Detail | Label |
|---|---|---|
| Legal name | Soluciones Informáticas SM, C.A. | Published |
| Tax id | RIF J-40359179-2, stated on the CEO’s public profile | Published |
| Commercial name | SICOEXC / LabSICOEXC | Published |
| Founded | 2012 | Published |
| Staff claim | About 20 specialists | Published |
| Client claim | More than 500 clients in 13 countries (current site). A February 2019 post said 400 certified laboratories in Latin America and Africa | Published, figures conflict |
| Slogan | “Sin límites y sin fronteras.” | Published |

### 2.2 People named by the vendor

| Person | Role on the official site |
|---|---|
| Ing. Savid Tablante | Cofounder and CEO. Systems engineer. Public profile also describes him as database administrator, systems analyst, and technical support |
| Licda. Iliani Lozada | Cofounder. Bioanalyst and medical technologist in clinical laboratory |
| Ing. Miguel Dias | Cofounder and CTO. Systems engineer. His public profile lists Visual Basic 6.0, PHP, MySQL, SQL Server, Crystal Reports, HTML5, CSS, and JavaScript |

The CTO skill list is a résumé. It is not a published architecture for SICOEXC.

### 2.3 Locations

| Site | Address published |
|---|---|
| Principal | Maracay, Estado Aragua, Venezuela |
| Branch | Gálvez Durán 360, Huancayo, Junín, Peru |
| Privacy notice | Jirón Cosmos 206. The notice names “SAVID, comercialmente conocido como SICOEXC” as the data controller |

Hours listed for the Huancayo listing: Monday–Friday, 08:00–17:00.

### 2.4 Countries named on the about page

Venezuela, Colombia, Ecuador, Peru, Paraguay, Guatemala, Mexico, Equatorial Guinea, Nicaragua, El Salvador, Honduras, Bolivia, and the Dominican Republic.

That list is 13 countries and matches the site’s “13 países” claim. Africa appears in the 2019 post (Equatorial Guinea is on the current country list). No independent registry of installations was found.

### 2.5 Clients shown in vendor galleries

These names appear on the official photo slides or image labels. They are evidence of installations the vendor chooses to show, not a client census.

| Client | Country | What the photo shows |
|---|---|---|
| Centro de Especialidades Médicas A & L, C.A. | Venezuela | Reception and a workstation |
| Laboratorio Clínico Rivas Zulab | Venezuela | Reception desk with the program on desktop monitors |
| Laboratorios LABMED S.R.L. | Peru | Workstation, microscope, centrifuge |
| Laboratorio de Análisis Clínico Vitalab | Ecuador | A monitor with the SICOEXC name on screen |
| Clínica Esperanza, Malabo | Equatorial Guinea | Laboratory staff and workstations |
| Diagnosis | Paraguay | Named by an image label |
| San Benigno | Paraguay | Named by an image label |
| Analab | Guatemala | Named by an image label |

Vitalab’s wall sign lists pregnancy tests, clinical chemistry, hematology, immunology, urinalysis, stool tests, and rapid tests, with results promised in one hour. That is the laboratory’s service menu, not a SICOEXC module list.

### 2.6 Contact

| Channel | Value |
|---|---|
| Website | https://labsicoexc.com/ |
| Phone | +51 918163537 |
| Email | labsicoexc@gmail.com |
| Privacy contact | solucionesinformaticasm22@gmail.com |
| Instagram | https://www.instagram.com/sicoexc/ |
| Older project URL | https://innovaciontecnologicas.com.ve — returned an error when checked on 29 October 2026 |

---

## 3. Feature catalog

### 3.1 Version 9.0, as published

Source: [https://labsicoexc.com/services-2/](https://labsicoexc.com/services-2/).

| Feature | What the vendor says it does |
|---|---|
| Multi-rate admission and billing | Charge patients in more than one currency |
| Payment methods | Modern and local methods, named example: Cashea |
| Patient admission | Admission module tied to multi-currency billing and payment methods |
| Automatic result delivery | Send exams to the patient by WhatsApp |
| Email delivery | Send results by email (stated in the security section of the same page) |
| QR authenticity | QR codes on reports. The site says the practice started with COVID-19 tests and now applies to all tests |
| Fiscal homologation | Compliant with current tax rules and homologated by SENIAT in Venezuela. Rules can be adapted by country. This is a vendor claim; no independent SENIAT listing was found |
| Quality control | Central storage and analytical follow-up of samples, intended to reduce errors |
| Analyzer connectivity | Bidirectional interface that reads analyzer results automatically and reduces transcription errors |
| Test catalog | More than 600 clinical diagnostic exams |
| Report personalization | Report and result layouts adapted to the laboratory’s identity |
| Exam traceability | Fast traceability of exams |
| Concurrent work | Receptionists, auxiliaries, secretaries, bioanalysts, and physicians use the system at the same time |
| Validation | The automation claim covers registration through delivery and validation of clinical exams |
| Learning curve | Described as intuitive, with a short training time |

### 3.2 Functions named outside the version 9.0 list

| Function | Source | Notes |
|---|---|---|
| Patient registration | CEO project description | Core administrative automation |
| Result entry (“carga de resultados”) | CEO project description | Manual entry exists alongside automatic analyzer import |
| Statistical reports of results | CEO project description | No report catalog is published |
| Centralized data | About page | Used as a sales point, with no storage design |
| Paper reduction | About page | Operational outcome, not a module |
| Customization to local working style | 2019 company post | “Nos adaptamos a la forma de trabajar” |
| Public and private labs, clinics, hospitals | Site and 2019 post | Target segments |
| Client login | Website page “Panel” | Only the sentence “Inicia sesión en tu cuenta” is published. Functions after login are unknown |

### 3.3 Often attributed, and not published

These items appear in secondary descriptions of the product. They are **not** on the official pages or in the founder’s public project text.

| Item | What is actually published |
|---|---|
| Electronic signature of the bioanalyst | Validation and QR codes. No digital-signature module is named |
| Physician commission management | Not mentioned |
| Medical history as its own module | Registration, result entry, and statistics. Not a clinical-record module |
| Patient portal download | WhatsApp, email, and QR are specified. A login page exists; its screens are not described |
| Home sample collection | The about page says tests can be done at home. The wording describes a laboratory service, not a software function |
| Inventory, appointments, barcode labels, reference ranges, reflex rules, critical-value alerts | Not mentioned publicly. The session shows inventory commands, and reports print reference text |
| Named analyzer brands or protocols (ASTM, HL7, serial, TCP) | Only “interfaz bidireccional” and “equipos automatizados” |

---

## 4. Operational workflow

The vendor does not publish a process manual. The sequence below is **inferred** from the features they do advertise. It is the business path those features imply, not a confirmed screen flow.

1. **Admit and bill.** Register the patient, select exams, charge in one or more currencies, and take a payment method such as Cashea. In Venezuela, the fiscal document is claimed to follow SENIAT rules.
2. **Order from the catalog.** Choose from a catalog of more than 600 exams.
3. **Track the sample.** Quality control stores and follows the sample through analysis.
4. **Produce the result.** A bidirectional interface reads the analyzer. Staff can also enter results manually, based on the founder’s description of “carga de resultados.”
5. **Validate.** The site includes validation before delivery. Who signs, and whether that signature is electronic, is not specified.
6. **Report.** A layout carrying the laboratory’s identity, with a QR code.
7. **Deliver.** WhatsApp and email. A client login exists; whether it offers download is not stated.
8. **Review.** Statistical reports of results, with no published list of those reports.

Roles that the vendor says work at the same time: receptionist, auxiliary, secretary, bioanalyst, and physician. Permissions per role are not published.

---

## 5. Architecture

No architecture document, deployment guide, or technology stack is published. This section separates observation from inference.

### 5.1 Observed

- Client photographs show the program on **Windows desktop monitors** at reception and in the laboratory, with several PCs in one site. That is a multi-workstation installation, not a phone-only product.
- The marketing site is WordPress. That site is the vendor’s brochure. It is not the laboratory application.
- A page titled **Panel** exposes a login. A separate page is titled **Interfaz LIS de comunicación**. Another is titled **Lista de clientes e interfaz LIS con equipos automatizados**. Both LIS pages are image galleries. They do not document protocols, ports, or device models.
- Version **9.0** is the release named on the marketing site. A live session on 30 October 2026 shows a banner that version 10 is available. The running build’s own version number is not in the title bar. Menus, the invoice form, and a result preview from that session are in [session/README.md](session/README.md).

### 5.2 Inferred, and not confirmed

The CTO’s public skills (Visual Basic 6.0, Crystal Reports, SQL Server, MySQL, PHP, HTML/CSS/JavaScript), together with the desktop screenshots, are consistent with this shape:

- A Windows desktop client used inside the laboratory.
- A shared SQL database (SQL Server or MySQL are both in his skill list; the product does not say which one it uses).
- Printed reports through a report engine such as Crystal Reports.
- A separate web layer, possibly PHP, for the client panel, WhatsApp or email delivery, and QR lookup.

Treat that as a hypothesis. Version 9.0 additions (WhatsApp, Cashea, QR, multi-currency) may be newer services around an older desktop core. Nothing public confirms or denies that.

### 5.3 Integration surface that is published

| Integration | Direction | Published behavior |
|---|---|---|
| Analyzers | Bidirectional | Reads results automatically. The “bidirectional” word implies the system can also send orders to the instrument. What is sent is not specified |
| WhatsApp | Outbound | Automatic delivery of results |
| Email | Outbound | Result delivery |
| QR | On the report | Authenticity check for the patient or recipient |
| Cashea | Payments | Named local payment method |
| Currencies | Billing | More than one currency on admission and invoicing |
| SENIAT | Fiscal, Venezuela | Homologation claimed by the vendor |
| Other countries | Fiscal and sanitary | “Opciones adaptadas a regulaciones fiscales y sanitarias según el país.” No country-by-country matrix is published |

---

## 6. Navigation

### 6.1 Application navigation

The marketing photographs were too small to read. A live session on 30 October 2026 shows the menu bar:

Pacientes, Hoja de Trabajo y Resultados, Registros, Administrativo, Estructura de Costos, Reportes, Mantenimiento, Ayuda.

Ayuda was not opened. Every other menu was opened and is transcribed in [session/README.md](session/README.md). The toolbar is Ingreso Particular, Ingreso Empresa, Hoja de Trabajo, Cargar Resultados, Presupuesto, Cierre Caja, Clave, Cerrar Sesión, Salir. The status line shows the active user, the BCV rate, whether QR is active, and whether Saturday pricing is active.

### 6.2 Website navigation

These are pages of the marketing site, retrieved from the site on 29 October 2026.

| Page | URL | Content |
|---|---|---|
| Inicio | https://labsicoexc.com/ | Company introduction, 2012 origin, offices, founders |
| Sobre nosotros | https://labsicoexc.com/about-us/ | Countries, client and staff counts, reasons to buy |
| Servicios | https://labsicoexc.com/services-2/ | Version 9.0 feature list |
| Lista de clientes e interfaz LIS | https://labsicoexc.com/lista-de-examenes/ | Photo gallery of clients and equipment. The title promises an equipment list; the page body is images |
| Interfaz LIS de comunicación | https://labsicoexc.com/customer-cabinet/ | Image gallery. Filename pattern on several images is “ChatGPT Image,” so those frames are generated illustrations, not product screenshots |
| Contáctanos | https://labsicoexc.com/contact-us/ | Contact |
| Panel de clientes | https://labsicoexc.com/panel-de-clientes/ | Login shell only |
| Pago | https://labsicoexc.com/pago/ | Checkout page, including test-mode labels |
| Aviso de privacidad | https://labsicoexc.com/aviso-de-privacidad/ | Privacy notice, updated 21 April 2026 |

The privacy notice says the site collects contact-form data and, automatically, region, searches, and ads viewed. ARCO requests (access, rectification, cancellation, opposition) go by email and are answered within 10 business days. That notice covers the website, not the clinical database inside a laboratory.

---

## 7. Data model

**The database schema is not public.** Table names, keys, and field lists are proprietary. The model below is a conceptual reading of published features. It is not SICOEXC’s schema and must not be implemented as if it were.

A live invoice and a BIOMEG result preview add labels the public pages never printed: birth date, email, motivo, médico, razón social, factura number, control number, IVA, IGTF, and a QR on the page. Those labels are recorded in [session/facturacion.md](session/facturacion.md) and [session/print-preview.md](session/print-preview.md). They are still labels, not column names.

### 7.1 Records the published features require

| Concept | Why it has to exist |
|---|---|
| Patient | Admission and later visits |
| Ordering physician | Physicians are named users, and an order has a requester |
| User and role | Reception, auxiliary, secretary, bioanalyst, and physician work concurrently |
| Exam definition | Catalog of 600+ tests and per-laboratory report layout |
| Admission / order | The visit that is billed |
| Order line | Each exam on that admission |
| Sample | Quality control and analytical follow-up |
| Result | Manual entry and automatic import from an analyzer |
| Validation event | Results are validated before delivery |
| Invoice and payment | Multi-currency charges, Cashea, fiscal document |
| Report template | Laboratory identity and QR |
| Delivery event | WhatsApp and email |
| Analyzer map | Bidirectional link between an instrument test code and a catalog exam |
| Audit of the result | Traceability is advertised, so a history of who changed a result is the usual implementation. The vendor does not say the history is stored |

### 7.2 Relationships, inferred

```text
Patient 1──* Admission
Physician 1──* Admission
Admission 1──* Order line ──1 Exam definition
Admission 1──* Invoice 1──* Payment
Order line 1──* Sample
Sample 1──* Result
Result *──1 Validation event
Admission 1──* Report 1──* Delivery event
Analyzer 1──* Analyzer map *──1 Exam definition
User *──* Role
```

Missing from every public source: field names, reference-range tables, units, sample types, tube types, worksheets, quality-control lots, price lists per insurer, tax lines, and fiscal control numbers. Those structures are normal in this kind of product. Their presence in SICOEXC is **not established** by the vendor's pages. Later sources add to this: public reports print units and reference text as cells, and the 30 October session shows a worksheet command, five price columns, tax lines, and a control number field. See [data-model/README.md](data-model/README.md) and [session/README.md](session/README.md).

---

## 8. Security and compliance, as published

| Topic | Published position |
|---|---|
| Result authenticity | QR code on the report. Validation step before delivery |
| Electronic signature | Not named |
| Access control | Concurrent roles exist. Password policy, profiles, and audit scope are not described |
| Fiscal — Venezuela | SENIAT homologation claimed for version 9.0 |
| Fiscal — other countries | Adaptation claimed, with no regulation cited (for example SUNAT in Peru is not named) |
| Personal data on the website | Privacy notice of 21 April 2026, ARCO rights, 10-business-day response |
| Clinical data inside the LIS | No privacy, retention, backup, or encryption statement was found |

---

## 9. What a buyer or analyst still has to get from the vendor

Ask Soluciones Informáticas SM for these. They are not on the public site.

1. Module list and menu map for version 9.0, with screenshots of each module.
2. Role and permission matrix.
3. Supported analyzers, protocols, and whether the interface sends orders as well as receiving results.
4. Database engine, server operating system, and whether the client is desktop-only.
5. How WhatsApp and email are sent (business API, desktop session, or a third-party gateway) and how the QR code is verified.
6. The SENIAT homologation document, and the fiscal model used in Peru and the other listed countries.
7. Whether electronic signature, physician commissions, medical history, inventory, appointments, and barcode labels exist, and in which version.
8. What the client panel shows after login.
9. Backup, audit log, and multi-site behavior.
10. A data dictionary or entity list under a confidentiality agreement, if schema-level work is required.

---

## 10. Source list

Checked 29 October 2026, except the live session, which is dated 30 October 2026.

| Source | What it contributed |
|---|---|
| https://labsicoexc.com/ | Origin, offices, founders, segment |
| https://labsicoexc.com/about-us/ | Countries, client and staff claims, positioning |
| https://labsicoexc.com/services-2/ | Version 9.0 feature list |
| https://labsicoexc.com/lista-de-examenes/ | Client and laboratory photographs, slides 7–12 read in detail |
| https://labsicoexc.com/customer-cabinet/ | LIS page is an image gallery; several assets are labeled as generated images |
| https://labsicoexc.com/aviso-de-privacidad/ | Website privacy notice |
| https://labsicoexc.com/panel-de-clientes/ | Login shell only |
| Savid Tablante, public LinkedIn project “Sistema de Control de Examenes Clinicos (SICOEXC)” | Registration, result entry, statistical reports; RIF; older site URL |
| Savid Tablante post, 26 February 2019 | 400-laboratory claim, Latin America and Africa, proprietary notice |
| Miguel Dias, public LinkedIn profile | Programming skills. Not a product specification |
| https://www.yasteq.com/PE/Huancayo/336147079782363/Software-para-Laboratorios-Clinicos-Sicoexc | Huancayo address, hours, Instagram |
| Live session, 30 October 2026, transcribed in [session/README.md](session/README.md) | Application menus, invoice fields, price-list columns, BIOMEG preview toolbar. Patient identifiers were not copied |

Slides `Diapositiva7.jpg` through `Diapositiva12.jpg` on the client page were opened. They are team and client photographs. Later slides in the same series follow the same gallery pattern. They are not a user manual.

---

## 11. Limits of this dossier

- Nothing here is a reverse engineering of an installed copy. The schema, menus, and protocols were not taken from a database or binary.
- Marketing numbers (500 clients, 600 exams, 13 countries, SENIAT homologation) are repeated as the vendor states them.
- Generated images on the LIS communication page were not used as evidence of product behavior.
- If the vendor supplies a manual or a demonstration database, this dossier should be revised against that primary material and the inferred sections replaced.
