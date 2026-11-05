'use client'

import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { useCommand } from '@/hooks/use-command'
import { container } from '@/lib/services'
import { queryKeys } from '@/lib/query-keys'
import type { CorrectCedulaInput, MergeInput, RequestMergeInput, UndoMergeInput } from '@/types/clients/clients.schemas'
import type { LifecycleInput } from '@/types/clients/lifecycle.types'
import type { ClientFormState, ClientSummary } from '@/types/domain/client.types'

function field(data: FormData, name: string): string {
  const value = data.get(name)
  return typeof value === 'string' ? value : ''
}

function versionOf(data: FormData): number | null {
  const version = Number(field(data, 'version'))
  return Number.isInteger(version) && version > 0 ? version : null
}

export function useClientCommands() {
  const run = useCommand()
  return useMemo(() => {
    const service = () => container.clientService
    return {
      saveClientForm: (_previous: ClientFormState, data: FormData) =>
        run(() =>
          service().save({
            id: field(data, 'id') || null,
            version: versionOf(data),
            fullName: field(data, 'fullName'),
            cedulaType: field(data, 'cedulaType'),
            cedulaNumber: field(data, 'cedulaNumber'),
            birthDate: field(data, 'birthDate'),
            sex: field(data, 'sex'),
            phone: field(data, 'phone'),
            email: field(data, 'email'),
            consentWhatsapp: data.get('consentWhatsapp') === 'on',
            consentEmail: data.get('consentEmail') === 'on',
            confirmSimilar: data.get('confirmSimilar') === 'on',
            confirmGesture: data.get('confirmGesture') === 'on',
          }),
        ),
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
