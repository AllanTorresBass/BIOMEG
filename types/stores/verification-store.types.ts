export interface RequestWindow {
  startedAt: number
  count: number
}

export interface WrongCodes {
  count: number
  pausedUntil: number
}

export interface VerificationState {
  windows: Map<string, RequestWindow>
  wrongCodes: Map<string, WrongCodes>
}
