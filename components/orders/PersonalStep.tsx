'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { cancelDraft, goToStep } from '@/app/actions/order-draft'
import { savePersonal } from '@/app/actions/order-save'
import { PatientHeader } from '@/components/orders/PatientHeader'
import { strings } from '@/lib/strings'
import type { PersonalStepProps } from '@/types/orders/screen.types'

const text = strings.pendingReview.orders

export function PersonalStep({ draftId, patient, physicianId, physicians }: PersonalStepProps) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [message, setMessage] = useState('')
  const [physician, setPhysician] = useState(physicianId ?? '')

  function next() {
    startTransition(async () => {
      const saved = await savePersonal({ draftId, physicianId: physician === '' ? null : physician })
      if (!saved.ok) {
        setMessage(saved.message)
        return
      }
      const moved = await goToStep(draftId, 4)
      setMessage(moved.message)
    })
  }

  function back() {
    startTransition(async () => {
      const moved = await goToStep(draftId, 2)
      setMessage(moved.message)
    })
  }

  function cancel() {
    startTransition(async () => {
      await cancelDraft(draftId)
      router.push('/')
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <PatientHeader patient={patient} />

      <fieldset className="flex flex-col gap-3 rounded-[var(--radius-card)] border border-border bg-card p-4">
        <legend className="px-1 font-semibold">{text.personalTitle}</legend>
        <label className="flex max-w-md flex-col gap-1">
          <span className="font-semibold">{text.physician}</span>
          <select
            value={physician}
            onChange={(event) => setPhysician(event.target.value)}
            className="h-10 rounded-[var(--radius-control)] border border-border-strong bg-background px-3"
          >
            <option value="">{text.physicianNone}</option>
            {physicians.map((option) => (
              <option key={option.id} value={option.id}>
                {option.name}
              </option>
            ))}
          </select>
          <span className="text-sm text-muted-foreground">{text.physicianHint}</span>
        </label>
      </fieldset>

      <p role="status" className="min-h-6 text-sm">
        {message}
      </p>

      <div className="flex flex-wrap justify-between gap-2">
        <button
          type="button"
          onClick={cancel}
          disabled={pending}
          className="h-11 rounded-[var(--radius-control)] border border-border-strong px-4 font-semibold disabled:opacity-50"
        >
          {text.cancel}
        </button>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={back}
            disabled={pending}
            className="h-11 rounded-[var(--radius-control)] border border-border-strong px-4 font-semibold disabled:opacity-50"
          >
            {text.back}
          </button>
          <button
            type="button"
            onClick={next}
            disabled={pending}
            className="h-11 rounded-[var(--radius-control)] bg-primary px-4 font-semibold text-primary-foreground disabled:opacity-50"
          >
            {text.next}
          </button>
        </div>
      </div>
    </div>
  )
}
