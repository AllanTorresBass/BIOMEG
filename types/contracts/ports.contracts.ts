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
export interface IDeliveryPort {
  send(message: ProviderMessage): Promise<ProviderResult>
}

export interface IClock {
  now(): Date
}

export interface ITokenGenerator {
  /** At least the given number of random bytes, URL-safe. */
  token(bytes: number): string
}

export interface ServerContainer {
  readonly deliveryPort: IDeliveryPort
  readonly clock: IClock
  readonly tokens: ITokenGenerator
}

export interface FakeState {
  sent: ProviderMessage[]
  failing: boolean
}
