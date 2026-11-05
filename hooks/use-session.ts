'use client'

import { useQueryClient } from '@tanstack/react-query'
import { useMemo } from 'react'
import { useCommand } from '@/hooks/use-command'
import { container } from '@/lib/services'
import type { FormState } from '@/types/session/session.types'

function field(data: FormData, name: string): string {
  const value = data.get(name)
  return typeof value === 'string' ? value : ''
}

export function useSessionCommands() {
  const run = useCommand()
  const queryClient = useQueryClient()
  return useMemo(() => {
    const service = () => container.sessionService
    return {
      signInForm: (_previous: FormState, data: FormData) =>
        run(() => service().signIn({ username: field(data, 'username'), password: field(data, 'password') }), { toasts: 'none' }),
      changePasswordForm: (_previous: FormState, data: FormData) =>
        run(() => service().changePassword({ current: field(data, 'current'), next: field(data, 'next') }), { toasts: 'none' }),
      signOut: () => {
        queryClient.clear()
        return run(() => service().signOut())
      },
      lockCurrentSession: () => run(() => service().lock()),
      /** The dialog shows its own inline refusal, and a wrong password never toasts. */
      verifyStepUp: (password: string) => run(() => service().verifyStepUp({ password }), { toasts: 'none', refresh: false }),
      switchDemoUser: (userId: string) => {
        queryClient.clear()
        return run(() => service().switchDemoUser({ userId }), { toasts: 'none' })
      },
    }
  }, [queryClient, run])
}
