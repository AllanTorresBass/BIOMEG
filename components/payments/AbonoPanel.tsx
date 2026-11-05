'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useState, type FormEvent } from 'react'
import { useForm } from 'react-hook-form'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { usePaymentCommands } from '@/hooks/use-payments'
import { PAYMENT_METHODS } from '@/lib/config/payment-methods'
import { strings } from '@/lib/strings'
import { errorMessage } from '@/lib/utils/errors'
import { formatMoney, formatRate } from '@/lib/utils/format'
import type { AbonoPanelProps } from '@/types/orders/payment-screens.props'
import type { AbonoOrderView } from '@/types/orders/payment.types'
import { abonoFormSchema, type AbonoFormValues } from '@/types/orders/payments.schemas'

const text = strings.pendingReview.payments
const FIELD = 'h-10 w-full rounded-[var(--radius-control)] border border-border-strong bg-background px-3'
const BUTTON = 'h-10 rounded-[var(--radius-control)] bg-primary px-4 font-semibold text-primary-foreground disabled:opacity-60'
const EMPTY: AbonoFormValues = { method: 'EFECTIVO_USD', amount: '', bank: '', reference: '' }

export function AbonoPanel({ order: initial }: AbonoPanelProps) {
  const { findOrder, addAbono } = usePaymentCommands()
  const [typed, setTyped] = useState('')
  const [found, setFound] = useState<AbonoOrderView | null>(null)
  const [missing, setMissing] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const form = useForm<AbonoFormValues>({ resolver: zodResolver(abonoFormSchema), defaultValues: EMPTY })
  const order = found ?? initial

  async function search(event: FormEvent) {
    event.preventDefault()
    try {
      const result = await findOrder(typed)
      setFound(result.order)
      setMissing(result.order === null)
    } catch (failure: unknown) {
      setMessage(errorMessage(failure, text.notFound))
    }
  }

  async function submit(values: AbonoFormValues) {
    if (!order) return
    setMessage(null)
    try {
      const result = await addAbono({ ...values, orderId: order.orderId })
      if (!result.ok) return setMessage(result.message)
      form.reset(EMPTY)
      const refreshed = await findOrder(order.number)
      setFound(refreshed.order)
    } catch {
      // useCommand already told the person.
    }
  }

  return (
    <div className="flex max-w-xl flex-col gap-4">
      <form onSubmit={search} role="search" className="flex flex-wrap items-end gap-2">
        <label className="flex min-w-48 flex-1 flex-col gap-1">
          <span className="font-semibold">{text.findLabel}</span>
          <input value={typed} onChange={(event) => setTyped(event.target.value)} autoComplete="off" className={FIELD} />
        </label>
        <button type="submit" className={BUTTON}>
          {text.find}
        </button>
      </form>
      {missing ? <p role="status">{text.notFound}</p> : null}

      {order ? (
        <>
          <dl className="grid gap-x-6 gap-y-1 rounded-[var(--radius-card)] border border-border bg-card p-4 sm:grid-cols-2">
            {[
              [text.invoice, order.invoiceNumber],
              [text.patient, order.clientName],
              [text.total, formatMoney(order.totalUsd)],
              [text.paid, formatMoney(order.abono)],
              [text.resta, formatMoney(order.resta)],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between gap-4">
                <dt className="text-muted-foreground">{label}</dt>
                <dd className="font-semibold tabular-nums">{value}</dd>
              </div>
            ))}
          </dl>

          {order.voided ? (
            <p role="alert" className="font-semibold text-flag-blocked">
              {text.orderVoided}
            </p>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(submit)} noValidate className="flex flex-col gap-3">
                <FormField
                  control={form.control}
                  name="method"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{text.method}</FormLabel>
                      <FormControl>
                        <select {...field} className={FIELD}>
                          {PAYMENT_METHODS.map((method) => (
                            <option key={method.id} value={method.id}>
                              {method.label}
                            </option>
                          ))}
                        </select>
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{text.amount}</FormLabel>
                      <FormControl>
                        <input {...field} inputMode="decimal" autoComplete="off" className={`${FIELD} tabular-nums`} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="bank"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{text.bank}</FormLabel>
                      <FormControl>
                        <input {...field} autoComplete="off" className={FIELD} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="reference"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{text.reference}</FormLabel>
                      <FormControl>
                        <input {...field} autoComplete="off" className={FIELD} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                {order.rate ? <p className="text-sm text-muted-foreground">{text.rateNote(formatRate(order.rate))}</p> : null}
                {message ? (
                  <p role="alert" className="text-flag-blocked">
                    {message}
                  </p>
                ) : null}
                <button type="submit" disabled={form.formState.isSubmitting} className={`${BUTTON} self-start`}>
                  {text.saveAbono}
                </button>
              </form>
            </Form>
          )}
        </>
      ) : null}
    </div>
  )
}
