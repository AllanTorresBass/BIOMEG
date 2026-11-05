import { describe, expect, it, vi } from 'vitest'

vi.mock('server-only', () => ({}))

import { getStub } from '@/lib/db/memory/order-index'
import { FIRST_PAGE_LINES, paginate } from '@/lib/domain/report-layout'
import { buildReport, reportKindOf } from '@/lib/server/domain/report'
import { renderReportPdf } from '@/lib/server/pdf/report-pdf'
import { qrModules } from '@/lib/server/qr'
import type { ReportRow } from '@/types/orders/report.types'

const origin = 'https://lab.example'

function released() {
  const stub = getStub('o-1')
  if (!stub) throw new Error('demo order missing')
  return stub
}

describe('report kind', () => {
  it('prints released orders as issued and partial ones as drafts', () => {
    expect(reportKindOf({ hasResult: true, released: true, correctionOpen: false })).toBe('ISSUED')
    expect(reportKindOf({ hasResult: true, released: false, correctionOpen: false })).toBe('DRAFT')
    expect(reportKindOf({ hasResult: false, released: false, correctionOpen: false })).toBe('EMPTY')
  })

  it('holds the report back while a correction is open', () => {
    expect(reportKindOf({ hasResult: true, released: true, correctionOpen: true })).toBe('EN_REVISION')
  })
})

describe('report document', () => {
  it('builds the issued document without private patient fields', () => {
    const built = buildReport({ stub: released(), mode: 'PACIENTE', lineId: null, origin })
    expect(built.kind).toBe('READY')
    if (built.kind !== 'READY') return
    expect(built.document.draft).toBe(false)
    expect(built.document.sections.length).toBeGreaterThan(0)
    const keys = Object.keys(built.document.patient)
    expect(keys).not.toContain('email')
    expect(keys).not.toContain('medico')
    expect(keys).not.toContain('nacimiento')
  })

  it('marks a partial order as a draft with no QR', () => {
    const built = buildReport({ stub: { ...released(), released: false }, mode: 'PACIENTE', lineId: null, origin })
    expect(built.kind).toBe('READY')
    if (built.kind !== 'READY') return
    expect(built.document.draft).toBe(true)
    expect(built.document.verifyUrl).toBeNull()
  })

  it('returns the revision state when a correction is open', () => {
    const built = buildReport({ stub: { ...released(), correctionOpen: true }, mode: 'PACIENTE', lineId: null, origin })
    expect(built.kind).toBe('EN_REVISION')
  })
})

describe('pdf and qr', () => {
  it('renders a PDF from the document', () => {
    const built = buildReport({ stub: released(), mode: 'PACIENTE', lineId: null, origin })
    if (built.kind !== 'READY') throw new Error('not ready')
    const pdf = renderReportPdf(built.document)
    expect(pdf.subarray(0, 5).toString()).toBe('%PDF-')
    expect(pdf.length).toBeGreaterThan(1000)
  })

  it('makes a square QR matrix', () => {
    const modules = qrModules('https://lab.example/verificar/abc')
    expect(modules.length).toBeGreaterThan(20)
    expect(modules.every((row) => row.length === modules.length)).toBe(true)
  })
})

describe('pagination', () => {
  const row = (n: number): ReportRow => ({ lineId: `l-${n}`, name: `Prueba ${n}`, value: '1', unit: '', reference: '', mark: null })

  it('keeps a short report on one page', () => {
    expect(paginate([{ title: 'A', subsection: null, rows: [row(1), row(2)] }])).toHaveLength(1)
  })

  it('flows a long section onto more pages and repeats its heading', () => {
    const rows = Array.from({ length: FIRST_PAGE_LINES + 10 }, (_, i) => row(i))
    const pages = paginate([{ title: 'A', subsection: null, rows }])
    expect(pages.length).toBeGreaterThan(1)
    expect(pages[1]?.[0]?.continued).toBe(true)
  })

  it('omits a section with no rows', () => {
    const pages = paginate([{ title: 'Vacia', subsection: null, rows: [] }])
    expect(pages.flat()).toHaveLength(0)
  })
})
