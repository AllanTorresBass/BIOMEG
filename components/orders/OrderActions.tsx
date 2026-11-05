'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { useOrderCommands } from '@/hooks/use-orders'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { StepUpDialog } from '@/components/shared/StepUpDialog'
import { strings } from '@/lib/strings'
import { formatMoney } from '@/lib/utils/format'
import type { OrderActionsProps } from '@/types/orders/screen.types'

const text = strings.pendingReview.orders

type Pending = { kind: 'void' } | { kind: 'line'; lineId: string; name: string }

export function OrderActions({ orderId, voided, hasPayment, lines }: OrderActionsProps) {
  const { voidOrder, removeOrderLine } = useOrderCommands()
  const router = useRouter()
  const [busy, startTransition] = useTransition()
  const [pending, setPending] = useState<Pending | null>(null)
  const [stepUpFor, setStepUpFor] = useState<{ action: Pending; motivo: string | null } | null>(null)
  const [message, setMessage] = useState('')

  function run(action: Pending, motivo: string | null) {
    startTransition(async () => {
      const result =
        action.kind === 'void'
          ? await voidOrder({ orderId, confirmed: true, motivo: motivo ?? '' })
          : await removeOrderLine({ orderId, lineId: action.lineId, confirmed: true })
      if (result.need === 'STEP_UP') {
        setPending(null)
        setStepUpFor({ action, motivo })
        return
      }
      setPending(null)
      setMessage(result.message)
      if (result.ok) router.refresh()
    })
  }

  const dialog =
    pending?.kind === 'line'
      ? { title: text.removeLineTitle(pending.name), body: text.removeLineBody, confirm: text.removeLineConfirm, motivo: false }
      : { title: text.voidTitle, body: hasPayment ? text.voidBodyPaid : text.voidBodyPlain, confirm: text.voidConfirm, motivo: true }

  return (
    <div className="flex flex-col gap-4">
      <div role="status" aria-live="polite" className="min-h-6 text-sm">
        {message}
      </div>
      {voided ? null : (
        <div className="flex flex-col gap-4">
          <div className="overflow-x-auto rounded-[var(--radius-card)] border border-border bg-card">
            <table className="w-full text-left">
              <caption className="sr-only">{text.linesTitle}</caption>
              <thead>
                <tr className="border-b border-border text-sm text-muted-foreground">
                  <th scope="col" className="px-3 py-2 font-semibold">
                    {text.lineExam}
                  </th>
                  <th scope="col" className="px-3 py-2 text-right font-semibold">
                    {text.linePrice}
                  </th>
                  <th scope="col" className="px-3 py-2">
                    <span className="sr-only">{text.removeLineAction}</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {lines.map((line) => (
                  <tr key={line.id} className="border-b border-border last:border-b-0">
                    <td className="px-3 py-2">{line.name}</td>
                    <td className="px-3 py-2 text-right tabular-nums">
                      {line.priceUsd === null ? strings.empty.dash : formatMoney(line.priceUsd)}
                    </td>
                    <td className="px-3 py-2 text-right">
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => setPending({ kind: 'line', lineId: line.id, name: line.name })}
                        className="h-10 rounded-[var(--radius-control)] border border-border-strong px-3 font-semibold disabled:opacity-50"
                      >
                        {text.removeLineAction}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div>
            <button
              type="button"
              disabled={busy}
              onClick={() => setPending({ kind: 'void' })}
              className="h-11 rounded-[var(--radius-control)] border border-flag-blocked px-4 font-semibold text-flag-blocked disabled:opacity-50"
            >
              {text.voidAction}
            </button>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={pending !== null}
        title={dialog.title}
        body={dialog.body}
        confirmLabel={dialog.confirm}
        cancelLabel={text.cancelDialog}
        motivoRequired={dialog.motivo}
        onConfirm={(motivo) => pending && run(pending, motivo)}
        onCancel={() => setPending(null)}
      />
      <StepUpDialog
        open={stepUpFor !== null}
        title={text.stepUpTitle}
        description={text.stepUpBody}
        submitLabel={text.stepUpSubmit}
        cancellable
        onVerified={() => {
          const retry = stepUpFor
          setStepUpFor(null)
          if (retry) run(retry.action, retry.motivo)
        }}
        onCancel={() => setStepUpFor(null)}
      />
    </div>
  )
}
