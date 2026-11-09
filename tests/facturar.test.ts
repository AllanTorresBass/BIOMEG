import { afterEach, describe, expect, it, vi } from 'vitest'

const actor = vi.hoisted(() => ({ userId: 'u-recepcion', roles: ['RECEPCION'] as string[] }))

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

import { getDraft, startDraft } from '@/lib/db/memory/draft-store'
import { demoSeed } from '@/lib/db/memory/seed'
import { computeOrderTotals } from '@/lib/domain/order-totals'
import { selectClient } from '@/lib/server/commands/order-draft'
import { saveOrder } from '@/lib/server/commands/order-save'
import { beginFacturar } from '@/lib/server/queries/new-order'
import { strings } from '@/lib/strings'
import type { StaffRole } from '@/types/auth/auth.types'
import type { DraftLine } from '@/types/orders/draft.types'
import type { StaffContext } from '@/types/session/session.types'

function actorContext(): StaffContext {
  return {
    locked: false,
    account: {
      id: actor.userId,
      username: actor.userId,
      displayName: 'Recepción Demo',
      roles: actor.roles as StaffRole[],
      mustChangePassword: false,
    },
    session: {
      id: 's-facturar',
      userId: actor.userId,
      workstation: 'PC-1',
      startedAt: Date.now(),
      lastSeenAt: Date.now(),
      locked: false,
      ended: false,
      stepUpAt: null,
    },
  }
}

function line(): DraftLine {
  return {
    id: 'l-facturar',
    examId: 'p-1',
    examName: 'HEMATOLOGIA COMPLETA',
    costType: 'RUTINA',
    column: 'PARTICULAR',
    priceUsd: '8.00',
    basis: 'ORDINARIO',
    status: 'DISPONIBLE',
    repeatMotivo: null,
    addedAt: '2026-11-08T12:00:00.000Z',
  }
}

const settingsCopy = structuredClone(demoSeed.settings)
const text = strings.pendingReview.orders

afterEach(() => {
  Object.assign(demoSeed.settings, structuredClone(settingsCopy))
  actor.userId = 'u-recepcion'
  actor.roles = ['RECEPCION']
})

describe('facturar consulta', () => {
  it('opens on Exámenes when the client is active, and refuses an inactive one', () => {
    actor.userId = 'owner-facturar-open'
    const opened = beginFacturar(actorContext(), 'c-1')
    expect(opened.missingClient).toBe(false)
    expect(getDraft(opened.draftId, 'owner-facturar-open')).toMatchObject({
      entry: 'FACTURAR',
      path: 'PARTICULAR',
      step: 2,
      clientId: 'c-1',
    })

    actor.userId = 'owner-facturar-inactive'
    const missing = beginFacturar(actorContext(), 'c-4')
    expect(missing.missingClient).toBe(true)
    expect(getDraft(missing.draftId, 'owner-facturar-inactive')?.clientId).toBeNull()
    expect(getDraft(missing.draftId, 'owner-facturar-inactive')?.step).toBe(1)
  })

  it('moves a chosen client to Exámenes', async () => {
    actor.userId = 'owner-facturar-pick'
    const draft = startDraft('owner-facturar-pick', 'PARTICULAR', 'FACTURAR')
    const picked = await selectClient({ draftId: draft.id, clientId: 'c-1' })
    expect(picked.ok).toBe(true)
    expect(getDraft(draft.id, 'owner-facturar-pick')?.step).toBe(2)
  })

  it('refuses Guardar for Sin verificar until the billing cédula is complete', async () => {
    const draft = startDraft('u-recepcion', 'PARTICULAR', 'FACTURAR')
    draft.clientId = 'c-2'
    draft.lines.push(line())
    const refused = await saveOrder({ draftId: draft.id, key: `sv-${draft.id}`, rateSeen: demoSeed.settings.rateBs })
    expect(refused.ok).toBe(false)
    expect(refused.message).toBe(text.needBillingCedula)

    draft.billing.cedulaType = 'V'
    draft.billing.cedulaNumber = '12345678'
    const saved = await saveOrder({ draftId: draft.id, key: `sv-ok-${draft.id}`, rateSeen: demoSeed.settings.rateBs })
    expect(saved.ok).toBe(true)
  })

  it('requires razón social when the cost type is Seguro/Empresa', async () => {
    const draft = startDraft('u-recepcion', 'PARTICULAR', 'FACTURAR')
    draft.clientId = 'c-1'
    draft.costType = 'SEGURO_EMPRESA'
    draft.lines.push({ ...line(), id: 'l-seguro', costType: 'SEGURO_EMPRESA' })
    const refused = await saveOrder({ draftId: draft.id, key: `seg-${draft.id}`, rateSeen: demoSeed.settings.rateBs })
    expect(refused.ok).toBe(false)
    expect(refused.message).toBe(text.needRazonSocial)

    draft.billing.razonSocial = 'Aseguradora Demo'
    const saved = await saveOrder({ draftId: draft.id, key: `seg-ok-${draft.id}`, rateSeen: demoSeed.settings.rateBs })
    expect(saved.ok).toBe(true)
  })

  it('uses the Gate B rates of 16% IVA and 3% IGTF', () => {
    expect(demoSeed.settings.ivaRate).toBe('16')
    expect(demoSeed.settings.igtfRate).toBe('3')
    const totals = computeOrderTotals({
      lines: [{ priceUsd: '100.00' }],
      rate: '100.00',
      ivaRate: demoSeed.settings.ivaRate,
      igtfRate: demoSeed.settings.igtfRate,
      discountPct: '0',
      payments: [{ method: 'EFECTIVO_USD', amount: '10.00' }],
    })
    expect(totals.iva).toBe('16.00')
    expect(totals.igtf).toBe('0.30')
    expect(totals.ivaConfigured).toBe(true)
    expect(totals.igtfConfigured).toBe(true)

    const unset = computeOrderTotals({
      lines: [{ priceUsd: '100.00' }],
      rate: '100.00',
      ivaRate: null,
      igtfRate: null,
      discountPct: '0',
      payments: [{ method: 'EFECTIVO_USD', amount: '10.00' }],
    })
    expect(unset.iva).toBe('0.00')
    expect(unset.igtf).toBe('0.00')
  })
})
