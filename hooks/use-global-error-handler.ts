'use client'

import { useMemo } from 'react'
import { toast } from 'sonner'
import { logger } from '@/lib/logger'
import { strings } from '@/lib/strings'
import { errorMessage } from '@/lib/utils/errors'
import type { GlobalErrorHandler } from '@/types/lib/use-global-error-handler.types'

export function useGlobalErrorHandler(): GlobalErrorHandler {
  return useMemo(() => {
    const report = (error: unknown, fallback: string) => {
      logger.warn('[ui] request failed', { error })
      toast.error(errorMessage(error, fallback))
    }
    return {
      handleCrudError: (error) => report(error, strings.pendingReview.api.failed),
      handleFetchError: (error) => report(error, strings.pendingReview.api.fetchFailed),
    }
  }, [])
}
