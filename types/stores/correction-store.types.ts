import type { IssueRecord, ResendTask } from '@/types/orders/issue.types'
import type { SectionCorrection } from '@/types/orders/result.types'

export type FinishOutcome =
  | { kind: 'released'; correction: SectionCorrection; issue: IssueRecord; replaced: IssueRecord | null; resendTask: ResendTask | null }
  | { kind: 'none' }
  | { kind: 'failed' }
