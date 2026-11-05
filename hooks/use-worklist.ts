'use client'

import { useQuery } from '@tanstack/react-query'
import { container } from '@/lib/services'
import { queryKeys } from '@/lib/query-keys'
import type { WorklistView } from '@/types/orders/worklist.types'

const REFRESH_MS = 20_000

export function useWorklist(initial: WorklistView, reviewOnly: boolean) {
  return useQuery({
    queryKey: queryKeys.worklist.list(initial.date, reviewOnly),
    queryFn: ({ signal }) => container.worklistService.load(initial.date, reviewOnly, signal),
    initialData: initial,
    refetchInterval: REFRESH_MS,
    placeholderData: (previous) => previous,
  })
}
