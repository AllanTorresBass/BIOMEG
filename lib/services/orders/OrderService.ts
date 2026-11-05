import { BaseService } from '@/lib/services/base/BaseService'
import type {
  AddLineInput,
  BillingInput,
  DraftResult,
  OrderActionResult,
  PaymentInput,
  PersonalInput,
  RemoveLineInput,
  SaveInput,
  SaveResult,
  VisitInput,
  VoidOrderInput,
} from '@/types/orders/draft.types'
import type { DraftIdInput, GoToStepInput, RemoveDraftLineInput, SelectClientInput } from '@/types/orders/orders.schemas'

export class OrderService extends BaseService {
  constructor() {
    super('/api/v1/orders')
  }

  selectClient(input: SelectClientInput): Promise<DraftResult> {
    return this.post('/draft/select-client', input)
  }

  saveVisit(input: VisitInput): Promise<DraftResult> {
    return this.post('/draft/visit', input)
  }

  saveBilling(input: BillingInput): Promise<DraftResult> {
    return this.post('/draft/billing', input)
  }

  addLine(input: AddLineInput): Promise<DraftResult> {
    return this.post('/draft/add-line', input)
  }

  removeDraftLine(input: RemoveDraftLineInput): Promise<DraftResult> {
    return this.post('/draft/remove-line', input)
  }

  goToStep(input: GoToStepInput): Promise<DraftResult> {
    return this.post('/draft/step', input)
  }

  cancelDraft(input: DraftIdInput): Promise<DraftResult> {
    return this.post('/draft/cancel', input)
  }

  savePersonal(input: PersonalInput): Promise<DraftResult> {
    return this.post('/draft/personal', input)
  }

  savePayment(input: PaymentInput): Promise<DraftResult> {
    return this.post('/draft/payment', input)
  }

  generateQuote(input: DraftIdInput): Promise<OrderActionResult> {
    return this.post('/draft/quote', input)
  }

  save(input: SaveInput): Promise<SaveResult> {
    return this.post('/save', input)
  }

  voidOrder(input: VoidOrderInput): Promise<OrderActionResult> {
    return this.post('/void', input)
  }

  removeLine(input: RemoveLineInput): Promise<OrderActionResult> {
    return this.post('/remove-line', input)
  }
}
