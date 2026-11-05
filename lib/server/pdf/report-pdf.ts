import 'server-only'

import { readFileSync } from 'node:fs'
import path from 'node:path'
import { paginate } from '@/lib/domain/report-layout'
import { qrModules } from '@/lib/server/qr'
import { strings } from '@/lib/strings'
import type { ReportDocument } from '@/types/orders/report.types'
import type { Logo } from '@/types/server/report-pdf.types'

const text = strings.report
const PAGE_W = 595
const PAGE_H = 842
const MARGIN = 40
const COL = { exam: 40, result: 215, unit: 290, reference: 365, mark: 515 }

let cachedLogo: Logo | null = null

/** The lockup is a plain RGB PNG, so its compressed data can go into the PDF as it is. */
function loadLogo(): Logo {
  if (cachedLogo) return cachedLogo
  const file = readFileSync(path.join(process.cwd(), 'public', 'report-header.png'))
  const width = file.readUInt32BE(16)
  const height = file.readUInt32BE(20)
  const parts: Buffer[] = []
  let offset = 8
  while (offset < file.length) {
    const length = file.readUInt32BE(offset)
    const type = file.toString('ascii', offset + 4, offset + 8)
    if (type === 'IDAT') parts.push(file.subarray(offset + 8, offset + 8 + length))
    offset += 12 + length
  }
  cachedLogo = { width, height, data: Buffer.concat(parts) }
  return cachedLogo
}

function esc(value: string): string {
  const safe = [...value].map((char) => (char.charCodeAt(0) > 255 ? '?' : char)).join('')
  return safe.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)')
}

function wrap(value: string, max: number): string[] {
  const words = value.split(/\s+/).filter(Boolean)
  const lines: string[] = []
  let line = ''
  for (const word of words) {
    if ((line + ' ' + word).trim().length > max && line) {
      lines.push(line)
      line = word
    } else {
      line = (line + ' ' + word).trim()
    }
  }
  if (line) lines.push(line)
  return lines.length > 0 ? lines : ['']
}

class Canvas {
  private ops: string[] = []

  text(x: number, y: number, value: string, size = 9, bold = false): void {
    this.ops.push(`BT /${bold ? 'F2' : 'F1'} ${size} Tf ${x} ${PAGE_H - y} Td (${esc(value)}) Tj ET`)
  }

  line(x1: number, y1: number, x2: number, y2: number, width = 0.6): void {
    this.ops.push(`${width} w ${x1} ${PAGE_H - y1} m ${x2} ${PAGE_H - y2} l S`)
  }

  box(x: number, y: number, w: number, h: number): void {
    this.ops.push(`0.8 w ${x} ${PAGE_H - y - h} ${w} ${h} re S`)
  }

  watermark(value: string): void {
    this.ops.push(
      `q 0.7071 0.7071 -0.7071 0.7071 150 280 cm BT /F2 110 Tf 0.9 g 0 0 Td (${esc(value)}) Tj ET Q 0 g`,
    )
  }

  logo(x: number, y: number, w: number, h: number): void {
    this.ops.push(`q ${w} 0 0 ${h} ${x} ${PAGE_H - y - h} cm /Im1 Do Q`)
  }

  qr(x: number, y: number, size: number, modules: boolean[][]): void {
    const scale = size / modules.length
    const rects: string[] = []
    modules.forEach((row, my) =>
      row.forEach((dark, mx) => {
        if (dark) rects.push(`${mx} ${modules.length - my - 1} 1 1 re`)
      }),
    )
    this.ops.push(`q ${scale} 0 0 ${scale} ${x} ${PAGE_H - y - size} cm ${rects.join(' ')} f Q`)
  }

  stream(): Buffer {
    return Buffer.from(this.ops.join('\n'), 'latin1')
  }
}

function drawHeader(canvas: Canvas, doc: ReportDocument): number {
  const logo = loadLogo()
  const logoW = 150
  canvas.logo(MARGIN, MARGIN, logoW, (logoW * logo.height) / logo.width)
  canvas.text(MARGIN, MARGIN + 80, `RIF ${doc.lab.rif}`, 8)

  if (doc.verifyUrl) {
    canvas.qr(PAGE_W - MARGIN - 78, MARGIN, 78, qrModules(doc.verifyUrl))
    if (doc.consultCode) {
      canvas.text(PAGE_W - MARGIN - 78, MARGIN + 90, text.consultCode, 7)
      canvas.text(PAGE_W - MARGIN - 78, MARGIN + 100, doc.consultCode, 9, true)
    }
  }

  let y = MARGIN + 118
  if (doc.draft) {
    canvas.box(MARGIN, y - 10, PAGE_W - MARGIN * 2, 28)
    canvas.text(MARGIN + 8, y + 2, text.incomplete, 10, true)
    if (doc.missing.length > 0) canvas.text(MARGIN + 80, y + 2, text.incompleteMissing(doc.missing.join(', ')).slice(0, 80), 8)
    y += 36
  }

  const p = doc.patient
  const fields: [string, string][] = [
    [text.labels.paciente, p.paciente],
    [text.labels.cedula, p.cedula],
    [text.labels.edad, p.edad],
    [text.labels.genero, p.genero],
    [text.labels.telefono, p.telefono],
    [text.labels.convenio, p.convenio],
    [text.labels.fechaMuestra, p.fechaMuestra],
    [text.labels.fechaReporte, p.fechaReporte],
    [text.labels.orden, p.orden],
  ]
  fields.forEach(([label, value], index) => {
    const column = index % 2
    const row = Math.floor(index / 2)
    const x = MARGIN + column * 270
    canvas.text(x, y + row * 13, label, 7.5, true)
    canvas.text(x + 82, y + row * 13, value.slice(0, 34), 8.5)
  })
  return y + Math.ceil(fields.length / 2) * 13 + 14
}

