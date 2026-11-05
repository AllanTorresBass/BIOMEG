'use client'

import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { usePortalCommands } from '@/hooks/use-portal'
import { strings } from '@/lib/strings'

export function LeaveButton() {
  const { leavePortal } = usePortalCommands()
  const router = useRouter()
  const [pending, start] = useTransition()
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        start(async () => {
          await leavePortal()
          router.push('/ingresar')
        })
      }
      className="h-10 rounded-[var(--radius-control)] border border-border-strong px-4 font-semibold disabled:opacity-60"
    >
      {strings.portal.leave}
    </button>
  )
}
