'use client'

import { useCallback, useRef, useState } from 'react'
import type { PaymentResult } from '@/types/orders/payment.types'
import type { GestureCommand, GesturePresented, GestureRequest } from '@/types/orders/payment-screens.props'

/**
 * Runs a command and collects what the server asks for. The server decides which gesture applies:
 * the screen only answers, so a confirm, a motivo, or a password re-entry is never decided in the browser.
 */
export function useGestureCommand() {
  const [request, setRequest] = useState<GestureRequest | null>(null)
  const [stepUpOpen, setStepUpOpen] = useState(false)
  const pendingRef = useRef<{ command: GestureCommand; presented: GesturePresented } | null>(null)

  const attempt = useCallback(async (command: GestureCommand, presented: GesturePresented) => {
    pendingRef.current = { command, presented }
    let result: PaymentResult
    try {
      result = await command(presented)
    } catch {
      // useCommand already told the person. The dialog closes, and nothing changed.
      setRequest(null)
      setStepUpOpen(false)
      pendingRef.current = null
      return
    }
    if (result.need === 'STEP_UP') return setStepUpOpen(true)
    if (result.need === 'MOTIVO') return setRequest((current) => (current ? { ...current, motivoRequired: true } : current))
    setRequest(null)
    setStepUpOpen(false)
    pendingRef.current = null
  }, [])

  /** Opens the dialog. Every reversal, close, and reopen here carries a motivo or a confirm. */
  const ask = useCallback((next: GestureRequest) => setRequest(next), [])

  const answer = useCallback(
    (motivo: string | null) => {
      if (!request) return
      void attempt(request.command, { confirmed: true, ...(motivo ? { motivo } : {}) })
    },
    [attempt, request],
  )

  const stepUpVerified = useCallback(() => {
    setStepUpOpen(false)
    const pending = pendingRef.current
    if (pending) void attempt(pending.command, pending.presented)
  }, [attempt])

  const cancel = useCallback(() => {
    setRequest(null)
    setStepUpOpen(false)
    pendingRef.current = null
  }, [])

  return { request, stepUpOpen, ask, answer, stepUpVerified, cancel, attempt }
}
