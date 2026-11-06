# Gate B — public-web research brief (for Stage 6)

**Authority:** This page does **not** close Gate B and does **not** replace Venezuelan counsel, the laboratory, the owner, or the accountant. It summarizes what public sources say so those people can answer faster.  
**Status:** Gate B remains **Deferred** / answers **Unknown** in [gate-b.md](gate-b.md) until a named person writes a reply.  
**Evidence labels:** Facts below from public pages are **Published** (secondary web / firm summaries). Anything this laboratory must still choose is **Unknown**. Do not paste these rows into [gate-b.md](gate-b.md) as if counsel had signed them.

Ask sheet: [gate-b-ask.md](gate-b-ask.md).

---

## 1. IVA (G2) — **Published** (confirm with accountant)

| Topic | What public sources say | Sources (secondary) |
|---|---|---|
| General rate | **16%** general IVA on most goods and services | [PwC Tax Summaries — Venezuela VAT](https://taxsummaries.pwc.com/venezuela/individual/other-taxes); [Grant Thornton indirect tax — Venezuela](https://www.grantthornton.global/en/insights/indirect-tax-guide/indirect-tax---Venezuela/); Deloitte Doing Business Venezuela 2026 (IVA 16%) |
| Reduced / luxury | **8%** reduced list; luxury often cited as **31%** (16% + 15%) | Same |
| Extra IVA on FX payments | Law allows an extra 5–25% on FX/crypto payments; **not activated** until a decree sets the % (still not published in these summaries) | PwC Tax Summaries |

**Still Unknown for BIOMEG:** Whether *this* laboratory’s clinical services use 16%, any exemption, and whether the accountant treats them as ordinary taxpayers for IVA.

**Working proposal for accountant to accept or reject:** invoice IVA rate **16%** until they say otherwise.

---

## 2. IGTF (G2) — **Published** (confirm with accountant)

| Topic | What public sources say | Sources (secondary) |
|---|---|---|
| FX / crypto payments | Transitional alícuota **3%** on payments in foreign currency or non-sovereign crypto (law art. 4 nums. 5–6 / art. 24), until the Executive sets another rate | Moore Venezuela IGTF compilation PDF; secondary explainers (e.g. Andes Ventas / Cachicamo summaries of LIGTF) |
| Who collects | Often framed as perception by **sujetos pasivos especiales** under SENIAT providences (e.g. SNAT/2022/000013 in secondary sources) | Same |

**Still Unknown for BIOMEG:** Whether the laboratory is a sujeto pasivo especial that must show IGTF on the invoice; whether IGTF applies only to the foreign-currency portion of abonos (prototype already models that shape); base with or without IVA.

**Working proposal for accountant to accept or reject:** IGTF **3%** on the foreign-currency payment amount when the lab must collect it; **0%** line when they say the lab must not collect.

---

## 3. Rounding (G2) — **Published** (confirm with accountant)

| Topic | What public sources say | Sources |
|---|---|---|
| Bolívar display | Amounts in Bs with **two decimal places** (céntimos) | BCV lineamientos de redondeo for the 2021 monetary expression (Grant Thornton VE PDF of BCV guidelines) |
| Rule (reexpression era) | Round once to two decimals: if the third decimal &lt; 5 keep; if ≥ 5 bump the second | Same |

**Still Unknown for BIOMEG:** Whether the accountant wants line-level vs total-level rounding, and USD vs Bs rounding order on mixed invoices.

**Working proposal:** money fields keep **two decimals**; round half-up on the third decimal when converting to display cents.

---

## 4. Control N° (G2) — **Published** (confirm with owner + accountant)

| Topic | What public sources say | Sources |
|---|---|---|
| Formato / forma libre | **N° de Control** is assigned by the **authorized printer** (or digital printer), format like `00-########`; not invented by the app | SENIAT PA SNAT/2011/00071 summarized in secondary guides (e.g. Andes Ventas) |
| Máquina fiscal | Fiscal-machine invoices **do not** carry printer Control N°; they carry the machine’s own consecutive number | Same (PA 0071 Art. 14 in those summaries) |
| Void / reprint | Control / form numbers are not reused; damaged forms are voided and kept | Same |

**Still Unknown for BIOMEG:** Which emission medium this laboratory uses (talonario, forma libre, máquina fiscal, digital). That choice decides whether BIOMEG stores a printer Control N°, a machine consecutive, or “Pendiente” until the device returns a number.

**Working proposal:** keep Control N° as **Pendiente** until the fiscal medium is chosen; do not invent a SENIAT layout. Stage 6 schema should keep the field nullable / text, as today.

---

## 5. Hosted database / health data — **Published** context only (**Unknown** for this lab)

| Topic | What public sources say | Sources |
|---|---|---|
| General data-protection law | Venezuela has **no** single comprehensive personal-data statute like GDPR; Constitution arts. 28/60 and TSJ criteria (e.g. 2011) are often cited | LEĜA Abogados on electronic medical records; Espacio Público overview |
| Clinical confidentiality | Health information treated as highly confidential; patient history rules in health / deontology sources | LEĜA; practical guides (secondary) |
| Cloud | Sensitive health data raises higher duty of care; contracts, encryption, access control, location of data matter; Conatel regulates some “Gestión de Datos” hosting attributes in VE | Secondary legal/practice notes; Conatel announcements |

**Still Unknown (counsel + laboratory only):**

- LAN-only vs hosted vs mixed for BIOMEG  
- Whether a **hosted** Postgres (e.g. Vercel Marketplace / Neon) is acceptable for this laboratory’s health data  
- Retention periods for results, audit, portal credentials  
- Minors / portal credential form  

**No working proposal.** Do not start Stage 6 on an invented hosting choice.

---

## 6. What this means for Stage 6 engineering

| Can start from public research alone? | Item |
|---|---|
| No | V0-25+ on a real hosted DB (needs deployment answer) |
| No | Invented IVA/IGTF in product as settled Design rules (needs owner/accountant) |
| Yes (prototype already) | Keep rates as **settings** that start empty / caption until G2 closes |
| Yes (design) | Schema: money as decimal; Control N° as text nullable; audit hash chain after Gate B opens |

---

## How to use this brief

1. Send [gate-b-ask.md](gate-b-ask.md) plus this brief to owner, accountant, counsel, laboratory.  
2. They write **their** answers into [gate-b.md](gate-b.md) with dates.  
3. Only then mark Collection **Received** and open V0-25.
