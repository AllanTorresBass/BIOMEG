import 'server-only'

import { getClient } from '@/lib/db/memory/client-store'
import { printSecretsOf, vigenteIssueOf } from '@/lib/db/memory/issue-store'
import { findReport } from '@/lib/db/memory/report-store'
import { reportDateOf, resultsOf, sectionRelease, sectionsWithResults } from '@/lib/db/memory/result-store'
import { demoSeed } from '@/lib/db/memory/seed'
import { isValueCheckOn } from '@/lib/server/settings'
import { strings } from '@/lib/strings'
import { computeAge, formatAge, formatCedula, formatDate, LAB_TIME_ZONE } from '@/lib/utils/format'
import type { OrderStub } from '@/types/domain/order-stub.types'
import type { ReportKind, ReportRequest } from '@/types/domain/report.types'
import type { ReportAvailability, ReportDocument, ReportRow, ReportSection } from '@/types/orders/report.types'

const dash = strings.empty.dash
const SEX_LABEL = { F: 'Femenino', M: 'Masculino' } as const

/** LIBERADO prints as issued. A partly loaded order prints as a draft. Anything else prints nothing. */
export function reportKindOf(stub: Pick<OrderStub, 'hasResult' | 'released' | 'correctionOpen'>): ReportKind | 'EN_REVISION' | 'EMPTY' {
  if (stub.correctionOpen) return 'EN_REVISION'
  if (stub.released) return 'ISSUED'
  if (stub.hasResult) return 'DRAFT'
  return 'EMPTY'
}

function todayInLab(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: LAB_TIME_ZONE }).format(new Date())
}

function rowsOf(stub: OrderStub, kind: ReportKind): ReportRow[] {
  const byId = new Map(demoSeed.resultLines.map((line) => [line.id, line]))
  const issue = kind === 'ISSUED' ? vigenteIssueOf(stub.id) : null
  const source = issue
    ? issue.lines.map((line) => ({ lineId: line.lineId, value: line.value, mark: line.mark }))
    : resultsOf(stub.id).map((cell) => ({ lineId: cell.lineId, value: cell.value, mark: cell.mark }))
  return source.flatMap((entry) => {
    const line = byId.get(entry.lineId)
    if (!line || entry.value.trim() === '') return []
    return [
      {
        lineId: line.id,
        name: line.name,
        value: entry.value,
        unit: line.unit ?? '',
        reference: line.reference,
        mark: entry.mark,
      },
    ]
  })
}

function sectionsFor(stub: OrderStub, kind: ReportKind, lineId: string | null): ReportSection[] {
  const byId = new Map(demoSeed.resultLines.map((line) => [line.id, line]))
  const rows = rowsOf(stub, kind).filter((row) => lineId === null || row.lineId === lineId)
  const sections: ReportSection[] = []
  for (const row of rows) {
    const line = byId.get(row.lineId)
    if (!line) continue
    let section = sections.find((entry) => entry.title === line.section && entry.subsection === line.subsection)
    if (!section) {
      section = { title: line.section, subsection: line.subsection, rows: [] }
      sections.push(section)
    }
    section.rows.push(row)
  }
  return sections
}

function processedByOf(stub: OrderStub, sections: ReportSection[]): ReportDocument['processedBy'] {
  const titles = [...new Set(sections.map((section) => section.title))]
  const names = titles.flatMap((title) => {
    const release = sectionRelease(stub.id, title)
    return release ? [{ section: title, name: release.byName }] : []
  })
  const unique = new Set(names.map((entry) => entry.name))
  if (unique.size === 1) return [{ section: null, name: names[0]!.name }]
  return names
}

/** Builds what the paper and the PDF print. A stored issued report wins, so printed values stay as printed. */
export function buildReport({ stub, mode, lineId, origin }: ReportRequest): ReportAvailability {
  const kind = reportKindOf(stub)
  if (kind === 'EN_REVISION') return { kind: 'EN_REVISION' }
  if (kind === 'EMPTY') return { kind: 'EMPTY' }

  const issue = kind === 'ISSUED' ? vigenteIssueOf(stub.id) : null
  const stored = findReport(stub.id, mode, lineId, issue?.id ?? null)
  const storedInfo = stored ? { id: stored.id, createdAt: stored.createdAt, byName: stored.byName } : null
  if (stored && !stored.draft) return { kind: 'READY', document: stored.document, stored: storedInfo }

  const sections = sectionsFor(stub, kind, mode === 'PRUEBA' ? lineId : null)
  if (sections.length === 0) return { kind: 'EMPTY' }

  const draft = kind === 'DRAFT'
  const filled = new Set(sectionsWithResults(stub.id))
  const allSections = [...new Set(demoSeed.resultLines.map((line) => line.section))]
  const settings = demoSeed.settings
  const client = getClient(stub.clientId)
  const sample = stub.sampleDate ?? stub.createdAt.slice(0, 10)
  const reportDate = reportDateOf(stub.id)
  const secrets = issue ? printSecretsOf(issue.id) : null
  const showQr = settings.qrEnabled && !draft && secrets !== null && origin !== null

  const document: ReportDocument = {
    orderId: stub.id,
    mode,
    lineId: mode === 'PRUEBA' ? lineId : null,
    draft,
    missing: draft ? allSections.filter((title) => !filled.has(title)) : [],
    lab: {
      name: strings.brand.name,
      descriptor: strings.brand.descriptor,
      rif: (settings.rif || strings.brand.rifUnconfirmed).replace(/^RIF\s+/i, ''),
    },
    patient: {
      paciente: stub.clientName,
      cedula: stub.cedulaType && stub.cedulaDigits ? formatCedula(stub.cedulaType, stub.cedulaDigits) : dash,
      edad: client?.birthDate ? formatAge(computeAge(client.birthDate, sample)) : dash,
      genero: client?.sex ? SEX_LABEL[client.sex] : dash,
      telefono: client?.phone || dash,
      convenio: stub.convenioName ?? dash,
      fechaMuestra: formatDate(sample),
      fechaReporte: formatDate(reportDate ?? todayInLab()),
      orden: stub.number ?? stub.id,
    },
    sections,
    processedBy: processedByOf(stub, sections),
    verifyUrl: showQr ? `${origin}/verificar/${secrets.token}` : null,
    consultCode: showQr && isValueCheckOn() ? secrets.consultCode : null,
    issueId: issue?.id ?? null,
  }
  return { kind: 'READY', document, stored: storedInfo }
}
