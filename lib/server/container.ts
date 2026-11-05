import 'server-only'

import { randomBytes } from 'node:crypto'
import { fakeDeliveryPort } from '@/lib/server/ports/fake-delivery'
import type { ServerContainer } from '@/types/contracts/ports.contracts'

/** The real WhatsApp and email providers are Unknown, so nothing here can call outside. */
export const serverContainer: ServerContainer = {
  deliveryPort: fakeDeliveryPort,
  clock: { now: () => new Date() },
  tokens: { token: (bytes) => randomBytes(bytes).toString('base64url') },
}
