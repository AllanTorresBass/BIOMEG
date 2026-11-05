import type { IssueRecord } from '@/types/orders/issue.types'

/** What the paper prints. Lookups use only the hashes on the issue. */
export interface IssuePrintSecrets {
  token: string
  consultCode: string
}

export interface IssueStoreState {
  issues: Map<string, IssueRecord>
  /** Prototype only: lets the preview redraw the QR before a PDF is kept. Kept apart from issue records. */
  printSecrets: Map<string, IssuePrintSecrets>
  counter: number
}

export interface IssueStoreSnapshot {
  issues: [string, IssueRecord][]
  counter: number
}
