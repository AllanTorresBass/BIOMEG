import 'server-only'

import { AsyncLocalStorage } from 'node:async_hooks'
import { randomUUID } from 'node:crypto'

const requests = new AsyncLocalStorage<{ requestId: string }>()

/** Every audit row written inside this function shares one request id. */
export function withAuditRequest<T>(run: () => Promise<T>): Promise<T> {
  return requests.run({ requestId: randomUUID() }, run)
}

export function currentRequestId(): string {
  return requests.getStore()?.requestId ?? randomUUID()
}
