import 'server-only'
import type { RequestWindow } from '@/types/stores/rate-limit-store.types'

const WINDOW_MS = 60_000

const globalStore = globalThis as typeof globalThis & { __biomegRateLimit?: Map<string, RequestWindow> }
const windows: Map<string, RequestWindow> = (globalStore.__biomegRateLimit ??= new Map())

/** Counts one request in the current minute. False once the bucket is used up. */
export function takeRequestToken(bucket: string, perMinute: number, now: number = Date.now()): boolean {
  const current = windows.get(bucket)
  if (!current || now - current.startedAt >= WINDOW_MS) {
    for (const [key, window] of windows) {
      if (now - window.startedAt >= WINDOW_MS) windows.delete(key)
    }
    windows.set(bucket, { startedAt: now, count: 1 })
    return true
  }
  current.count += 1
  return current.count <= perMinute
}

/** Test hook. */
export function resetRateLimits(): void {
  windows.clear()
}
