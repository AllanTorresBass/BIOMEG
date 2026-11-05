import 'server-only'

export type ProviderChannel = 'CORREO' | 'WHATSAPP'

export interface ProviderMessage {
  channel: ProviderChannel
  to: string
  subject: string | null
  body: string
  /** A link to Ingresar. It carries no token, order detail or result. */
  link: string | null
  /** The file name of the report, when the message carries the report itself. */
  attachmentName: string | null
  /** The email header image. WhatsApp has none. */
  headerImage: string | null
}

export type ProviderResult = { ok: true } | { ok: false; reason: string }

/** The real WhatsApp and email providers are Unknown. Anything that sends goes through this one interface. */
export interface DeliveryProvider {
  send(message: ProviderMessage): Promise<ProviderResult>
}

interface FakeState {
  sent: ProviderMessage[]
  failing: boolean
}

const globalFake = globalThis as typeof globalThis & { __biomegFakeProvider?: FakeState }
const fake: FakeState = (globalFake.__biomegFakeProvider ??= { sent: [], failing: false })

/** Records what would have been sent and can be told to fail. It never calls a real service. */
export const fakeProvider: DeliveryProvider = {
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

export function currentProvider(): DeliveryProvider {
  return fakeProvider
}
