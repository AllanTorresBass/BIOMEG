import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'

const actor = vi.hoisted(() => ({ userId: 'u-administracion', roles: ['ADMINISTRACION'] as string[], stepUp: true }))

vi.mock('server-only', () => ({}))
vi.mock('next/headers', () => ({ headers: async () => new Headers() }))
vi.mock('next/cache', () => ({ revalidatePath: () => undefined }))
vi.mock('@/lib/server/session/current', () => ({
  getStaffContext: async () => actorContext(),
  toDecisionSession: (context: { locked: boolean; account: { id: string; roles: string[] } }) => ({
    valid: true,
    active: !context.locked,
    userId: context.account.id,
    roles: context.account.roles,
  }),
}))

import { listAudit, resetAuditForTests } from '@/lib/db/memory/audit-store'
import { startDraft } from '@/lib/db/memory/draft-store'
import { createOrder, getOrder } from '@/lib/db/memory/order-store'
import { resetRegistriesForTests } from '@/lib/db/memory/registry-store'
import { demoSeed } from '@/lib/db/memory/seed'
import { computeOrderTotals } from '@/lib/domain/order-totals'
import { auditEvent } from '@/lib/server/audit'
import { todayInLab } from '@/lib/server/domain/client-rules'
import { editPrice, setRate, setSaturday } from '@/lib/server/commands/prices'
import { saveOrder } from '@/lib/server/commands/order-save'
import { saveRegistryRow } from '@/lib/server/commands/registries'
import { createUser, disableUser } from '@/lib/server/commands/users'
import { getAuditScreen, getStatistics, salariesLocked } from '@/lib/server/queries/back-office'
import { listStaffDirectory, resetSessionForTests } from '@/lib/server/session/store'
import { strings } from '@/lib/strings'
import type { StaffRole } from '@/types/auth/auth.types'
import type { StaffContext } from '@/types/session/session.types'

function actorContext(): StaffContext {
  return {
    locked: false,
    account: {
      id: actor.userId,
      username: actor.userId,
      displayName: actor.userId,
      roles: actor.roles as StaffRole[],
      mustChangePassword: false,
    },
    session: {
      id: 's-office',
      userId: actor.userId,
      workstation: 'PC-1',
      startedAt: Date.now(),
      lastSeenAt: Date.now(),
      locked: false,
      ended: false,
      stepUpAt: actor.stepUp ? Date.now() : null,
    },
  }
}

const settingsCopy = structuredClone(demoSeed.settings)
const pricesCopy = structuredClone(demoSeed.priceRows)
const wide = { from: '2000-01-01', to: '2099-12-31', event: '', userId: '', severity: '', outcome: '', recordId: '' }

function savedOrder(rateBs: string, physicianName: string | null, basis: 'ORDINARIO' | 'SABADO' = 'ORDINARIO') {
  const lines = [
    {
      id: 'l',
      examId: 'p-1',
      examName: 'HEMATOLOGIA COMPLETA',
      costType: null,
      column: 'PARTICULAR',
      priceUsd: '8.00',
      basis,
      status: 'DISPONIBLE',
      repeatMotivo: null,
      addedAt: '2026-11-05T12:00:00.000Z',
    },
  ]
  const base = { rate: rateBs, ivaRate: null, igtfRate: null, discountPct: '0' }
  return createOrder(
    `office-${rateBs}-${physicianName ?? 'none'}-${basis}-${Math.random()}`,
    {
      clientId: 'c-1',
      clientName: 'Paciente Demo',
      path: 'PARTICULAR',
      physicianId: 'm-1',
      physicianName,
      convenioId: null,
      convenioName: null,
      titular: '',
      billing: { cedula: '', razonSocial: '', direccion: '' },
      costType: null,
      motivo: '',
      sampleDate: null,
      lines,
      payments: [],
      discountPct: '0',
      discountMotivo: '',
      rateBs,
      rateDate: '2026-11-04',
      ivaRate: null,
      igtfRate: null,
      totals: computeOrderTotals({ ...base, lines, payments: [] }),
      savedById: 'u-recepcion',
      savedByName: 'Recepción Demo',
      savedAt: '2026-11-04T12:00:00.000Z',
    } as never,
    ['p-1'],
  )
}

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name)
    return statSync(path).isDirectory() ? walk(path) : [path]
  })
}

