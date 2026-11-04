'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { lockCurrentSession } from '@/app/actions/session'
import { StepUpDialog } from '@/components/shared/StepUpDialog'
import { strings } from '@/lib/strings'

const ACTIVITY_EVENTS = ['pointerdown', 'keydown', 'wheel', 'touchstart'] as const

/**
 * Locks the station after the idle limit and asks for the password to come back.
 * The page behind stays mounted, so nothing typed is lost. The server keeps its own clock.
 */
export function IdleLock({ locked, idleMinutes }: { locked: boolean; idleMinutes: number }) {
  const router = useRouter()
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (locked) return
    const limit = idleMinutes * 60_000

    function restart() {
      if (timer.current) clearTimeout(timer.current)
      timer.current = setTimeout(async () => {
        await lockCurrentSession()
        router.refresh()
      }, limit)
    }

    restart()
    for (const name of ACTIVITY_EVENTS) window.addEventListener(name, restart, { passive: true })
    return () => {
      if (timer.current) clearTimeout(timer.current)
      for (const name of ACTIVITY_EVENTS) window.removeEventListener(name, restart)
    }
  }, [locked, idleMinutes, router])

  return (
    <StepUpDialog
      open={locked}
      title={strings.auth.lockTitle}
      description={strings.auth.lockBody}
      submitLabel={strings.auth.unlock}
      cancellable={false}
      onVerified={() => router.refresh()}
    />
  )
}
