'use client'

import { useState, type FormEvent } from 'react'
import {
  correctCedula,
  deactivateClient,
  deleteClient,
  mergeClientRecords,
  requestMerge,
  undoMerge,
} from '@/app/actions/client-lifecycle'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { StepUpDialog } from '@/components/shared/StepUpDialog'
import { strings } from '@/lib/strings'
import { CEDULA_TYPES, formatCedula, formatDate } from '@/lib/utils/format'
import type { ClientLifecycleProps } from '@/types/clients/lifecycle-panel.types'
import type { LifecycleResult } from '@/types/clients/lifecycle.types'

const text = strings.pendingReview.lifecycle

const INPUT = 'h-10 rounded-[var(--radius-control)] border border-border-strong bg-background px-3'
const SECONDARY = 'h-10 rounded-[var(--radius-control)] border border-border-strong bg-card px-4 font-semibold'

interface Extra {
  confirmed?: boolean
  motivo?: string
}

type Call = (extra: Extra) => Promise<LifecycleResult>

interface Copy {
  title: string
  body: string
  confirmLabel: string
  motivoRequired: boolean
}

interface Pending {
  call: Call
  copy: Copy
  extra: Extra
}

export function ClientLifecycle({
  clientId,
  clientName,
  active,
  capabilities,
  candidates,
  merges,
  requests,
}: ClientLifecycleProps) {
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null)
  const [confirming, setConfirming] = useState<Pending | null>(null)
  const [stepUp, setStepUp] = useState<Pending | null>(null)
  const [busy, setBusy] = useState(false)

  const [cedulaType, setCedulaType] = useState('')
  const [cedulaNumber, setCedulaNumber] = useState('')
  const [cedulaMotivo, setCedulaMotivo] = useState('')
  const [mergeNote, setMergeNote] = useState('')
  const [sourceId, setSourceId] = useState('')
  const [retypedName, setRetypedName] = useState('')

  async function run(pending: Pending) {
    setBusy(true)
    setMessage(null)
    const result = await pending.call(pending.extra)
    setBusy(false)
    if (result.need === 'CONFIRM') {
      setConfirming(pending)
      return
    }
    if (result.need === 'STEP_UP') {
      setStepUp(pending)
      return
    }
    setMessage({ ok: result.ok, text: result.message })
  }

  const start = (call: Call, copy: Copy, extra: Extra = {}) => run({ call, copy, extra })

  const askFirst = (call: Call, copy: Copy) => setConfirming({ call, copy, extra: {} })

  function onConfirm(motivo: string | null) {
    const pending = confirming
    setConfirming(null)
    if (!pending) return
    void run({ ...pending, extra: { ...pending.extra, confirmed: true, ...(motivo ? { motivo } : {}) } })
  }

  function onVerified() {
    const pending = stepUp
    setStepUp(null)
    if (pending) void run(pending)
  }

  const deactivateCopy: Copy = {
    title: text.deactivateTitle,
    body: text.deactivateBody,
    confirmLabel: text.deactivate,
    motivoRequired: false,
  }
  const deleteCopy: Copy = {
    title: text.deleteTitle,
    body: text.deleteBody,
    confirmLabel: text.delete,
    motivoRequired: false,
  }
  const plainCopy: Copy = { title: text.stepUpTitle, body: text.stepUpBody, confirmLabel: text.stepUpSubmit, motivoRequired: false }

  function submitCedula(event: FormEvent) {
    event.preventDefault()
    void start(
      (extra) => correctCedula({ clientId, cedulaType, cedulaNumber, motivo: cedulaMotivo, ...extra }),
      plainCopy,
      { motivo: cedulaMotivo },
    )
  }

  function submitRequest(event: FormEvent) {
    event.preventDefault()
    void start((extra) => requestMerge({ clientId, note: mergeNote, ...extra }), plainCopy)
  }

  function submitMerge(event: FormEvent) {
    event.preventDefault()
    void start((extra) => mergeClientRecords({ clientId, sourceId, retypedName, ...extra }), plainCopy)
  }

  const showAny =
    capabilities.deactivate ||
    capabilities.remove ||
    capabilities.correctCedula ||
    capabilities.requestMerge ||
    capabilities.merge ||
    capabilities.unmerge ||
    requests.length > 0
  if (!showAny) return null

  return (
    <section aria-labelledby="lifecycle-title" className="flex flex-col gap-4 rounded-[var(--radius-card)] border border-border bg-card p-4">
      <h2 id="lifecycle-title" className="text-lg font-semibold">
        {text.title}
      </h2>

      {message ? (
        <p
          role={message.ok ? 'status' : 'alert'}
          className={
            message.ok
              ? 'rounded-[var(--radius-control)] bg-flag-released-bg px-3 py-2 text-flag-released'
              : 'rounded-[var(--radius-control)] bg-flag-blocked-bg px-3 py-2 text-flag-blocked'
          }
        >
          {message.text}
        </p>
      ) : null}

      {requests.length > 0 ? (
        <ul className="flex flex-col gap-1">
          {requests.map((request) => (
            <li key={`${request.requestedAt}-${request.note}`} className="rounded-[var(--radius-control)] bg-flag-incomplete-bg px-3 py-2 text-flag-incomplete">
              {text.requestedBy} {request.requestedBy}: {request.note}
            </li>
          ))}
        </ul>
      ) : null}

      {capabilities.deactivate || capabilities.remove ? (
        <div className="flex flex-wrap gap-2">
          {capabilities.deactivate && active ? (
            <button type="button" disabled={busy} className={SECONDARY} onClick={() => void start((extra) => deactivateClient({ clientId, ...extra }), deactivateCopy)}>
              {text.deactivate}
            </button>
          ) : null}
          {capabilities.remove ? (
            <button type="button" disabled={busy} className={SECONDARY} onClick={() => void start((extra) => deleteClient({ clientId, ...extra }), deleteCopy)}>
              {text.delete}
            </button>
          ) : null}
        </div>
      ) : null}

      {capabilities.correctCedula ? (
        <form onSubmit={submitCedula} className="flex flex-col gap-2 rounded-[var(--radius-control)] border border-border p-3">
          <h3 className="font-semibold">{text.correctCedula}</h3>
          <p className="text-sm text-muted-foreground">{text.correctCedulaHelp}</p>
          <div className="flex flex-wrap gap-2">
            <select aria-label={text.newCedulaType} value={cedulaType} onChange={(event) => setCedulaType(event.target.value)} className={`${INPUT} w-24`}>
              <option value="">{strings.empty.dash}</option>
              {CEDULA_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            <input
              aria-label={text.newCedulaNumber}
              placeholder={text.newCedulaNumber}
              inputMode="numeric"
              value={cedulaNumber}
              onChange={(event) => setCedulaNumber(event.target.value)}
              autoComplete="off"
              className={`${INPUT} min-w-40 flex-1 tabular-nums`}
            />
          </div>
          <input
            aria-label={text.motivo}
            placeholder={text.motivo}
            value={cedulaMotivo}
            onChange={(event) => setCedulaMotivo(event.target.value)}
            autoComplete="off"
            className={INPUT}
          />
          <button type="submit" disabled={busy} className={`${SECONDARY} self-start`}>
            {text.correctSubmit}
          </button>
        </form>
      ) : null}

      {capabilities.requestMerge ? (
        <form onSubmit={submitRequest} className="flex flex-col gap-2 rounded-[var(--radius-control)] border border-border p-3">
          <h3 className="font-semibold">{text.requestMerge}</h3>
          <p className="text-sm text-muted-foreground">{text.requestMergeHelp}</p>
          <input
            aria-label={text.requestMergeNote}
            placeholder={text.requestMergeNote}
            value={mergeNote}
            onChange={(event) => setMergeNote(event.target.value)}
            autoComplete="off"
            className={INPUT}
          />
          <button type="submit" disabled={busy || mergeNote.trim() === ''} className={`${SECONDARY} self-start disabled:opacity-60`}>
            {text.requestMerge}
          </button>
        </form>
      ) : null}

      {capabilities.merge ? (
        <form onSubmit={submitMerge} className="flex flex-col gap-2 rounded-[var(--radius-control)] border border-border p-3">
          <h3 className="font-semibold">{text.merge}</h3>
          <p className="text-sm text-muted-foreground">{text.mergeHelp}</p>
          <label className="flex flex-col gap-1">
            <span>{text.mergeSource}</span>
            <select value={sourceId} onChange={(event) => setSourceId(event.target.value)} className={INPUT}>
              <option value="">{text.mergeSourcePlaceholder}</option>
              {candidates.map((candidate) => (
                <option key={candidate.id} value={candidate.id}>
                  {candidate.fullName}
                  {candidate.cedulaType && candidate.cedulaDigits ? `, ${formatCedula(candidate.cedulaType, candidate.cedulaDigits)}` : ''}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span>
              {text.mergeRetype}: <strong>{clientName}</strong>
            </span>
            <input value={retypedName} onChange={(event) => setRetypedName(event.target.value)} autoComplete="off" className={INPUT} />
          </label>
          <button type="submit" disabled={busy || sourceId === ''} className={`${SECONDARY} self-start disabled:opacity-60`}>
            {text.mergeSubmit}
          </button>
        </form>
      ) : null}

      {capabilities.unmerge ? (
        <div className="flex flex-col gap-2 rounded-[var(--radius-control)] border border-border p-3">
          <h3 className="font-semibold">{text.mergesTitle}</h3>
          {merges.length === 0 ? (
            <p className="text-muted-foreground">{text.mergesEmpty}</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {merges.map((merge) => (
                <li key={merge.id} className="flex flex-wrap items-center justify-between gap-2">
                  <span>
                    {merge.sourceName}, {formatDate(merge.mergedAt.slice(0, 10))}, {merge.mergedBy}
                  </span>
                  <button
                    type="button"
                    disabled={busy}
                    className={SECONDARY}
                    onClick={() =>
                      askFirst((extra) => undoMerge({ mergeId: merge.id, clientId, motivo: extra.motivo ?? '' }), {
                        title: text.unmergeTitle,
                        body: merge.sourceName,
                        confirmLabel: text.unmerge,
                        motivoRequired: true,
                      })
                    }
                  >
                    {text.unmerge}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}

      <ConfirmDialog
        open={confirming !== null}
        title={confirming?.copy.title ?? ''}
        body={confirming?.copy.body ?? ''}
        confirmLabel={confirming?.copy.confirmLabel ?? strings.auth.confirm}
        cancelLabel={strings.auth.cancel}
        motivoRequired={confirming?.copy.motivoRequired ?? false}
        onConfirm={onConfirm}
        onCancel={() => setConfirming(null)}
      />
      <StepUpDialog
        open={stepUp !== null}
        title={text.stepUpTitle}
        description={text.stepUpBody}
        submitLabel={text.stepUpSubmit}
        cancellable
        onVerified={onVerified}
        onCancel={() => setStepUp(null)}
      />
    </section>
  )
}
