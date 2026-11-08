'use client'

import { useMemo } from 'react'
import { useCommand } from '@/hooks/use-command'
import { container } from '@/lib/services'
import type { CreateObservationInput, RetractObservationInput } from '@/types/observations/observation.schemas'

export function useObservationCommands() {
  const run = useCommand()
  return useMemo(() => {
    const service = () => container.observationService
    return {
      create: (input: CreateObservationInput) => run(() => service().create(input)),
      retract: (input: RetractObservationInput) => run(() => service().retract(input)),
    }
  }, [run])
}
