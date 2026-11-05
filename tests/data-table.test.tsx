import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { DataTable } from '@/components/shared/DataTable'
import { BLOCKED_TEXT } from './stubs/blocked'

const columns = [
  { key: 'name', header: 'Nombre', rowHeader: true, cell: (row: { name: string; city: string | null }) => row.name },
  { key: 'city', header: 'Ciudad', cell: (row: { name: string; city: string | null }) => row.city },
]
const base = { caption: 'Lista', columns, rowKey: (row: { name: string }) => row.name, emptyText: 'Sin registros.' }
const render = (props: Partial<Parameters<typeof DataTable<{ name: string; city: string | null }>>[0]>) =>
  renderToStaticMarkup(<DataTable {...base} rows={[]} {...props} />)

describe('DataTable states', () => {
  it('empty shows the sentence and no table', () => {
    const html = render({})
    expect(html).toContain('Sin registros.')
    expect(html).not.toContain('<table')
  })

  it('a single row uses a row header', () => {
    const html = render({ rows: [{ name: 'Ana', city: 'Caracas' }] })
    expect(html).toContain('scope="row"')
    expect(html).toContain('Caracas')
  })

  it('a partial row shows the dash, never a blank', () => {
    expect(render({ rows: [{ name: 'Ana', city: null }] })).toContain('—')
  })

  it('an error keeps the rows on screen', () => {
    const html = render({ rows: [{ name: 'Ana', city: 'Caracas' }], errorText: 'No se pudo actualizar.' })
    expect(html).toContain('role="alert"')
    expect(html).toContain('Ana')
  })

  it('no permission shows no values at all', () => {
    const html = render({ rows: [{ name: 'Ana', city: 'Caracas' }], blocked: true })
    expect(html).not.toContain('Ana')
    expect(html).toContain(BLOCKED_TEXT)
  })
})
