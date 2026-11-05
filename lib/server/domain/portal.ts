import 'server-only'

import { vigenteIssueOf } from '@/lib/db/memory/issue-store'
import { searchClients } from '@/lib/db/memory/client-store'
import { ordersOf } from '@/lib/db/memory/order-index'
import { findReport } from '@/lib/db/memory/report-store'
import { sectionRelease } from '@/lib/db/memory/result-store'
import { destinationOf } from '@/lib/server/domain/delivery'
import { buildReport } from '@/lib/server/domain/report'
import { renderReportPdf } from '@/lib/server/pdf/report-pdf'
import { formatDate } from '@/lib/utils/format'
import type { ClientRecord } from '@/types/domain/client.types'
import type { OrderStub } from '@/types/domain/order-stub.types'
import type { SendChannel } from '@/types/orders/delivery.types'
import type { ReportDocument } from '@/types/orders/report.types'
import type { PortalVisit, PortalVisitState } from '@/types/portal/portal.types'

/** Clients whose cédula and birth date both match what was typed. Several can match; the portal lists them all. */
export function matchClients(type: string, digits: string, birthDate: string): ClientRecord[] {
  const cleaned = digits.replace(/\D/g, '')
  if (cleaned === '' || birthDate === '') return []
  return searchClients({ text: cleaned, includeInactive: true }).filter(
    (client) => client.cedulaType === type && client.cedulaDigits === cleaned && client.birthDate === birthDate,
  )
}

export interface PortalContact {
  channel: SendChannel
  destination: string
}

/** WhatsApp first, then email. A sign-in code is not a result, so it needs no consent, only a contact on file. */
export function contactFor(clients: readonly ClientRecord[]): PortalContact | null {
  for (const channel of ['WHATSAPP', 'CORREO'] as const) {
    for (const client of clients) {
      const destination = destinationOf(client, channel)
      if (destination) return { channel, destination }
    }
  }
  return null
}

export function maskDestination(contact: PortalContact): string {
  if (contact.channel === 'CORREO') {
    const [user = '', host = ''] = contact.destination.split('@')
    return `${user.slice(0, 2)}***@${host}`
  }
  return `***${contact.destination.slice(-3)}`
}

function releasedTitles(stub: OrderStub, document: ReportDocument): string[] {
  return document.sections
    .map((section) => section.title)
    .filter((title, index, all) => all.indexOf(title) === index && sectionRelease(stub.id, title) !== null)
}

function portalState(stub: OrderStub, releasedCount: number): PortalVisitState {
  if (stub.correctionOpen) return 'EN_REVISION'
  if (stub.released) return 'LIBERADO'
  return releasedCount > 0 ? 'PARCIAL' : 'PENDIENTE'
}

/** The document the portal may show or download. Sections that are not released never enter it. */
function portalDocument(stub: OrderStub): { state: PortalVisitState; document: ReportDocument | null } {
  if (stub.correctionOpen) return { state: 'EN_REVISION', document: null }
  if (!stub.hasResult && !stub.released) return { state: 'PENDIENTE', document: null }

  const built = buildReport({ stub, mode: 'PACIENTE', lineId: null, origin: null })
  if (built.kind !== 'READY') return { state: portalState(stub, 0), document: null }
  if (stub.released) return { state: 'LIBERADO', document: built.document }

  const released = releasedTitles(stub, built.document)
  if (released.length === 0) return { state: 'PENDIENTE', document: null }
  const document: ReportDocument = {
    ...built.document,
    draft: true,
    sections: built.document.sections.filter((section) => released.includes(section.title)),
    missing: built.document.sections.map((section) => section.title).filter((title) => !released.includes(title)),
    verifyUrl: null,
    consultCode: null,
    issueId: null,
  }
  return { state: 'PARCIAL', document }
}

function visitOf(stub: OrderStub): PortalVisit {
  const { state, document } = portalDocument(stub)
  return {
    orderId: stub.id,
    number: stub.number ?? stub.id,
    dateText: formatDate(stub.sampleDate ?? stub.createdAt.slice(0, 10)),
    state,
    sections: document?.sections ?? [],
    canDownload: document !== null,
  }
}

/** The visits of every matched client, newest first. A voided order never appears. */
export function visitsOf(clientIds: readonly string[]): PortalVisit[] {
  const stubs = clientIds
    .flatMap((clientId) => ordersOf(clientId))
    .filter((stub) => !stub.voided)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  return stubs.map(visitOf)
}

/** One visit, only when it belongs to the signed-in client. Anything else looks like a visit that does not exist. */
export function visitFor(clientIds: readonly string[], orderId: string): { stub: OrderStub; visit: PortalVisit } | null {
  const stub = clientIds.flatMap((clientId) => ordersOf(clientId)).find((candidate) => candidate.id === orderId)
  if (!stub || stub.voided) return null
  return { stub, visit: visitOf(stub) }
}

export interface PortalFile {
  pdf: Buffer
  name: string
}

/** The file for the Descargar informe action. A released order gets its issued PDF; a partial one a labeled partial. */
export function portalFileOf(stub: OrderStub): PortalFile | null {
  const { state, document } = portalDocument(stub)
  if (!document) return null
  const number = stub.number ?? stub.id
  if (state === 'LIBERADO') {
    const issue = vigenteIssueOf(stub.id)
    const stored = issue ? findReport(stub.id, 'PACIENTE', null, issue.id) : null
    return { pdf: stored?.pdf ?? renderReportPdf(document), name: `informe-${number}.pdf` }
  }
  return { pdf: renderReportPdf(document), name: `informe-${number}-parcial.pdf` }
}