afterEach(() => {
  Object.assign(demoSeed.settings, structuredClone(settingsCopy))
  demoSeed.priceRows.splice(0, demoSeed.priceRows.length, ...structuredClone(pricesCopy))
  resetAuditForTests()
  resetRegistriesForTests()
  resetSessionForTests()
  actor.userId = 'u-administracion'
  actor.roles = ['ADMINISTRACION']
  actor.stepUp = true
})

describe('prices and switches', () => {
  it('leaves a saved order rate alone when the BCV rate changes, and warns an unsaved Guardar (E-51)', async () => {
    const order = savedOrder('100.00', null)
    const changed = await setRate({ rate: '200,00' })
    expect(changed.ok).toBe(true)
    expect(getOrder(order.id)?.rateBs).toBe('100.00')

    demoSeed.settings.rateDate = todayInLab()
    actor.userId = 'u-recepcion'
    actor.roles = ['RECEPCION']
    actor.stepUp = false
    const refused = await setRate({ rate: '210,00' })
    expect(refused.ok).toBe(false)
    expect(await editPrice({ examId: 'p-1', currency: 'USD', column: 'PARTICULAR', amount: '9,00', confirmed: true })).toMatchObject({ ok: false })

    const draft = startDraft('u-recepcion', 'PARTICULAR')
    draft.clientId = 'c-1'
    draft.lines.push({
      id: 'l-rate',
      examId: 'p-1',
      examName: 'HEMATOLOGIA COMPLETA',
      costType: null,
      column: 'PARTICULAR',
      priceUsd: '8.00',
      basis: 'ORDINARIO',
      status: 'DISPONIBLE',
      repeatMotivo: null,
      addedAt: '2026-11-05T12:00:00.000Z',
    })
    const warning = await saveOrder({ draftId: draft.id, key: `rate-${draft.id}`, rateSeen: '100.00' })
    expect(warning.ok).toBe(false)
    expect(warning.need).toBe('RATE_CHANGED')
    expect(warning.orderId).toBeNull()
    const warned = listAudit().filter((row) => row.what.event === 'order.rate.warn')
    expect(warned).toHaveLength(1)
    expect(warned[0]?.result.outcome).toBe('REFUSED')
  })

  it('toggles Precio sábado without a formula and without rewriting a saved line (E-52)', async () => {
    const order = savedOrder('889.26', 'Dr. Demo Uno', 'ORDINARIO')
    const price = demoSeed.priceRows[0]?.prices.PARTICULAR.usd
    const toggled = await setSaturday({ enabled: true, confirmed: true })
    expect(toggled.ok).toBe(true)
    expect(demoSeed.settings.saturdayPriceEnabled).toBe(true)
    expect(demoSeed.priceRows[0]?.prices.PARTICULAR.usd).toBe(price)
    expect(getOrder(order.id)?.lines[0]?.basis).toBe('ORDINARIO')
    expect(demoSeed.settings).not.toHaveProperty('saturdayFormula')
  })

  it('renames a physician without rewriting the name printed on a saved order', async () => {
    const order = savedOrder('889.26', 'Dr. Demo Uno')
    const renamed = await saveRegistryRow({ kind: 'physicians', id: 'm-1', name: 'Dr. Otro', active: true, requiresTitular: false })
    expect(renamed.ok).toBe(true)
    expect(getOrder(order.id)?.physicianName).toBe('Dr. Demo Uno')
  })
})

