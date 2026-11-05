'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { approveIncompleteSend, resendDelivery, sendDelivery } from '@/app/actions/delivery'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { StepUpDialog } from '@/components/shared/StepUpDialog'
import { strings } from '@/lib/strings'
import { formatDate } from '@/lib/utils/format'
import type { DeliveryChannelView, DeliveryView, SendChannel } from '@/types/orders/delivery.types'

const text = strings.delivery

const button =
  'inline-flex min-h-11 items-center justify-center rounded-[var(--radius-control)] border border-border px-4 font-semibold disabled:cursor-not-allowed disabled:opacity-60'

const blockedText: Record<NonNullable<DeliveryChannelView['blocked']>, (channel: SendChannel) => string> = {
  NO_CONTACT: (channel) => text.noContact[channel],
  NO_CONSENT: () => text.noConsent,
  NOT_APPROVED: () => text.needsApproval,
  NOT_PERMITTED: () => text.notAllowed,
}

interface Props {
  orderId: string
  view: DeliveryView
}

export function DeliveryPanel({ orderId, view }: Props) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [confirming, setConfirming] = useState<DeliveryChannelView | null>(null)
  const [stepUp, setStepUp] = useState(false)
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null)

  const missing = view.missing.join(', ')

  function approve() {
    startTransition(async () => {
      const result = await approveIncompleteSend({ orderId })
      if (result.need === 'STEP_UP') return setStepUp(true)
      setStepUp(false)
      setMessage({ ok: result.ok, text: result.message })
      if (result.ok) router.refresh()
    })
  }

  function send(channel: DeliveryChannelView) {
    startTransition(async () => {
      const input = { orderId, channel: channel.channel, confirmed: true }
      const result = channel.resend ? await resendDelivery(input) : await sendDelivery(input)
      setConfirming(null)
      setMessage({ ok: result.ok, text: result.message })
      router.refresh()
    })
  }

  function confirmBody(channel: DeliveryChannelView): string {
    const to = channel.destination ?? ''
    if (channel.resend) return text.confirmResend(to)
    if (view.state === 'INCOMPLETO') return text.confirmIncomplete(to, missing)
    return text.confirmBody(to, channel.mode === 'PORTAL_LINK')
  }

  return (
    <section aria-labelledby="delivery-title" className="flex flex-col gap-3 rounded-[var(--radius-card)] border border-border bg-card p-4 print:hidden">
      <h2 id="delivery-title" className="text-lg font-semibold">
        {text.title}
      </h2>

      {view.resendPending ? (
        <p role="note" className="font-semibold text-flag-incomplete">
          {text.resendBanner}
        </p>
      ) : null}

      {view.state === 'INCOMPLETO' ? (
        <div role="note" className="flex flex-col gap-2">
          <p className="font-semibold text-flag-incomplete">{text.incompleteNotice(missing)}</p>
          {view.approvedBy ? (
            <p className="text-muted-foreground">{text.approved(view.approvedBy)}</p>
          ) : view.canApprove ? (
            <div>
              <button type="button" onClick={approve} disabled={pending} className={`${button} bg-primary text-primary-foreground`}>
                {text.approve}
              </button>
            </div>
          ) : (
            <p className="text-muted-foreground">{text.needsApproval}</p>
          )}
        </div>
      ) : null}

      <ul className="flex flex-col gap-3">
        {view.channels.map((channel) => (
          <li key={channel.channel} className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              disabled={pending || channel.blocked !== null}
              onClick={() => setConfirming(channel)}
              className={`${button} ${channel.blocked === null ? 'bg-primary text-primary-foreground' : ''}`}
            >
              {channel.resend ? `${text.resend} ${text.channel[channel.channel]}` : channel.channel === 'WHATSAPP' ? text.whatsapp : text.email}
            </button>
            <span className="text-muted-foreground">
              {channel.blocked ? blockedText[channel.blocked](channel.channel) : channel.destination}
            </span>
          </li>
        ))}
      </ul>

      {message ? (
        <p role="status" className={message.ok ? 'font-semibold text-flag-released' : 'font-semibold text-flag-blocked'}>
          {message.text}
        </p>
      ) : null}

      <div className="flex flex-col gap-2">
        <h3 className="font-semibold">{text.listTitle}</h3>
        {view.rows.length === 0 ? (
          <p className="text-muted-foreground">{text.listEmpty}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th scope="col" className="py-2 pr-3 font-semibold">{text.columns.when}</th>
                  <th scope="col" className="py-2 pr-3 font-semibold">{text.columns.channel}</th>
                  <th scope="col" className="py-2 pr-3 font-semibold">{text.columns.to}</th>
                  <th scope="col" className="py-2 pr-3 font-semibold">{text.columns.mode}</th>
                  <th scope="col" className="py-2 pr-3 font-semibold">{text.columns.by}</th>
                  <th scope="col" className="py-2 font-semibold">{text.columns.result}</th>
                </tr>
              </thead>
              <tbody>
                {view.rows.map((row) => (
                  <tr key={row.id} className="border-b border-border align-top">
                    <td className="py-2 pr-3">{formatDate(row.at)}</td>
                    <td className="py-2 pr-3">{row.channel === 'IMPRESO' ? text.printed : text.channel[row.channel]}</td>
                    <td className="py-2 pr-3">{row.recipient}</td>
                    <td className="py-2 pr-3">
                      {text.mode[row.mode]}
                      {row.incomplete ? ` · ${text.incompleteFlag}` : ''}
                      {row.resend ? ` · ${text.resendFlag}` : ''}
                    </td>
                    <td className="py-2 pr-3">{row.operatorName}</td>
                    <td className={`py-2 font-semibold ${row.status === 'FAILED' ? 'text-flag-blocked' : ''}`}>
                      {text.status[row.status]}
                      {row.failure ? <span className="block font-normal text-muted-foreground">{row.failure}</span> : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={confirming !== null}
        title={confirming ? text.confirmTitle(text.channel[confirming.channel]) : ''}
        body={confirming ? confirmBody(confirming) : ''}
        confirmLabel={text.send}
        cancelLabel={text.cancel}
        onConfirm={() => confirming && send(confirming)}
        onCancel={() => setConfirming(null)}
      />
      <StepUpDialog
        open={stepUp}
        title={text.approveTitle}
        description={text.approveBody(missing)}
        submitLabel={text.approve}
        cancellable
        onVerified={approve}
        onCancel={() => setStepUp(false)}
      />
    </section>
  )
}
