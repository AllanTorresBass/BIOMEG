'use client'

import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { useCommand } from '@/hooks/use-command'
import { container } from '@/lib/services'
import { queryKeys } from '@/lib/query-keys'
import type { CorrectCedulaInput, MergeInput, RequestMergeInput, SaveClientInput, UndoMergeInput } from '@/types/clients/clients.schemas'
import type { LifecycleInput } from '@/types/clients/lifecycle.types'
import type { ClientSummary } from '@/types/domain/client.types'

export function useClientCommands() {
  const run = useCommand()
  return useMemo(() => {
    const service = () => container.clientService
    return {
      /** Field errors stay inline on the card (rule 9). Success still toasts. */
      saveClient: (input: SaveClientInput) => run(() => service().save(input), { toasts: 'successes' }),
      deactivateClient: (input: LifecycleInput) => run(() => service().deactivate(input)),
      deleteClient: (input: LifecycleInput) => run(() => service().softDelete(input)),
      correctCedula: (input: CorrectCedulaInput) => run(() => service().correctCedula(input)),
      requestMerge: (input: RequestMergeInput) => run(() => service().requestMerge(input)),
      mergeClientRecords: (input: MergeInput) => run(() => service().merge(input)),
      undoMerge: (input: UndoMergeInput) => run(() => service().undoMerge(input)),
    }
  }, [run])
}

/** The rows for a typed search. The term stays in this in-memory cache, never in a URL or a store. */
export function useClientSearch(text: string, includeInactive: boolean, initialRows: readonly ClientSummary[]) {
  const searching = text !== '' || includeInactive
  const query = useQuery({
    queryKey: queryKeys.clients.list(text, includeInactive),
    queryFn: () => container.clientService.search({ text, includeInactive }),
    enabled: searching,
    gcTime: 0,
  })
  return {
    rows: searching ? (query.data ?? []) : initialRows,
    isLoading: searching && query.isLoading,
    isError: searching && query.isError,
  }
}