function drawColumns(canvas: Canvas, y: number): number {
  canvas.line(MARGIN, y - 9, PAGE_W - MARGIN, y - 9, 0.8)
  canvas.text(COL.exam, y, text.columns.exam, 7.5, true)
  canvas.text(COL.result, y, text.columns.result, 7.5, true)
  canvas.text(COL.unit, y, text.columns.unit, 7.5, true)
  canvas.text(COL.reference, y, text.columns.reference, 7.5, true)
  canvas.text(COL.mark, y, text.columns.mark, 7.5, true)
  canvas.line(MARGIN, y + 5, PAGE_W - MARGIN, y + 5, 0.8)
  return y + 19
}

function drawFooter(canvas: Canvas, doc: ReportDocument, page: number, total: number): void {
  canvas.line(MARGIN, PAGE_H - 52, PAGE_W - MARGIN, PAGE_H - 52, 0.5)
  canvas.text(MARGIN, PAGE_H - 38, text.footer(doc.lab.rif), 8)
  canvas.text(PAGE_W - MARGIN - 40, PAGE_H - 38, text.page(page, total), 8)
}

/** Builds the pages as text a reader can select and search. Black and white keeps every meaning. */
export function renderReportPdf(doc: ReportDocument): Buffer {
  const pages = paginate(doc.sections)
  const total = pages.length
  const canvases = pages.map((page, index) => {
    const canvas = new Canvas()
    if (doc.draft) canvas.watermark(text.watermark)
    let y = index === 0 ? drawHeader(canvas, doc) : MARGIN + 10
    y = drawColumns(canvas, y)
    for (const section of page) {
      canvas.text(COL.exam, y, section.subsection ? `${section.title} - ${section.subsection}` : section.title, 9, true)
      y += 15
      for (const row of section.rows) {
        const reference = wrap(row.reference, 34)
        canvas.text(COL.exam, y, row.name.slice(0, 36), 8.5)
        canvas.text(COL.result, y, row.value, 8.5, true)
        canvas.text(COL.unit, y, row.unit.slice(0, 14), 8)
        reference.slice(0, 2).forEach((part, i) => canvas.text(COL.reference, y + i * 9, part, 7.5))
        if (row.mark) canvas.text(COL.mark, y, row.mark, 8.5, true)
        y += reference.length > 1 ? 24 : 15
      }
      y += 4
    }
    if (index === total - 1 && doc.processedBy.length > 0) {
      y += 6
      for (const entry of doc.processedBy) {
        canvas.text(MARGIN, y, `${text.processedBy}${entry.section ? ` (${entry.section})` : ''}: ${entry.name}`, 8.5)
        y += 12
      }
    }
    drawFooter(canvas, doc, index + 1, total)
    return canvas
  })

  const chunks: Buffer[] = []
  const offsets: number[] = []
  let length = 0
  const push = (value: string | Buffer): void => {
    const buffer = typeof value === 'string' ? Buffer.from(value, 'latin1') : value
    chunks.push(buffer)
    length += buffer.length
  }
  const object = (id: number, body: string | Buffer[]): void => {
    offsets[id] = length
    push(`${id} 0 obj\n`)
    if (typeof body === 'string') push(body)
    else body.forEach(push)
    push('\nendobj\n')
  }

  const logo = loadLogo()
  const pageIds = canvases.map((_, i) => 6 + i * 2)
  push('%PDF-1.4\n')
  object(1, '<< /Type /Catalog /Pages 2 0 R >>')
  object(2, `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(' ')}] /Count ${total} >>`)
  object(3, '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>')
  object(4, '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>')
  object(5, [
    Buffer.from(
      `<< /Type /XObject /Subtype /Image /Width ${logo.width} /Height ${logo.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /FlateDecode /DecodeParms << /Predictor 15 /Colors 3 /BitsPerComponent 8 /Columns ${logo.width} >> /Length ${logo.data.length} >>\nstream\n`,
      'latin1',
    ),
    logo.data,
    Buffer.from('\nendstream', 'latin1'),
  ])
  canvases.forEach((canvas, i) => {
    const pageId = 6 + i * 2
    const content = canvas.stream()
    object(
      pageId,
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_W} ${PAGE_H}] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> /XObject << /Im1 5 0 R >> >> /Contents ${pageId + 1} 0 R >>`,
    )
    object(pageId + 1, [Buffer.from(`<< /Length ${content.length} >>\nstream\n`, 'latin1'), content, Buffer.from('\nendstream', 'latin1')])
  })

  const count = 6 + canvases.length * 2
  const xref = length
  push(`xref\n0 ${count}\n0000000000 65535 f \n`)
  for (let id = 1; id < count; id += 1) push(`${String(offsets[id]).padStart(10, '0')} 00000 n \n`)
  push(`trailer\n<< /Size ${count} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`)
  return Buffer.concat(chunks)
}
