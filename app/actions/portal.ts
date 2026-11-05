'use server'

import { z } from 'zod'
import { checkChallenge, failureKey, isPaused, openChallenge, registerFailure } from '@/lib/db/memory/portal-store'
import { currentProvider, fakeProviderSent } from '@/lib/server/delivery/provider'
import { contactFor, matchClients } from '@/lib/server/domain/portal'
import { auditEvent } from '@/lib/server/audit'
import { enterPortal, leavePortalSession, pendingChallenge, rememberChallenge } from '@/lib/server/portal/session'
import { strings } from '@/lib/strings'
import { CEDULA_TYPES } from '@/lib/utils/format'
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

async function portalAudit(command: string, outcome: 'ALLOWED' | 'REFUSED', recordId: string | null, state: string | null) {
  await auditEvent({ command, outcome, channel: 'portal', recordType: 'client', recordId, state, source: 'ui' })
}

/**
 * Checks the typed data and, on a match with a contact on file, sends a code. The answer is the same
 * whether or not anything matched, so the form never confirms that a cédula exists.
 */
export async function requestPortalCode(input: { type: string; digits: string; birth: string }): Promise<PortalCodeRequest> {
  const parsed = requestSchema.safeParse(input)
  const birth = parsed.success ? toIsoDate(parsed.data.birth) : null
  if (!parsed.success || !birth) return { kind: 'INVALID' }

  const key = failureKey(parsed.data.type, parsed.data.digits)
  if (isPaused(key)) {
    await portalAudit('portal.code.request', 'REFUSED', null, 'PAUSED')
    return { kind: 'PAUSED' }
  }

  const clients = matchClients(parsed.data.type, parsed.data.digits, birth)
  const contact = contactFor(clients)
  if (clients.length === 0 || !contact) {
    registerFailure(key)
    await portalAudit('portal.code.request', 'REFUSED', null, clients.length === 0 ? 'NO_MATCH' : 'NO_CONTACT')
    return { kind: 'ANSWERED', demoCode: null }
  }

  const { challengeId, code } = openChallenge(
    clients.map((client) => client.id),
    clients[0]!.fullName,
  )
  const result = await currentProvider().send({
    channel: contact.channel,
    to: contact.destination,
    subject: contact.channel === 'CORREO' ? strings.portal.codeSubject : null,
    body: `${strings.portal.codeMessageStart} ${code}. ${strings.portal.codeMessageEnd}`,
    link: null,
    attachmentName: null,
    headerImage: null,
  })
  await rememberChallenge(challengeId)
  await portalAudit('portal.code.request', result.ok ? 'ALLOWED' : 'REFUSED', clients[0]!.id, result.ok ? 'SENT' : 'SEND_FAILED')

  const demoCode = process.env.NODE_ENV === 'production' ? null : lastDemoCode(contact.destination)
  return { kind: 'ANSWERED', demoCode }
}

function lastDemoCode(destination: string): string | null {
  const message = [...fakeProviderSent()].reverse().find((entry) => entry.to === destination)
  return message?.body.match(/\b\d{6}\b/)?.[0] ?? null
}

export async function verifyPortalCode(code: string): Promise<PortalCodeCheck> {
  const challengeId = await pendingChallenge()
  if (!challengeId) return { kind: 'EXPIRED' }
  const outcome = checkChallenge(challengeId, code)
  if (outcome.kind !== 'OK') {
    await portalAudit('portal.sign_in', 'REFUSED', null, outcome.kind)
    return { kind: outcome.kind }
  }
  await enterPortal(outcome.clientIds, outcome.name)
  await portalAudit('portal.sign_in', 'ALLOWED', outcome.clientIds[0] ?? null, null)
  return { kind: 'OK' }
}

export async function leavePortal(): Promise<void> {
  const session = await leavePortalSession()
  if (session) await portalAudit('portal.leave', 'ALLOWED', session.clientIds[0] ?? null, null)
}
