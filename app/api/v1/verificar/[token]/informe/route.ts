import { openOriginalReport } from '@/lib/server/domain/verification'

const MAX_CODE_LENGTH = 64

/** Opens the original PDF for the printed code. Every refusal returns to the page with one answer. */
export async function POST(request: Request, context: { params: Promise<{ token: string }> }) {
  const { token } = await context.params
  const form = await request.formData().catch(() => null)
  const code = form?.get('code')
  const file =
    typeof code === 'string' && code.length <= MAX_CODE_LENGTH ? await openOriginalReport(token, code) : null

  if (!file) {
    return new Response(null, {
      status: 303,
      headers: {
        Location: `/verificar/${encodeURIComponent(token)}?consulta=no-disponible`,
        'Cache-Control': 'no-store',
        'Referrer-Policy': 'no-referrer',
      },
    })
  }
  return new Response(new Uint8Array(file.pdf), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${file.name}"`,
      'Cache-Control': 'no-store',
      'Referrer-Policy': 'no-referrer',
      'X-Robots-Tag': 'noindex, nofollow',
    },
  })
}
