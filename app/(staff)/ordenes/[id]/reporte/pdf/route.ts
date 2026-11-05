import { isDownloadAllowed } from '@/lib/server/api/with-command'
import { readReportFile } from '@/lib/server/queries/reports'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isDownloadAllowed())) return new Response(null, { status: 429 })
  const { id } = await params
  const answer = await readReportFile(id, new URL(request.url).searchParams.get('id'))
  if (answer.kind === 'REFUSED') return new Response(null, { status: answer.status })

  return new Response(new Uint8Array(answer.file.pdf), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${answer.file.name}"`,
      'Cache-Control': 'private, no-store',
    },
  })
}
