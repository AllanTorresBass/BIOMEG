import 'server-only'

import { z } from 'zod'
import { PORTAL_SETTINGS } from '@/lib/config/portal'
import { addressKey, checkChallenge, failureKey, isPaused, openChallenge, registerFailure } from '@/lib/db/memory/portal-store'
import { currentProvider, fakeProviderSent } from '@/lib/server/delivery/provider'
import { hasAnyOrder, matchClients, phoneFor } from '@/lib/server/domain/portal'
import { auditEvent, requestAddress } from '@/lib/server/audit'
import { enterPortal, leavePortalSession, pendingChallenge, rememberChallenge } from '@/lib/server/portal/session'
import { strings } from '@/lib/strings'
import { CEDULA_TYPES } from '@/lib/utils/format'
import type { PortalCodeCheckInput, PortalCodeRequestInput } from '@/types/portal/portal.schemas'
import type { PortalCodeCheck, PortalCodeRequest } from '@/types/portal/portal.types'

const requestSchema = z.object({
  type: z.enum(CEDULA_TYPES),
  digits: z.string().regex(/^\d{5,9}$/),
  birth: z.string().regex(/^\d{2}\/\d{2}\/\d{4}$/),
})

function toIsoDate(text: string): string | null {
  const [day, month, year] = text.split('/').map(Number)
  const date = new Date(Date.UTC(year!, month! - 1, day!))
  const valid = date.getUTCFullYear() === year && date.getUTCMonth() === month! - 1 && date.getUTCDate() === day
  return valid && date.getTime() <= Date.now() ? date.toISOString().slice(0, 10) : null
}

async function portalAudit(command: string, outcome: 'ALLOWED' | 'REFUSED', recordId: string | null, state: string | null, recordType = 'client') {
  await auditEvent({ command, outcome, channel: 'portal', recordType, recordId, state, source: 'ui' })
}

/**
 * Checks the typed data and, on a match with an order and a phone on file, sends a code. The answer is
 * the same for every failure, so the form never confirms that a cédula exists or says what was wrong.
 * The log keeps a hash prefix, never the digits.
 */
export async function requestPortalCode(input: PortalCodeRequestInput): Promise<PortalCodeRequest> {
  const parsed = requestSchema.safeParse(input)
  const birth = parsed.success ? toIsoDate(parsed.data.birth) : null
  const key = failureKey(String(input.type), String(input.digits))
  const address = await requestAddress()
  const fromAddress = address ? addressKey(address) : null

  const refuse = async (cause: string): Promise<PortalCodeRequest> => {
    registerFailure(key)
    if (fromAddress) registerFailure(fromAddress, Date.now(), PORTAL_SETTINGS.maxFailedByAddress)
    await portalAudit('portal.login.failed', 'REFUSED', key.slice(0, 12), cause, 'portal_key')
    return { kind: 'ANSWERED', demoCode: null }
  }

  if (isPaused(key) || (fromAddress && isPaused(fromAddress))) {
    await portalAudit('portal.login.failed', 'REFUSED', key.slice(0, 12), 'PAUSED', 'portal_key')
    return { kind: 'PAUSED' }
  }
  if (!parsed.success || !birth) return refuse('INCOMPLETE')

  const clients = matchClients(parsed.data.type, parsed.data.digits, birth)
  if (clients.length === 0) return refuse('NO_MATCH')
  if (!hasAnyOrder(clients)) return refuse('NO_ORDER')
  const phone = phoneFor(clients)
  if (!phone) return refuse('NO_PHONE')

  const { challengeId, code } = openChallenge(
    clients.map((client) => client.id),
    clients[0]!.fullName,
  )
  const result = await currentProvider().send({
    channel: 'WHATSAPP',
    to: phone,
    subject: null,
    body: `${strings.portal.codeMessageStart} ${code}. ${strings.portal.codeMessageEnd}`,
    link: null,
    attachmentName: null,
    headerImage: null,
  })
  await rememberChallenge(challengeId)
  await portalAudit(result.ok ? 'portal.code.sent' : 'portal.code.failed', result.ok ? 'ALLOWED' : 'REFUSED', clients[0]!.id, result.ok ? null : 'SEND_FAILED')

  const demoCode = process.env.NODE_ENV === 'production' ? null : lastDemoCode(phone)
  return { kind: 'ANSWERED', demoCode }
}

function lastDemoCode(destination: string): string | null {
  const message = [...fakeProviderSent()].reverse().find((entry) => entry.to === destination)
  return message?.body.match(/\b\d{6}\b/)?.[0] ?? null
}

export async function verifyPortalCode({ code }: PortalCodeCheckInput): Promise<PortalCodeCheck> {
  const challengeId = await pendingChallenge()
  if (!challengeId) return { kind: 'EXPIRED' }
  const outcome = checkChallenge(challengeId, code)
  if (outcome.kind !== 'OK') {
    await portalAudit('portal.code.failed', 'REFUSED', null, outcome.kind)
    return { kind: outcome.kind }
  }
  await enterPortal(outcome.clientIds, outcome.name)
  await portalAudit('portal.login', 'ALLOWED', outcome.clientIds[0] ?? null, null)
  return { kind: 'OK' }
}

export async function leavePortal(): Promise<void> {
  const session = await leavePortalSession()
  if (session) await portalAudit('portal.leave', 'ALLOWED', session.clientIds[0] ?? null, null)
}
