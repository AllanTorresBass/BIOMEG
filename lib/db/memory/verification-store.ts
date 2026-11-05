import 'server-only'

import { VERIFICATION_SETTINGS } from '@/lib/config/verification'

interface RequestWindow {
  startedAt: number
  count: number
}

interface WrongCodes {
  count: number
  pausedUntil: number
}

interface VerificationState {
  windows: Map<string, RequestWindow>
  wrongCodes: Map<string, WrongCodes>
}

const WINDOW_MS = 60_000

const globalStore = globalThis as typeof globalThis & { __biomegVerification?: VerificationState }
const state: VerificationState = (globalStore.__biomegVerification ??= { windows: new Map(), wrongCodes: new Map() })

/** Counts this request against the address. False once the address has used up the current minute. */
export function takeRequest(address: string, now: number = Date.now()): boolean {
  const current = state.windows.get(address)
  if (!current || now - current.startedAt >= WINDOW_MS) {
    for (const [key, window] of state.windows) {
      if (now - window.startedAt >= WINDOW_MS) state.windows.delete(key)
    }
    state.windows.set(address, { startedAt: now, count: 1 })
    return true
  }
  current.count += 1
  return current.count <= VERIFICATION_SETTINGS.requestsPerMinute
}

export function isCodePaused(tokenHash: string, now: number = Date.now()): boolean {
  return (state.wrongCodes.get(tokenHash)?.pausedUntil ?? 0) > now
}

export function registerWrongCode(tokenHash: string, now: number = Date.now()): void {
  const record = state.wrongCodes.get(tokenHash) ?? { count: 0, pausedUntil: 0 }
  if (record.pausedUntil !== 0 && record.pausedUntil <= now) {
    record.count = 0
    record.pausedUntil = 0
  }
  record.count += 1
  if (record.count >= VERIFICATION_SETTINGS.maxWrongCodes) {
    record.pausedUntil = now + VERIFICATION_SETTINGS.pauseMinutes * 60_000
  }
  state.wrongCodes.set(tokenHash, record)
}

/** Test hook. */
export function resetVerificationStore(): void {
  state.windows.clear()
  state.wrongCodes.clear()
}
