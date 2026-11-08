'use client'

import { useState, type FormEvent } from 'react'
import { useClientCommands } from '@/hooks/use-clients'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { StepUpDialog } from '@/components/shared/StepUpDialog'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { strings } from '@/lib/strings'
import { CEDULA_TYPES, formatCedula, formatDate } from '@/lib/utils/format'
import type { ClientLifecycleProps } from '@/types/clients/lifecycle-panel.types'
import type { Call, Copy, Extra, Pending } from '@/types/clients/client-lifecycle.props'

const text = strings.pendingReview.lifecycle

export function ClientLifecycle({
  clientId,
  clientName,
  active,
  currentCedula,
  capabilities,
  candidates,
  merges,
  requests,
}: ClientLifecycleProps) {
  const { deactivateClient, reactivateClient, deleteClient, correctCedula, requestMerge, mergeClientRecords, undoMerge } =
    useClientCommands()
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
  const reactivateCopy: Copy = {
    title: text.reactivateTitle,
    body: text.reactivateBody,
    confirmLabel: text.reactivate,
    motivoRequired: false,
  }
  const deleteCopy: Copy = {
    title: text.deleteTitle,
    body: text.deleteBody,
    confirmLabel: text.delete,
    motivoRequired: false,
  }
  const plainCopy: Copy = {
    title: text.stepUpTitle,
    body: text.stepUpBody,
    confirmLabel: text.stepUpSubmit,
    motivoRequired: false,
  }

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

  const showStatus = capabilities.deactivate || capabilities.reactivate || capabilities.remove
  const showCedula = capabilities.correctCedula
  const showMerge = capabilities.requestMerge || capabilities.merge || capabilities.unmerge || requests.length > 0
  const showAny = showStatus || showCedula || showMerge
  if (!showAny) return null

  const defaults = [
    showStatus ? 'status' : null,
    showCedula ? 'cedula' : null,
    showMerge ? 'merge' : null,
  ].filter(Boolean) as string[]

  return (
    <section
      aria-labelledby="lifecycle-title"
      className="flex flex-col gap-4 rounded-[var(--radius-card)] border border-border bg-card p-4"
    >
      <h2 id="lifecycle-title" className="text-lg font-semibold">
        {text.title}
      </h2>

      {message ? (
        <Alert className={message.ok ? 'border-flag-released bg-flag-released-bg' : undefined} variant={message.ok ? 'default' : 'destructive'}>
          <AlertDescription className={message.ok ? 'text-flag-released' : undefined}>{message.text}</AlertDescription>
        </Alert>
      ) : null}

      {requests.length > 0 ? (
        <ul className="flex flex-col gap-1">
          {requests.map((request) => (
            <li
              key={`${request.requestedAt}-${request.note}`}
              className="rounded-[var(--radius-control)] bg-flag-incomplete-bg px-3 py-2 text-flag-incomplete"
            >
              {text.requestedBy} {request.requestedBy}: {request.note}
            </li>
          ))}
        </ul>
      ) : null}

      <Accordion type="multiple" defaultValue={defaults} className="w-full">
        {showStatus ? (
          <AccordionItem value="status">
            <AccordionTrigger className="font-semibold">{text.statusSection}</AccordionTrigger>
            <AccordionContent>
              <div className="flex flex-wrap gap-2 pt-1">
                {capabilities.deactivate && active ? (
                  <Button
                    type="button"
                    variant="outline"
                    disabled={busy}
                    className="h-10 rounded-[var(--radius-control)]"
                    onClick={() => void start((extra) => deactivateClient({ clientId, ...extra }), deactivateCopy)}
                  >
                    {text.deactivate}
                  </Button>
                ) : null}
                {capabilities.reactivate && !active ? (
                  <Button
                    type="button"
                    variant="outline"
                    disabled={busy}
                    className="h-10 rounded-[var(--radius-control)]"
                    onClick={() => void start((extra) => reactivateClient({ clientId, ...extra }), reactivateCopy)}
                  >
                    {text.reactivate}
                  </Button>
                ) : null}
                {capabilities.remove ? (
                  <Button
                    type="button"
                    variant="outline"
                    disabled={busy}
                    className="h-10 rounded-[var(--radius-control)]"
                    onClick={() => void start((extra) => deleteClient({ clientId, ...extra }), deleteCopy)}
                  >
                    {text.delete}
                  </Button>
                ) : null}
              </div>
            </AccordionContent>
          </AccordionItem>
        ) : null}

        {showCedula ? (
          <AccordionItem value="cedula">
            <AccordionTrigger className="font-semibold">{text.cedulaSection}</AccordionTrigger>
            <AccordionContent>
              <form onSubmit={submitCedula} className="flex flex-col gap-3 pt-1">
                <p className="text-sm text-muted-foreground">{text.correctCedulaHelp}</p>
                <p className="text-sm">
                  <span className="font-semibold">{text.currentCedula}: </span>
                  <span className="tabular-nums">{currentCedula}</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  <select
                    aria-label={text.newCedulaType}
                    value={cedulaType}
                    onChange={(event) => setCedulaType(event.target.value)}
                    className="h-10 w-24 rounded-[var(--radius-control)] border border-input bg-background px-3"
                  >
                    <option value="">{strings.empty.dash}</option>
                    {CEDULA_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                  <Input
                    aria-label={text.newCedulaNumber}
                    placeholder={text.newCedulaNumber}
                    inputMode="numeric"
                    value={cedulaNumber}
                    onChange={(event) => setCedulaNumber(event.target.value)}
                    autoComplete="off"
                    className="h-10 min-w-40 flex-1 rounded-[var(--radius-control)] tabular-nums"
                  />
                </div>
                <Input
                  aria-label={text.motivo}
                  placeholder={text.motivo}
                  value={cedulaMotivo}
                  onChange={(event) => setCedulaMotivo(event.target.value)}
                  autoComplete="off"
                  className="h-10 rounded-[var(--radius-control)]"
                />
                <Button type="submit" variant="outline" disabled={busy} className="h-10 self-start rounded-[var(--radius-control)]">
                  {text.correctSubmit}
                </Button>
              </form>
            </AccordionContent>
          </AccordionItem>
        ) : null}

        {showMerge ? (
          <AccordionItem value="merge">
            <AccordionTrigger className="font-semibold">{text.mergeSection}</AccordionTrigger>
            <AccordionContent className="flex flex-col gap-4 pt-1">
              {capabilities.requestMerge ? (
                <form onSubmit={submitRequest} className="flex flex-col gap-2">
                  <h3 className="font-semibold">{text.requestMerge}</h3>
                  <p className="text-sm text-muted-foreground">{text.requestMergeHelp}</p>
                  <Input
                    aria-label={text.requestMergeNote}
                    placeholder={text.requestMergeNote}
                    value={mergeNote}
                    onChange={(event) => setMergeNote(event.target.value)}
                    autoComplete="off"
                    className="h-10 rounded-[var(--radius-control)]"
                  />
                  <Button
                    type="submit"
                    variant="outline"
                    disabled={busy || mergeNote.trim() === ''}
                    className="h-10 self-start rounded-[var(--radius-control)]"
                  >
                    {text.requestMerge}
                  </Button>
                </form>
              ) : null}

              {capabilities.merge ? (
                <form onSubmit={submitMerge} className="flex flex-col gap-2">
                  <h3 className="font-semibold">{text.merge}</h3>
                  <p className="text-sm text-muted-foreground">{text.mergeHelp}</p>
                  <div className="flex flex-col gap-1">
                    <Label>{text.mergeSource}</Label>
                    <select
                      value={sourceId}
                      onChange={(event) => setSourceId(event.target.value)}
                      className="h-10 rounded-[var(--radius-control)] border border-input bg-background px-3"
                    >
                      <option value="">{text.mergeSourcePlaceholder}</option>
                      {candidates.map((candidate) => (
                        <option key={candidate.id} value={candidate.id}>
                          {candidate.fullName}
                          {candidate.cedulaType && candidate.cedulaDigits
                            ? `, ${formatCedula(candidate.cedulaType, candidate.cedulaDigits)}`
                            : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <Label>
                      {text.mergeRetype}: <strong>{clientName}</strong>
                    </Label>
                    <Input
                      value={retypedName}
                      onChange={(event) => setRetypedName(event.target.value)}
                      autoComplete="off"
                      className="h-10 rounded-[var(--radius-control)]"
                    />
                  </div>
                  <Button
                    type="submit"
                    variant="outline"
                    disabled={busy || sourceId === ''}
                    className="h-10 self-start rounded-[var(--radius-control)]"
                  >
                    {text.mergeSubmit}
                  </Button>
                </form>
              ) : null}

              {capabilities.unmerge ? (
                <div className="flex flex-col gap-2">
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
                          <Button
                            type="button"
                            variant="outline"
                            disabled={busy}
                            className="h-10 rounded-[var(--radius-control)]"
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
                          </Button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : null}
            </AccordionContent>
          </AccordionItem>
        ) : null}
      </Accordion>

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
