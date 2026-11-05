import type { ReportSection } from '@/types/orders/report.types'
import type { PageSection, ReportPage } from '@/types/domain/report-layout.types'

/** Lines a page holds. The first page also carries the laboratory and patient blocks. */
export const FIRST_PAGE_LINES = 24
export const NEXT_PAGE_LINES = 40
const HEADING_COST = 2

/** A section heading with no rows is omitted. The rest flows onto as many pages as it needs. */
export function paginate(sections: readonly ReportSection[]): ReportPage[] {
  const pages: ReportPage[] = [[]]
  let used = 0
  let capacity = FIRST_PAGE_LINES

  for (const section of sections) {
    if (section.rows.length === 0) continue
    let current: PageSection | null = null
    let continued = false
    for (const row of section.rows) {
      const needed = current ? 1 : 1 + HEADING_COST
      if (used + needed > capacity) {
        pages.push([])
        used = 0
        capacity = NEXT_PAGE_LINES
        current = null
        continued = true
      }
      if (!current) {
        current = { title: section.title, subsection: section.subsection, rows: [], continued }
        pages.at(-1)?.push(current)
        used += HEADING_COST
      }
      current.rows.push(row)
      used += 1
    }
  }
  return pages
}
