'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { useUnsavedEdits } from '@/components/shell/UnsavedEditsContext'
import { strings } from '@/lib/strings'

/** Leaves the current form for the home screen. It never signs the person out. */
export function SalirButton() {
  const router = useRouter()
  const { dirty, setDirty } = useUnsavedEdits()
  const [confirming, setConfirming] = useState(false)

  function leave() {
    setConfirming(false)
    setDirty(false)
    router.push('/')
  }

  return (
    <>
      <button
        type="button"
        onClick={() => (dirty ? setConfirming(true) : leave())}
        className="h-9 rounded-[var(--radius-control)] border border-primary-foreground/60 px-3 font-semibold text-primary-foreground"
      >
        {strings.shell.leave}
      </button>
      <ConfirmDialog
        open={confirming}
        title={strings.shell.leaveConfirmTitle}
        body={strings.shell.leaveConfirmBody}
        confirmLabel={strings.shell.leave}
        cancelLabel={strings.auth.cancel}
        onConfirm={leave}
        onCancel={() => setConfirming(false)}
      />
    </>
  )
}
