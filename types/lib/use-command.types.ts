import type { CommandFeedback } from '@/types/api.types'

export interface CommandOutcome {
  ok?: unknown
  error?: unknown
  message?: unknown
  need?: unknown
  redirectTo?: unknown
}

export type CommandRunner = <Result>(call: () => Promise<Result>, feedback?: CommandFeedback) => Promise<Result>
