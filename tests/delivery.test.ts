import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('server-only', () => ({}))

import { approveIncomplete, completeResendTask, createResendTask, incompleteApprovalOf, recordDelivery, restoreDeliveries, snapshotDeliveries, updateDelivery } from '@/lib/db/memory/delivery-store'
import { getStub } from '@/lib/db/memory/order-index'
import { demoSeed } from '@/lib/db/memory/seed'
import { clearFakeProvider, fakeDeliveryPort, fakeProviderSent, setFakeProviderFailing } from '@/lib/server/ports/fake-delivery'
import { blockedReason, buildDeliveryView, deliveryModeAllowed, deliveryStateOf, destinationOf, messageFor, modeOf, resendChannelsOf } from '@/lib/server/domain/delivery'
import type { ClientRecord } from '@/types/domain/client.types'

function released() {
  const stub = getStub('o-1')
  if (!stub) throw new Error('demo order missing')
  return stub
}

function client(patch: Partial<ClientRecord>): ClientRecord {
  return {
    phone: '04141234567',
    email: 'paciente@example.com',
    verified: false,
    consents: [],
    ...patch,
  } as ClientRecord
}

const consent = (channel: 'WHATSAPP' | 'EMAIL', withdrawnAt: string | null = null) => ({ channel, withdrawnAt }) as ClientRecord['consents'][number]

let snapshot: ReturnType<typeof snapshotDeliveries>
let portalCodeWorks: boolean

beforeEach(() => {
  snapshot = snapshotDeliveries()
  portalCodeWorks = demoSeed.settings.portalCodeWorks
  clearFakeProvider()
})

afterEach(() => {
  restoreDeliveries(snapshot)
  demoSeed.settings.portalCodeWorks = portalCodeWorks
  clearFakeProvider()
})

describe('what can be sent', () => {
  it('sends a released order and a partly loaded one, never an empty one or one in review', () => {
    expect(deliveryStateOf({ hasResult: true, released: true, correctionOpen: false })).toBe('LIBERADO')
    expect(deliveryStateOf({ hasResult: true, released: false, correctionOpen: false })).toBe('INCOMPLETO')
    expect(deliveryStateOf({ hasResult: false, released: false, correctionOpen: false })).toBeNull()
    expect(deliveryStateOf({ hasResult: true, released: true, correctionOpen: true })).toBeNull()
  })
})

describe('mode and consent', () => {
  it('sends a link when the portal code works and the client is verified', () => {
    demoSeed.settings.portalCodeWorks = true
    expect(modeOf(client({ verified: true }))).toBe('PORTAL_LINK')
    expect(modeOf(client({ verified: false }))).toBe('ATTACHMENT')
  })

  it('sends an attachment while the portal code does not work', () => {
    demoSeed.settings.portalCodeWorks = false
    expect(modeOf(client({ verified: true }))).toBe('ATTACHMENT')
  })

  it('needs a destination for the channel', () => {
    expect(destinationOf(client({ phone: '  ' }), 'WHATSAPP')).toBeNull()
    expect(blockedReason(client({ phone: '' }), 'WHATSAPP')).toBe('NO_CONTACT')
    expect(blockedReason(client({ email: '' }), 'CORREO')).toBe('NO_CONTACT')
  })

  it('needs recorded consent to send a result as an attachment', () => {
    demoSeed.settings.portalCodeWorks = false
    expect(blockedReason(client({}), 'CORREO')).toBe('NO_CONSENT')
    expect(blockedReason(client({ consents: [consent('EMAIL')] }), 'CORREO')).toBeNull()
    expect(blockedReason(client({ consents: [consent('EMAIL', '2026-01-01')] }), 'CORREO')).toBe('NO_CONSENT')
    expect(deliveryModeAllowed(client({ consents: [consent('WHATSAPP')] }), 'CORREO')).toBe(false)
  })

  it('sends only a link without consent, since a link carries no result', () => {
    demoSeed.settings.portalCodeWorks = true
    expect(blockedReason(client({ verified: true }), 'WHATSAPP')).toBeNull()
  })
})

describe('the message', () => {
  const base = { to: 'x', orderNumber: 'o-1', origin: 'https://lab.example', resend: false, incomplete: false }

  it('carries a plain link to Ingresar and nothing else', () => {
    const message = messageFor({ ...base, channel: 'CORREO', mode: 'PORTAL_LINK' })
    expect(message.link).toBe('https://lab.example/ingresar')
    expect(message.link).not.toContain('?')
    expect(message.attachmentName).toBeNull()
  })

  it('carries the report as a file when it is an attachment', () => {
    const message = messageFor({ ...base, channel: 'CORREO', mode: 'ATTACHMENT' })
    expect(message.link).toBeNull()
    expect(message.attachmentName).toBe('orden-o-1.pdf')
  })

  it('gives only the email a subject and a header image', () => {
    const email = messageFor({ ...base, channel: 'CORREO', mode: 'ATTACHMENT' })
    const whatsapp = messageFor({ ...base, channel: 'WHATSAPP', mode: 'ATTACHMENT' })
    expect(email.subject).not.toBeNull()
    expect(email.headerImage).not.toBeNull()
    expect(whatsapp.subject).toBeNull()
    expect(whatsapp.headerImage).toBeNull()
  })
})

