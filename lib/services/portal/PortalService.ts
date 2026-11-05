import { BaseService } from '@/lib/services/base/BaseService'
import type { PortalCodeCheckInput, PortalCodeRequestInput } from '@/types/portal/portal.schemas'
import type { PortalCodeCheck, PortalCodeRequest } from '@/types/portal/portal.types'

export class PortalService extends BaseService {
  constructor() {
    super('/api/v1/portal')
  }

  requestCode(input: PortalCodeRequestInput): Promise<PortalCodeRequest> {
    return this.post('/code/request', input)
  }

  verifyCode(input: PortalCodeCheckInput): Promise<PortalCodeCheck> {
    return this.post('/code/verify', input)
  }

  leave(): Promise<void> {
    return this.post('/leave')
  }
}
