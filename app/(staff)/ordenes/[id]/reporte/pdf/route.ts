import { getReport } from '@/lib/db/memory/report-store'
import { isDownloadAllowed } from '@/lib/server/api/with-command'
import { mayReach } from '@/lib/server/guard'
import { getStaffContext } from '@/lib/server/session/current'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isDownloadAllowed())) return new Response(null, { status: 429 })
  const context = await getStaffContext()
  if (!context || context.locked) return new Response('Unauthorized', { status: 401 })
  if (!mayReach(context, ['report.print.patient', 'report.print.single'])) {
    return new Response('Forbidden', { status: 403 })
  }
  const { id } = await params
  const reportId = new URL(request.url).searchParams.get('id')
  const report = reportId ? getReport(reportId) : null
  if (!report || report.orderId !== id) return new Response('Not found', { status: 404 })

  const name = `reporte-${report.document.patient.orden}${report.draft ? '-borrador' : ''}.pdf`
  return new Response(new Uint8Array(report.pdf), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${name}"`,
      'Cache-Control': 'private, no-store',
    },
  })
}