describe('the provider', () => {
  const message = messageFor({ channel: 'WHATSAPP', to: '0414', mode: 'PORTAL_LINK', orderNumber: 'o-1', origin: null, resend: false, incomplete: false })

  it('records what it was asked to send', async () => {
    expect(await fakeDeliveryPort.send(message)).toEqual({ ok: true })
    expect(fakeProviderSent()).toHaveLength(1)
  })

  it('can fail without recording a send', async () => {
    setFakeProviderFailing(true)
    const result = await fakeDeliveryPort.send(message)
    expect(result.ok).toBe(false)
    expect(fakeProviderSent()).toHaveLength(0)
  })
})

describe('resend after a correction', () => {
  it('makes no task when the order was never delivered', () => {
    expect(createResendTask('o-never', 'i-1', 'i-2')).toBeNull()
  })

  it('offers the channels used before, once each, and nothing by itself', () => {
    expect(resendChannelsOf('o-1')).toEqual([])
    const task = createResendTask('o-1', 'i-1', 'i-2')
    expect(task).not.toBeNull()
    expect(resendChannelsOf('o-1')).toEqual(['CORREO'])
  })

  it('stops offering a channel once it was resent on the new issue', () => {
    createResendTask('o-1', 'i-1', 'i-2')
    recordDelivery({
      orderId: 'o-1',
      issueId: 'i-2',
      channel: 'CORREO',
      recipient: 'paciente@example.com',
      mode: 'ATTACHMENT',
      status: 'SENT',
      failure: null,
      operatorName: 'Recepción',
      orderNumber: 'o-1',
      incomplete: false,
      missing: [],
      resend: true,
    })
    expect(resendChannelsOf('o-1')).toEqual([])
  })

  it('keeps offering a channel whose resend failed', () => {
    createResendTask('o-1', 'i-1', 'i-2')
    const failed = recordDelivery({
      orderId: 'o-1',
      issueId: 'i-2',
      channel: 'CORREO',
      recipient: 'paciente@example.com',
      mode: 'ATTACHMENT',
      status: 'PENDING',
      failure: null,
      operatorName: 'Recepción',
      orderNumber: 'o-1',
      incomplete: false,
      missing: [],
      resend: true,
    })
    updateDelivery(failed.id, { status: 'FAILED', failure: 'El proveedor no respondió.' })
    expect(resendChannelsOf('o-1')).toEqual(['CORREO'])
  })

  it('closes the task when the order was sent again', () => {
    createResendTask('o-1', 'i-1', 'i-2')
    completeResendTask('o-1')
    expect(resendChannelsOf('o-1')).toEqual([])
  })
})

describe('delivery panel', () => {
  it('shows a released order and a pending resend', () => {
    createResendTask('o-1', 'i-1', 'i-2')
    const view = buildDeliveryView(released(), { send: true, approve: false })
    expect(view?.state).toBe('LIBERADO')
    expect(view?.resendPending).toBe(true)
    expect(view?.channels.find((entry) => entry.channel === 'CORREO')?.resend).toBe(true)
  })

  it('blocks every channel for a role that may not send', () => {
    const view = buildDeliveryView(released(), { send: false, approve: false })
    expect(view?.channels.every((entry) => entry.blocked === 'NOT_PERMITTED')).toBe(true)
  })

  it('shows nothing for an order in review', () => {
    expect(buildDeliveryView({ ...released(), correctionOpen: true }, { send: true, approve: true })).toBeNull()
  })

  it('asks for an approval before a partly loaded order goes out', () => {
    const partial = { ...released(), released: false }
    const before = buildDeliveryView(partial, { send: true, approve: true })
    expect(before?.state).toBe('INCOMPLETO')
    expect(before?.canApprove).toBe(true)
    expect(before?.approvedBy).toBeNull()

    approveIncomplete({ orderId: partial.id, approvedBy: 'Bioanalista', approvedAt: new Date().toISOString(), missing: ['Química'] })
    expect(incompleteApprovalOf(partial.id)?.approvedBy).toBe('Bioanalista')
    const after = buildDeliveryView(partial, { send: true, approve: true })
    expect(after?.canApprove).toBe(false)
    expect(after?.approvedBy).toBe('Bioanalista')
  })

  it('hides the approve button from a role that may not approve', () => {
    const view = buildDeliveryView({ ...released(), released: false }, { send: true, approve: false })
    expect(view?.canApprove).toBe(false)
  })
})
