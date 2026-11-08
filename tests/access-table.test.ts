import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

import { PERMISSION_ROWS, TABLE_VERSION } from '@/lib/auth/table'
import type { PermissionRow, Role } from '@/types/auth/auth.types'

const root = process.cwd()
const rulePage = readFileSync(join(root, 'docs/product/06-access-control.md'), 'utf8')
const referencePage = readFileSync(join(root, 'docs/product/07-rule-reference.md'), 'utf8')

function tableRows(markdown: string): string[][] {
  return markdown
    .split('\n')
    .filter((line) => /^\| R-\d+ /.test(line))
    .map((line) => line.split('|').slice(1, -1).map((cell) => cell.trim()))
}

const cellAt = (cells: readonly string[], index: number): string => cells[index] ?? ''

const referenceRows = tableRows(referencePage)
const matrixRows = tableRows(rulePage.split('### Client, public, and system')[0] ?? '')

const MATRIX_ROLES: Role[] = ['RECEPCION', 'AUXILIAR', 'BIOANALISTA', 'ADMINISTRACION']

function rowFor(id: string): PermissionRow {
  const row = PERMISSION_ROWS.find((candidate) => candidate.id === id)
  if (!row) throw new Error(`Missing table row ${id}`)
  return row
}

function parseCell(cell: string) {
  if (cell === '—') return null
  const stepUp = /^S\b/.test(cell)
  const confirm = /^C\b/.test(cell) || /same day, own, C/.test(cell)
  return {
    read: /^R\b/.test(cell),
    gesture: stepUp ? 'STEP_UP' : confirm ? 'CONFIRM' : 'NONE',
    motivo: /motivo/.test(cell),
  }
}

describe('permission table against the docs', () => {
  it('has the version and the 105 rows', () => {
    expect(TABLE_VERSION).toBe(6)
    expect(PERMISSION_ROWS).toHaveLength(105)
    expect(referenceRows).toHaveLength(105)
  })

  it('keeps the rule-reference order, with R-034 before R-033', () => {
    expect(PERMISSION_ROWS.map((row) => row.id)).toEqual(referenceRows.map((cells) => cellAt(cells, 0)))
    const ids = PERMISSION_ROWS.map((row) => row.id)
    expect(ids.indexOf('R-034')).toBeLessThan(ids.indexOf('R-033'))
  })

  it('has the same commands as the rule reference, in order', () => {
    for (const cells of referenceRows) {
      const id = cellAt(cells, 0)
      const documented = [...cellAt(cells, 2).matchAll(/`([^`]+)`/g)].map((match) => match[1])
      expect(rowFor(id).commands, id).toEqual(documented)
    }
  })

  it('has the same applies-when conditions as the rule reference', () => {
    for (const cells of referenceRows) {
      const id = cellAt(cells, 0)
      const row = rowFor(id)
      const text = cellAt(cells, 3)
      expect(row.blocked, id).toBe(text === 'Blocked')
      const documentedCount = [...text.matchAll(/` is (?:one of|true|false|`)/g)].length
      expect(row.when.length, id).toBe(documentedCount)
      for (const condition of row.when) {
        if ('is' in condition) {
          expect(text, id).toContain(`\`${condition.fact}\` is ${condition.is}`)
        } else {
          expect(text, id).toContain(`\`${condition.fact}\` is`)
          for (const value of condition.oneOf) expect(text, id).toContain(`\`${value}\``)
        }
      }
    }
  })

  it('has the same role conditions, relations, and scopes as the rule reference', () => {
    for (const cells of referenceRows) {
      const id = cellAt(cells, 0)
      const text = cellAt(cells, 4)
      for (const grant of Object.values(rowFor(id).grants)) {
        for (const condition of grant.when ?? []) expect(text, id).toContain(`\`${condition.fact}\``)
        if (grant.relation) expect(text, id).toContain(`relation \`${grant.relation}\``)
        if (grant.scope) expect(text, id).toContain(`scope \`${grant.scope}\``)
      }
    }
  })

  it('gives each staff role the grant, gesture, and motivo in the matrix', () => {
    expect(matrixRows.length).toBeGreaterThan(80)
    const blockedIds = new Set(PERMISSION_ROWS.filter((row) => row.blocked).map((row) => row.id))
    for (const cells of matrixRows) {
      const id = cellAt(cells, 0)
      const row = rowFor(id)
      // R-067 shows S for Administración in the matrix but is blocked until "relación" is known.
      if (blockedIds.has(id)) {
        expect(Object.keys(row.grants), id).toHaveLength(0)
        continue
      }
      MATRIX_ROLES.forEach((role, position) => {
        const expected = parseCell(cellAt(cells, 2 + position))
        const actual = row.grants[role]
        const label = `${id} ${role}`
        if (expected === null) {
          expect(actual, label).toBeUndefined()
          return
        }
        expect(actual, label).toBeDefined()
        expect(actual?.gesture, label).toBe(expected.gesture)
        expect(Boolean(actual?.motivo), label).toBe(expected.motivo)
        expect(Boolean(actual?.read), label).toBe(expected.read)
      })
    }
  })

  it('grants a staff role nothing on a row the matrix leaves blank', () => {
    for (const id of ['R-011', 'R-022', 'R-030', 'R-067', 'R-090', 'R-121', 'R-122']) {
      expect(Object.keys(rowFor(id).grants), id).toHaveLength(0)
    }
  })
})
