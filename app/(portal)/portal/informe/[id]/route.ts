import { isDownloadAllowed } from '@/lib/server/api/with-command'
import { auditEvent } from '@/lib/server/audit'
import { portalFileOf, visitFor } from '@/lib/server/domain/portal'
import { getPortalContext } from '@/lib/server/portal/session'

/** A visit that is not the signed-in client's looks the same as one that does not exist. */
export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  if (!(await isDownloadAllowed())) return new Response(null, { status: 429 })
  const session = await getPortalContext()
  if (!session) return new Response(null, { status: 401 })

  const { id } = await context.params
  const found = visitFor(session.clientIds, id)
  const file = found ? portalFileOf(found.stub) : null
  if (!found || !file) return new Response(null, { status: 404 })

  await auditEvent({
    command: 'portal.download',
    outcome: 'ALLOWED',
    channel: 'portal',
    recordType: 'order',
    recordId: found.stub.id,
    state: found.visit.state,
    source: 'ui',
  })
  return new Response(new Uint8Array(file.pdf), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${file.name}"`,
      'Cache-Control': 'private, no-store',
    },
  })
}
