'use client'

import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { leavePortal } from '@/app/actions/portal'
import { strings } from '@/lib/strings'

export function LeaveButton() {
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
