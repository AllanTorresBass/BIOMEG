import { BaseService } from '@/lib/services/base/BaseService'
import type {
  ClientSearchInput,
  CorrectCedulaInput,
  MergeInput,
  RequestMergeInput,
  SaveClientInput,
  UndoMergeInput,
} from '@/types/clients/clients.schemas'
import type { LifecycleInput, LifecycleResult } from '@/types/clients/lifecycle.types'
import type { ClientFormState, ClientSummary } from '@/types/domain/client.types'

export class ClientService extends BaseService {
  constructor() {
    super('/api/v1/clients')
  }

  save(input: SaveClientInput): Promise<ClientFormState> {
    return this.post('/save', input)
  }

  /** A POST, so a name or cédula never appears in a URL. */
  search(input: ClientSearchInput): Promise<ClientSummary[]> {
    return this.post('/search', input)
  }

  deactivate(input: LifecycleInput): Promise<LifecycleResult> {
    return this.post('/deactivate', input)
  }

  softDelete(input: LifecycleInput): Promise<LifecycleResult> {
    return this.post('/delete', input)
  }

  correctCedula(input: CorrectCedulaInput): Promise<LifecycleResult> {
    return this.post('/correct-cedula', input)
  }

  requestMerge(input: RequestMergeInput): Promise<LifecycleResult> {
    return this.post('/merge-request', input)
  }

  merge(input: MergeInput): Promise<LifecycleResult> {
    return this.post('/merge', input)
  }

  undoMerge(input: UndoMergeInput): Promise<LifecycleResult> {
    return this.post('/merge-undo', input)
  }
}
