import 'server-only'

import QRCode from 'qrcode'

/** The QR as a grid of dark modules. The paper draws it as SVG and the PDF as filled squares. */
export function qrModules(payload: string): boolean[][] {
  const code = QRCode.create(payload, { errorCorrectionLevel: 'M' })
  const size = code.modules.size
  const rows: boolean[][] = []
  for (let y = 0; y < size; y += 1) {
    const row: boolean[] = []
    for (let x = 0; x < size; x += 1) row.push(code.modules.get(x, y) === 1)
    rows.push(row)
  }
  return rows
}

/** One SVG path for every dark module, so the code stays sharp at any print size. */
export function qrPath(modules: boolean[][]): { path: string; size: number } {
  const parts: string[] = []
  modules.forEach((row, y) => {
    row.forEach((dark, x) => {
      if (dark) parts.push(`M${x} ${y}h1v1h-1z`)
    })
  })
  return { path: parts.join(''), size: modules.length }
}
