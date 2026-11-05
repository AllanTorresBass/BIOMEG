import { BaseService } from '@/lib/services/base/BaseService'
import type { WorklistView } from '@/types/orders/worklist.types'

export class WorklistService extends BaseService {
  constructor() {
    super('/api/v1/worklist')
  }

  load(date: string, reviewOnly: boolean, signal?: AbortSignal): Promise<WorklistView> {
    return this.get('', { date, reviewOnly: reviewOnly ? '1' : '0' }, signal)
  }
}
