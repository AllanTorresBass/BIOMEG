'use client'

import { useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useCallback } from 'react'
import { toast } from 'sonner'
import { useGlobalErrorHandler } from '@/hooks/use-global-error-handler'
import { isApiError } from '@/lib/utils/errors'
import type { CommandFeedback } from '@/types/api.types'
import type { CommandOutcome, CommandRunner } from '@/types/lib/use-command.types'

function outcomeOf(result: unknown): CommandOutcome {
  return typeof result === 'object' && result !== null ? (result as CommandOutcome) : {}
}

/**
 * Runs one service call. On success it refreshes the server data on screen and clears query caches.
 * A failure always tells the person. A missing gesture opens a dialog instead of a toast.
 */
export function useCommand(): CommandRunner {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { handleCrudError } = useGlobalErrorHandler()

  return useCallback(
    async <Result,>(call: () => Promise<Result>, feedback: CommandFeedback = {}): Promise<Result> => {
      const { toasts = 'all', refresh = true } = feedback
      let result: Result
      try {
        result = await call()
      } catch (error: unknown) {
        if (isApiError(error) && error.status === 401) router.push('/entrar')
        if (toasts !== 'none') handleCrudError(error)
        throw error
      }

      const outcome = outcomeOf(result)
      const refused = outcome.ok === false || (typeof outcome.error === 'string' && outcome.error !== '')
      if (!refused && feedback.document && typeof outcome.redirectTo === 'string') {
        window.location.assign(outcome.redirectTo)
        return result
      }
      if (refused) {
        const message = typeof outcome.error === 'string' ? outcome.error : outcome.message
        if ((toasts === 'all' || toasts === 'failures') && !outcome.need && typeof message === 'string' && message !== '') toast.error(message)
        return result
      }

      if ((toasts === 'all' || toasts === 'successes') && typeof outcome.message === 'string' && outcome.message !== '') toast.success(outcome.message)
      if (refresh) {
        void queryClient.invalidateQueries()
        router.refresh()
      }
      if (typeof outcome.redirectTo === 'string') router.push(outcome.redirectTo)
      return result
    },
    [handleCrudError, queryClient, router],
  )
}
