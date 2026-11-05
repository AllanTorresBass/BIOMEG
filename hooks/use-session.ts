'use client'

import { useQueryClient } from '@tanstack/react-query'
import { useMemo } from 'react'
import { useCommand } from '@/hooks/use-command'
import { container } from '@/lib/services'
import type { ChangePasswordInput, SignInInput } from '@/types/session/session.schemas'

export function useSessionCommands() {
  const run = useCommand()
  const queryClient = useQueryClient()
  return useMemo(() => {
    const service = () => container.sessionService
    return {
      signIn: (input: SignInInput) => run(() => service().signIn(input), { toasts: 'none' }),
      changePassword: (input: ChangePasswordInput) => run(() => service().changePassword(input), { toasts: 'none' }),
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
