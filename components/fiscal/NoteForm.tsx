'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useState, type FormEvent } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { GestureDialogs } from '@/components/payments/GestureDialogs'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { useFiscalCommands } from '@/hooks/use-fiscal'
import { useGestureCommand } from '@/hooks/use-gesture-command'
import { strings } from '@/lib/strings'
import { formatMoney } from '@/lib/utils/format'
import type { NoteFormProps } from '@/types/orders/fiscal-screens.props'
import type { InvoiceLookup } from '@/types/orders/fiscal.types'
import { noteFormSchema, type NoteFormValues } from '@/types/orders/fiscal.schemas'

const text = strings.pendingReview.fiscal
const FIELD = 'h-10 w-full rounded-[var(--radius-control)] border border-border-strong bg-background px-3'
const PRIMARY = 'h-10 rounded-[var(--radius-control)] bg-primary px-4 font-semibold text-primary-foreground disabled:opacity-60'
const SECONDARY = 'h-10 rounded-[var(--radius-control)] border border-border-strong bg-card px-4 font-semibold'
const EMPTY_LINE = { description: '', amount: '' }

export function NoteForm({ kind }: NoteFormProps) {
  const { findInvoice, issueNote } = useFiscalCommands()
  const gesture = useGestureCommand()
  const [typed, setTyped] = useState('')
  const [invoice, setInvoice] = useState<InvoiceLookup | null>(null)
  const [missing, setMissing] = useState(false)
  const form = useForm<NoteFormValues>({ resolver: zodResolver(noteFormSchema), defaultValues: { lines: [EMPTY_LINE] } })
  const lines = useFieldArray({ control: form.control, name: 'lines' })

  async function search(event: FormEvent) {
    event.preventDefault()
    try {
      const result = await findInvoice(typed)
      setInvoice(result.invoice)
      setMissing(result.invoice === null)
    } catch {
      setMissing(true)
    }
  }

  function submit(values: NoteFormValues) {
    if (!invoice) return
    return gesture.attempt(async () => {
      const result = await issueNote({ orderId: invoice.orderId, kind, lines: values.lines })
      if (result.ok) form.reset({ lines: [EMPTY_LINE] })
      return result
    }, {})
  }

  return (
    <div className="flex max-w-2xl flex-col gap-4">
      <p>{text.noteBody}</p>
      <form onSubmit={search} role="search" className="flex flex-wrap items-end gap-2">
        <label className="flex min-w-48 flex-1 flex-col gap-1">
          <span className="font-semibold">{text.findLabel}</span>
          <input value={typed} onChange={(event) => setTyped(event.target.value)} autoComplete="off" className={FIELD} />
        </label>
        <button type="submit" className={PRIMARY}>
          {text.find}
        </button>
      </form>
      {missing ? <p role="status">{text.invoiceNotFound}</p> : null}

      {invoice ? (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(submit)} noValidate className="flex flex-col gap-3">
            <p className="font-semibold">
              {text.kinds.factura} <span className="tabular-nums">{invoice.invoiceNumber}</span> · {invoice.clientName} ·{' '}
              <span className="tabular-nums">{formatMoney(invoice.totalUsd)} USD</span>
            </p>
            {lines.fields.map((line, index) => (
              <div key={line.id} className="flex flex-wrap items-start gap-2">
                <FormField
                  control={form.control}
                  name={`lines.${index}.description`}
                  render={({ field }) => (
                    <FormItem className="min-w-56 flex-1">
                      <FormLabel>{text.description}</FormLabel>
                      <FormControl>
                        <input {...field} autoComplete="off" className={FIELD} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`lines.${index}.amount`}
                  render={({ field }) => (
                    <FormItem className="w-36">
                      <FormLabel>{text.amount}</FormLabel>
                      <FormControl>
                        <input {...field} inputMode="decimal" autoComplete="off" className={`${FIELD} tabular-nums`} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {lines.fields.length > 1 ? (
                  <button type="button" onClick={() => lines.remove(index)} className={`${SECONDARY} mt-7`}>
                    {text.removeLine}
                  </button>
                ) : null}
              </div>
            ))}
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => lines.append(EMPTY_LINE)} className={SECONDARY}>
                {text.addLine}
              </button>
              <button type="submit" disabled={form.formState.isSubmitting} className={PRIMARY}>
                {text.issue}
              </button>
            </div>
          </form>
        </Form>
      ) : null}
      <GestureDialogs gesture={gesture} />
    </div>
  )
}
