import { BaseService } from '@/lib/services/base/BaseService'
import type { CreateObservationInput, RetractObservationInput } from '@/types/observations/observation.schemas'
import type { ObservationResult } from '@/types/observations/observation.types'

export class ObservationService extends BaseService {
  constructor() {
    super('/api/v1/observations')
  }

  create(input: CreateObservationInput): Promise<ObservationResult> {
    return this.post('/create', input)
  }

  retract(input: RetractObservationInput): Promise<ObservationResult> {
    return this.post('/retract', input)
  }
}
