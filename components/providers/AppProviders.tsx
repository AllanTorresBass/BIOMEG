'use client'

import { QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Toaster } from 'sonner'
import { isApiError } from '@/lib/utils/errors'
import type { AppProvidersProps } from '@/types/shared/providers.types'

const STALE_MS = 30_000

/** The cache lives in memory only, with no persister, so nothing carries over on a shared device. */
export function AppProviders({ children, gcTime }: AppProvidersProps) {
  const router = useRouter()
  const [client] = useState(
    () =>
      new QueryClient({
        queryCache: new QueryCache({
          onError: (error) => {
            if (isApiError(error) && error.status === 401) router.push('/entrar')
          },
        }),
        defaultOptions: { queries: { staleTime: STALE_MS, retry: false, ...(gcTime === undefined ? {} : { gcTime }) } },
      }),
  )
  return (
    <QueryClientProvider client={client}>
      {children}
      <Toaster position="top-right" richColors closeButton />
    </QueryClientProvider>
  )
}
