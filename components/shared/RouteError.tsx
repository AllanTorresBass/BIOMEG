'use client'

import { useEffect } from 'react'
import { logger } from '@/lib/logger'
import { strings } from '@/lib/strings'
import type { RouteErrorProps } from '@/types/shared/providers.types'

const text = strings.pendingReview.api

export function RouteError({ error, reset }: RouteErrorProps) {
  useEffect(() => {
    logger.error('[ui] screen failed', { error, digest: error.digest })
  }, [error])

  return (
    <div role="alert" className="flex flex-col items-start gap-3 p-4">
      <p className="font-semibold">{text.pageFailed}</p>
      <button
        type="button"
        onClick={reset}
        className="inline-flex min-h-10 items-center rounded-[var(--radius-control)] border border-border px-4 font-semibold"
      >
        {text.retry}
      </button>
    </div>
  )
}
