'use client'

import Link from 'next/link'
import { useState, useTransition } from 'react'
import { useDraftPatientSearch, useOrderCommands } from '@/hooks/use-orders'
import { PatientHeader } from '@/components/orders/PatientHeader'
import { StatusChip } from '@/components/shared/StatusChip'
import { strings } from '@/lib/strings'
import type { ClientStepProps } from '@/types/orders/screen.types'
import { useRouter } from 'next/navigation'

const text = strings.pendingReview.orders

export function ClientStep({ draftId, patient, visit, todayText, canCreateClient }: ClientStepProps) {
  const { selectClient, saveVisit, goToStep, cancelDraft } = useOrderCommands()
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [message, setMessage] = useState('')
  const [typed, setTyped] = useState('')
  const [query, setQuery] = useState('')
  const search = useDraftPatientSearch(draftId, query)
  const results = search.data ?? []
  const [motivo, setMotivo] = useState(visit.motivo)
  const [sampleDate, setSampleDate] = useState(visit.sampleDate)

  function pick(clientId: string) {
    startTransition(async () => {
      const result = await selectClient(draftId, clientId)
      setMessage(result.ok ? '' : result.message)
    })
  }

  function next() {
    startTransition(async () => {
      const saved = await saveVisit({ draftId, motivo, sampleDate })
      if (!saved.ok) return setMessage(saved.message)
      const moved = await goToStep(draftId, 2)
      setMessage(moved.ok ? '' : moved.message)
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
      {patient ? (
        <PatientHeader patient={patient} />
      ) : (
        <form
          role="search"
          onSubmit={(event) => {
            event.preventDefault()
            setQuery(typed.trim())
          }}
          className="flex flex-wrap items-end gap-2"
        >
          <label className="flex min-w-64 flex-1 flex-col gap-1">
            <span className="font-semibold">{text.searchLabel}</span>
            <input
              value={typed}
              onChange={(event) => setTyped(event.target.value)}
              autoComplete="off"
              className="h-10 rounded-[var(--radius-control)] border border-border-strong bg-background px-3"
            />
          </label>
          <button
            type="submit"
            className="h-10 rounded-[var(--radius-control)] bg-primary px-4 font-semibold text-primary-foreground"
          >
            {text.searchButton}
          </button>
          {canCreateClient ? (
            <Link
              href="/clientes/nuevo"
              className="inline-flex h-10 items-center rounded-[var(--radius-control)] border border-border-strong px-4 font-semibold"
            >
              {text.createClient}
            </Link>
          ) : null}
        </form>
      )}

      {!patient && query !== '' && !search.isLoading ? (
        results.length === 0 ? (
          <p className="text-muted-foreground">{text.noMatches}</p>
        ) : (
          <ul className="flex flex-col divide-y divide-border rounded-[var(--radius-card)] border border-border bg-card">
            {results.map((row) => (
              <li key={row.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3">
                <span className="font-semibold">{row.name}</span>
                <span className="tabular-nums">{row.cedulaText}</span>
                <span>{row.ageText}</span>
                {row.verified ? null : <StatusChip status="SIN_VERIFICAR" />}
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => pick(row.id)}
                  className="ml-auto h-10 rounded-[var(--radius-control)] bg-primary px-4 font-semibold text-primary-foreground disabled:opacity-60"
                >
                  {text.pick}
                </button>
              </li>
            ))}
          </ul>
        )
      ) : null}

      {patient ? (
        <>
          <fieldset className="flex flex-col gap-3 rounded-[var(--radius-card)] border border-border bg-card p-4">
            <legend className="px-1 font-semibold">{text.steps[0]}</legend>
            <label className="flex flex-col gap-1">
              <span className="font-semibold">{text.motivo}</span>
              <input
                value={motivo}
                maxLength={200}
                onChange={(event) => setMotivo(event.target.value)}
                className="h-10 rounded-[var(--radius-control)] border border-border-strong bg-background px-3"
              />
            </label>
            <div className="flex flex-wrap items-end gap-2">
              <label className="flex flex-col gap-1">
                <span className="font-semibold">{text.sampleDate}</span>
                <input
                  value={sampleDate}
                  placeholder={text.sampleDatePlaceholder}
                  inputMode="numeric"
                  onChange={(event) => setSampleDate(event.target.value)}
                  className="h-10 w-44 rounded-[var(--radius-control)] border border-border-strong bg-background px-3 tabular-nums"
                />
              </label>
              <button
                type="button"
                onClick={() => setSampleDate(todayText)}
                className="h-10 rounded-[var(--radius-control)] border border-border-strong px-4 font-semibold"
              >
                {text.newVisit}
              </button>
            </div>
            <p className="text-sm text-muted-foreground">{text.newVisitHint}</p>
          </fieldset>
        </>
      ) : null}

      <p role="status" className="min-h-6 text-flag-blocked">
        {message}
      </p>

      <div className="flex flex-wrap justify-between gap-2">
        <button
          type="button"
          disabled={pending}
          onClick={cancel}
          className="h-10 rounded-[var(--radius-control)] border border-border-strong px-4 font-semibold"
        >
          {text.cancel}
        </button>
        <button
          type="button"
          disabled={pending || !patient}
          onClick={next}
          className="h-10 rounded-[var(--radius-control)] bg-primary px-4 font-semibold text-primary-foreground disabled:opacity-60"
        >
          {text.next}
        </button>
      </div>
    </div>
  )
}
