import 'server-only'

import { getClient } from '@/lib/db/memory/client-store'
import {
  discrepanciesOf,
  getCorrection,
  getNote,
  processedByOf,
  reportDateOf,
  resultsOf,
  sectionRelease,
  sectionsWithResults,
} from '@/lib/db/memory/result-store'
import { demoSeed } from '@/lib/db/memory/seed'
import { isNumericValue, resultOrderState } from '@/lib/domain/result-rules'
import { worklistState } from '@/lib/server/domain/worklist'
import type { OrderStub } from '@/types/domain/order-stub.types'
import type { GridSection, ResultGridView } from '@/types/orders/result.types'

/** The catalog is Unknown (gap G1), so every order shows the same invented sections. */
export const BACTERIOLOGY_SECTION = 'BACTERIOLOGIA'

export function hasBacteriologySection(): boolean {
  return demoSeed.resultLines.some((line) => line.section === BACTERIOLOGY_SECTION)
}

export function buildResultGrid(
  stub: OrderStub,
  options: { canEnter: boolean; isBioanalyst: boolean; section?: string },
): ResultGridView {
  const cells = new Map(resultsOf(stub.id).map((cell) => [cell.lineId, cell]))
  const client = getClient(stub.clientId)
  const withResults = new Set(sectionsWithResults(stub.id))
  const noteShown = new Set<string>()
  const sections: GridSection[] = []

  for (const line of demoSeed.resultLines) {
    if (options.section && line.section !== options.section) continue
    let group = sections.find((entry) => entry.title === line.section && entry.subsection === line.subsection)
    if (!group) {
      const first = !noteShown.has(line.section)
      noteShown.add(line.section)
      const release = sectionRelease(stub.id, line.section)
      const open = getCorrection(stub.id, line.section)
      group = {
        title: line.section,
        subsection: line.subsection,
        note: first ? getNote(stub.id, line.section) : '',
        rows: [],
        // While a correction is open the section is editable, so it no longer shows as released.
        released: release && !open ? { byName: release.byName, at: release.at } : null,
        releasable: !release && withResults.has(line.section),
        correction: open ? { byName: open.byName, at: open.at, motivo: open.motivo } : null,
        correctable: Boolean(release) && !open,
      }
      sections.push(group)
    }
    const cell = cells.get(line.id)
    group.rows.push({
      lineId: line.id,
      name: line.name,
      unit: line.unit,
      reference: line.reference,
      numeric: isNumericValue(line.value),
      value: cell?.value ?? '',
      mark: cell?.mark ?? null,
      source: cell?.source ?? null,
      byName: cell?.byName ?? null,
      at: cell?.at ?? null,
      version: cell?.version ?? 0,
      incoming: cell?.incoming ?? null,
    })
  }

  const allSections = [...new Set(demoSeed.resultLines.map((line) => line.section))]
  const filled = new Set(demoSeed.resultLines.filter((line) => cells.has(line.id)).map((line) => line.section))
  const state = resultOrderState(stub)
  const chip = worklistState(stub)
  const lastAt = [...cells.values()].map((cell) => cell.at).sort().at(-1) ?? null

  return {
    orderId: stub.id,
    orderNumber: stub.number ?? stub.id,
    patientName: stub.clientName,
    patientSex: client?.sex ?? null,
    sampleDate: stub.sampleDate ?? null,
    reportDate: reportDateOf(stub.id) ?? (stub.released ? lastAt : null),
    processedBy: processedByOf(stub.id),
    state,
    chip,
    missingSections: chip === 'INCOMPLETO' ? allSections.filter((title) => !filled.has(title)) : [],
    sections,
    revision: sections
      .map((section) => `${section.released?.at ?? ''}/${section.correction?.at ?? ''}`)
      .join('|'),
    canEnter: options.canEnter && state !== 'LIBERADO',
    isBioanalyst: options.isBioanalyst,
    discrepancies: discrepanciesOf(stub.id),
    hasBacteriology: hasBacteriologySection(),
  }
}
