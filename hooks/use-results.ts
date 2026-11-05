'use client'

import { useMemo } from 'react'
import { useCommand } from '@/hooks/use-command'
import { container } from '@/lib/services'
import type {
  CorrectionInput,
  OpenCorrectionInput,
  OrderIdInput,
  ReleaseResultsInput,
  ResolveIncomingInput,
  RowHistoryInput,
  SectionNoteInput,
  SimulateAnalyzerInput,
} from '@/types/orders/orders.schemas'
import type { SaveResultInput } from '@/types/orders/result.types'

export function useResultCommands() {
  const run = useCommand()
  return useMemo(() => {
    const service = () => container.resultService
    return {
      /** A cell shows its own saved state, so only a failure toasts (rule 9). */
      saveResult: (input: SaveResultInput) => run(() => service().save(input), { toasts: 'failures', refresh: false }),
      resolveIncoming: (input: ResolveIncomingInput) => run(() => service().resolveIncoming(input)),
      simulateAnalyzer: (input: SimulateAnalyzerInput) => run(() => service().simulateAnalyzer(input)),
      saveSectionNote: (input: SectionNoteInput) => run(() => service().saveSectionNote(input), { toasts: 'failures', refresh: false }),
      addBacteriologyNote: (input: OrderIdInput) => run(() => service().addBacteriologyNote(input)),
      releaseResults: (input: ReleaseResultsInput) => run(() => service().release(input)),
      rowHistory: (input: RowHistoryInput) => run(() => service().history(input), { toasts: 'failures', refresh: false }),
      openCorrection: (input: OpenCorrectionInput) => run(() => service().openCorrection(input)),
      cancelCorrection: (input: CorrectionInput) => run(() => service().cancelCorrection(input)),
      releaseCorrection: (input: CorrectionInput) => run(() => service().releaseCorrection(input)),
    }
  }, [run])
}
