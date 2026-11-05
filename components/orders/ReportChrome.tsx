'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { generateReportPdf } from '@/app/actions/report'
import { strings } from '@/lib/strings'
import type { ReportMode, StoredReportInfo } from '@/types/orders/report.types'

const text = strings.report.chrome

const button =
  'inline-flex min-h-11 items-center justify-center rounded-[var(--radius-control)] border border-border px-4 font-semibold disabled:cursor-not-allowed disabled:opacity-60'

interface Props {
  orderId: string
  mode: ReportMode
  lineId: string | null
  stored: StoredReportInfo | null
  /** The issued PDF is final. A draft can be made again. */
  final: boolean
  storedLabel: string | null
}

/** The controls beside the paper. They never print. */
export function ReportChrome({ orderId, mode, lineId, stored, final, storedLabel }: Props) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null)

  function generate() {
    startTransition(async () => {
      const result = await generateReportPdf({ orderId, mode, lineId })
      setMessage({ ok: result.ok, text: result.message })
      if (result.ok) router.refresh()
    })
  }

  return (
    <div className="flex flex-col gap-3 print:hidden">
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" onClick={generate} disabled={pending || (final && stored !== null)} className={`${button} bg-primary text-primary-foreground`}>
          {text.pdf}
        </button>
        {stored ? (
          <a href={`/ordenes/${orderId}/reporte/pdf?id=${stored.id}`} className={button}>
            {text.download}
          </a>
        ) : null}
        <button type="button" disabled title={text.deliveryLater} className={button}>
          {text.whatsapp}
        </button>
        <button type="button" disabled title={text.deliveryLater} className={button}>
          {text.email}
        </button>
        <Link href={`/ordenes/${orderId}/resultados`} className={button}>
          {text.exit}
        </Link>
      </div>
      {storedLabel ? <p className="text-muted-foreground">{storedLabel}</p> : null}
      {message ? (
        <p role="status" className={message.ok ? 'font-semibold text-flag-released' : 'font-semibold text-flag-blocked'}>
          {message.text}
        </p>
      ) : null}
    </div>
  )
}
