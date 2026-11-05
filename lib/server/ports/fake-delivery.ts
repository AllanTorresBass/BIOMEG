import 'server-only'
import type { FakeState, IDeliveryPort, ProviderMessage } from '@/types/contracts/ports.contracts'

const globalFake = globalThis as typeof globalThis & { __biomegFakeProvider?: FakeState }
const fake: FakeState = (globalFake.__biomegFakeProvider ??= { sent: [], failing: false })

/** Records what would have been sent and can be told to fail. It never calls a real service. */
export const fakeDeliveryPort: IDeliveryPort = {
  async send(message) {
    if (fake.failing) return { ok: false, reason: 'El proveedor no respondió.' }
    fake.sent.push(message)
    return { ok: true }
  },
}

export function setFakeProviderFailing(failing: boolean): void {
  fake.failing = failing
}

export function fakeProviderSent(): readonly ProviderMessage[] {
  return fake.sent
}

export function clearFakeProvider(): void {
  fake.sent = []
  fake.failing = false
}
