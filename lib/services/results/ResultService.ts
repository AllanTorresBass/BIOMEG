import { BaseService } from '@/lib/services/base/BaseService'
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
import type { ResultActionResult, RowHistoryResult, SaveResultInput } from '@/types/orders/result.types'

export class ResultService extends BaseService {
  constructor() {
    super('/api/v1/results')
  }

  save(input: SaveResultInput): Promise<ResultActionResult> {
    return this.post('/save', input)
  }

  resolveIncoming(input: ResolveIncomingInput): Promise<ResultActionResult> {
    return this.post('/resolve-incoming', input)
  }

  simulateAnalyzer(input: SimulateAnalyzerInput): Promise<ResultActionResult> {
    return this.post('/simulate-analyzer', input)
  }

  saveSectionNote(input: SectionNoteInput): Promise<ResultActionResult> {
    return this.post('/section-note', input)
  }

  addBacteriologyNote(input: OrderIdInput): Promise<ResultActionResult> {
    return this.post('/bacteriology-note', input)
  }

  release(input: ReleaseResultsInput): Promise<ResultActionResult> {
    return this.post('/release', input)
  }

  history(input: RowHistoryInput): Promise<RowHistoryResult> {
    return this.post('/history', input)
  }

  openCorrection(input: OpenCorrectionInput): Promise<ResultActionResult> {
    return this.post('/correction/open', input)
  }

  cancelCorrection(input: CorrectionInput): Promise<ResultActionResult> {
    return this.post('/correction/cancel', input)
  }

  releaseCorrection(input: CorrectionInput): Promise<ResultActionResult> {
    return this.post('/correction/release', input)
  }
}
