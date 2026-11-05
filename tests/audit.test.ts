import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('server-only', () => ({}))
vi.mock('next/headers', () => ({ headers: async () => new Headers() }))

import { listAudit, resetAuditForTests } from '@/lib/db/memory/audit-store'
import { auditEvent } from '@/lib/server/audit'
import { withAuditRequest } from '@/lib/server/audit-request'

afterEach(() => resetAuditForTests())

describe('audit row', () => {
  it('stores no change on a refusal, and shares one request id', async () => {
    await withAuditRequest(async () => {
      await auditEvent({
        command: 'client.merge',
        outcome: 'REFUSED',
        reason: 'ROLE',
        change: { before: { cedula: '12345678' }, after: null },
      })
      await auditEvent({ command: 'order.save', outcome: 'ALLOWED', recordType: 'order', recordId: 'o-1' })
    })

    const [refused, saved] = listAudit()
    expect(refused?.change).toBeNull()
    expect(refused?.result.outcome).toBe('REFUSED')
    expect(refused?.what.event).toBe('patient.merge')
    expect(saved?.what.command).toBe('order.save')
    expect(saved?.what.event).toBe('order.open')
    expect(refused?.requestId).toBe(saved?.requestId)
    expect(refused?.sequence).toBe(1)
    expect(saved?.sequence).toBe(2)
    expect(saved?.severity).toBe('INFO')
  })

  it('records a failed send with no change', async () => {
    await auditEvent({
      command: 'delivery.whatsapp',
      outcome: 'FAILED',
      reason: 'STATE',
      change: { before: null, after: { value: '12,7' } },
    })
    const [row] = listAudit()
    expect(row?.result.outcome).toBe('FAILED')
    expect(row?.change).toBeNull()
    expect(row?.severity).toBe('NOTICE')
    expect(JSON.stringify(row)).not.toContain('12,7')
  })

  it('drops control characters from a motivo and keeps the row', async () => {
    await auditEvent({ command: 'payment.reverse', outcome: 'ALLOWED', motivo: 'linea\n<script>' })
    expect(listAudit()[0]?.why.motivo).toBe('linea<script>')
  })
})
