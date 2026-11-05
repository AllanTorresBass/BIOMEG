'use client'

import { useState, type FormEvent } from 'react'
import { FiscalPaper } from '@/components/fiscal/FiscalPaper'
import { useFiscalCommands } from '@/hooks/use-fiscal'
import { strings } from '@/lib/strings'
import type { ReprintPanelProps } from '@/types/orders/fiscal-screens.props'
import type { FiscalDocumentView } from '@/types/orders/fiscal.types'

const text = strings.pendingReview.fiscal
const BUTTON = 'h-10 rounded-[var(--radius-control)] bg-primary px-4 font-semibold text-primary-foreground disabled:opacity-60 print:hidden'

export function ReprintPanel({ kind, title }: ReprintPanelProps) {
  const { reprintDocument } = useFiscalCommands()
  const [number, setNumber] = useState('')
  const [document, setDocument] = useState<FiscalDocumentView | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  async function open(event: FormEvent) {
    event.preventDefault()
    setMessage(null)
    setDocument(null)
    try {
      const result = await reprintDocument({ kind, number })
      if (result.ok) setDocument(result.document)
      else setMessage(result.message)
    } catch {
      // useCommand already told the person.
    }
  }

  return (
    <section className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold print:hidden">{title}</h1>
      <form onSubmit={open} role="search" className="flex max-w-xl flex-wrap items-end gap-2 print:hidden">
        <label className="flex min-w-48 flex-1 flex-col gap-1">
          <span className="font-semibold">{text.numberLabel}</span>
          <input
            value={number}
            onChange={(event) => setNumber(event.target.value)}
            autoComplete="off"
            className="h-10 rounded-[var(--radius-control)] border border-border-strong bg-background px-3"
          />
        </label>
        <button type="submit" className={BUTTON}>
          {text.open}
        </button>
      </form>
      {message ? (
        <p role="alert" className="font-semibold text-flag-blocked print:hidden">
          {message}
        </p>
      ) : null}
      {document ? (
        <>
          <FiscalPaper document={document} copy />
          <button type="button" onClick={() => window.print()} className={`${BUTTON} self-start`}>
            {text.print}
          </button>
        </>
      ) : null}
    </section>
  )
}
