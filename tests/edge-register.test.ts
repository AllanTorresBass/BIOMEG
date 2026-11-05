import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { EDGE_REGISTER } from '@/lib/quality/edge-register'

describe('edge register', () => {
  it('fails when a finished-stage id has no test', () => {
    for (const edge of EDGE_REGISTER) {
      const source = readFileSync(edge.testFile, 'utf8')
      expect(source, edge.id).toContain(edge.id)
    }
  })
})
