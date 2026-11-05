import { BaseService } from '@/lib/services/base/BaseService'
import type { ChangePasswordInput, DemoSwitchInput, SignInInput, StepUpInput } from '@/types/session/session.schemas'
import type { FormState } from '@/types/session/session.types'

export class SessionService extends BaseService {
  constructor() {
    super('/api/v1/session')
  }

  signIn(input: SignInInput): Promise<FormState> {
    return this.post('/sign-in', input)
  }

  signOut(): Promise<{ redirectTo: string }> {
    return this.post('/sign-out')
  }

  lock(): Promise<void> {
    return this.post('/lock')
  }

  verifyStepUp(input: StepUpInput): Promise<{ ok: boolean; message?: string }> {
    return this.post('/step-up', input)
  }

  changePassword(input: ChangePasswordInput): Promise<FormState> {
    return this.post('/password', input)
  }

  switchDemoUser(input: DemoSwitchInput): Promise<{ ok: boolean; redirectTo?: string }> {
    return this.post('/demo-switch', input)
  }
}