describe('users and Auditoría', () => {
  it('refuses to disable the last administrator, then allows it once another exists (E-02)', async () => {
    expect((await disableUser({ userId: 'u-administracion' })).ok).toBe(false)
    const created = await createUser({ displayName: 'Admin Dos', roles: ['ADMINISTRACION'] })
    expect(created.ok).toBe(true)
    const password = created.message.split(': ')[1] ?? ''
    expect(password.length).toBeGreaterThan(8)
    expect(JSON.stringify(listAudit())).not.toContain(password)
    const second = listStaffDirectory().find((person) => person.displayName === 'Admin Dos')
    expect(second).toBeTruthy()
    actor.userId = second?.id ?? ''
    expect((await disableUser({ userId: 'u-administracion' })).ok).toBe(true)
  })

  it('masks clinical text for Administración and shows it to Bioanalista (E-54)', async () => {
    await auditEvent({
      command: 'result.enter',
      outcome: 'ALLOWED',
      account: { id: 'u-bioanalista', username: 'bioanalista', displayName: 'Bioanalista Demo', roles: ['BIOANALISTA'], mustChangePassword: false },
      session: null,
      recordType: 'result',
      recordId: 'o-mask',
      motivo: 'nota clinica 12,7',
      change: { before: null, after: { value: '12,7' }, field: 'value' },
    })
    const hidden = await getAuditScreen(actorContext(), wide)
    expect(hidden.kind).toBe('READY')
    if (hidden.kind !== 'READY') return
    const row = hidden.rows.find((item) => item.event === 'result.enter')
    expect(row?.detail).toBe(strings.pendingReview.office.auditMasked)
    expect(row?.motivo).toBe(strings.pendingReview.office.auditMasked)
    expect(JSON.stringify(hidden)).not.toContain('12,7')

    actor.userId = 'u-bioanalista'
    actor.roles = ['BIOANALISTA']
    const shown = await getAuditScreen(actorContext(), wide)
    expect(shown.kind).toBe('READY')
    if (shown.kind !== 'READY') return
    expect(shown.rows.find((item) => item.event === 'result.enter')?.detail).toContain('12,7')
  })

  it('keeps Salarios behind a password re-entry', () => {
    actor.stepUp = false
    expect(salariesLocked(actorContext())).toBe(true)
    actor.stepUp = true
    expect(salariesLocked(actorContext())).toBe(false)
  })

  it('hides a refusal group smaller than five from Administración', async () => {
    for (let index = 0; index < 4; index += 1) {
      await auditEvent({
        command: 'order.save',
        outcome: 'REFUSED',
        reason: 'STATE',
        account: { id: 'u-auxiliar', username: 'auxiliar', displayName: 'Auxiliar Demo', roles: ['AUXILIAR'], mustChangePassword: false },
        session: null,
        recordType: 'order',
        recordId: 'o-small',
      })
    }
    const hidden = await getStatistics(actorContext(), wide)
    expect(hidden.kind).toBe('READY')
    if (hidden.kind !== 'READY') return
    expect(hidden.refusals.some((group) => group.label.startsWith('AUXILIAR'))).toBe(false)
    expect(hidden.suppressed).toBeGreaterThan(0)

    await auditEvent({
      command: 'order.save',
      outcome: 'REFUSED',
      reason: 'STATE',
      account: { id: 'u-auxiliar', username: 'auxiliar', displayName: 'Auxiliar Demo', roles: ['AUXILIAR'], mustChangePassword: false },
      session: null,
      recordType: 'order',
      recordId: 'o-small',
    })
    const shown = await getStatistics(actorContext(), wide)
    if (shown.kind !== 'READY') return
    expect(shown.refusals.some((group) => group.label === 'AUXILIAR order.save' && group.count >= 5)).toBe(true)
  })

  it('has no route that edits or deletes an audit row', () => {
    const routes = walk('app/api').filter((path) => path.endsWith('route.ts'))
    for (const path of routes) {
      const source = readFileSync(path, 'utf8')
      expect(source).not.toMatch(/audit\.(update|delete|edit)/)
      expect(path).not.toMatch(/auditoria|audit/)
    }
  })
})
