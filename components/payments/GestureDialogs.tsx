'use client'

import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { StepUpDialog } from '@/components/shared/StepUpDialog'
import { strings } from '@/lib/strings'
import type { GestureDialogsProps } from '@/types/orders/payment-screens.props'

const text = strings.pendingReview.payments

export function GestureDialogs({ gesture }: GestureDialogsProps) {
  const { request, stepUpOpen, answer, stepUpVerified, cancel } = gesture
  return (
    <>
      <ConfirmDialog
        open={request !== null && !stepUpOpen}
        title={request?.title ?? ''}
        body={request?.body ?? ''}
        confirmLabel={request?.confirmLabel ?? ''}
        cancelLabel={strings.auth.cancel}
        motivoRequired={request?.motivoRequired ?? false}
        onConfirm={answer}
        onCancel={cancel}
      />
      <StepUpDialog
        open={stepUpOpen}
        title={text.stepUpTitle}
        submitLabel={text.stepUpSubmit}
        cancellable
        onVerified={stepUpVerified}
        onCancel={cancel}
      />
    </>
  )
}
