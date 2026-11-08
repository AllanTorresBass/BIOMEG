'use client'

import { useEffect, useId, useRef, useState, useTransition } from 'react'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { useObservationCommands } from '@/hooks/use-observations'
import { strings } from '@/lib/strings'
import type { ObservationRowView } from '@/types/observations/observation.types'

const text = strings.observations

export function ObservationsPanel({
  date,
  rows,
  canUse,
}: {
  date: string
  rows: readonly ObservationRowView[]
  canUse: boolean
}) {
  const [visible, setVisible] = useState(true)
  const [composing, setComposing] = useState(false)
  const [draft, setDraft] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [retractId, setRetractId] = useState<string | null>(null)
  const [localError, setLocalError] = useState('')
  const [busy, startTransition] = useTransition()
  const { create, retract } = useObservationCommands()
  const regionId = useId()
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (composing) textareaRef.current?.focus()
  }, [composing])

  function openComposer() {
    setLocalError('')
    setDraft('')
    setComposing(true)
  }

  function closeComposer() {
    setComposing(false)
    setDraft('')
    setLocalError('')
  }

  function onSave() {
    setLocalError('')
    startTransition(async () => {
      const result = await create({ date, text: draft })
      if (!result.ok) {
        setLocalError(result.message)
        return
      }
      closeComposer()
    })
  }

  function onRetractConfirm() {
    if (!retractId) return
    const id = retractId
    setRetractId(null)
    startTransition(async () => {
      await retract({ id, confirmed: true })
    })
  }

  return (
    <section aria-labelledby={`${regionId}-title`} className="rounded-[var(--radius-card)] border border-border bg-card">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-3">
        <h2 id={`${regionId}-title`} className="text-base font-semibold">
          {text.title}
        </h2>
        <button
          type="button"
          aria-expanded={visible}
          aria-controls={regionId}
          onClick={() => setVisible((value) => !value)}
          className="h-9 rounded-[var(--radius-control)] border border-border-strong px-3 font-semibold"
        >
          {visible ? text.hide : text.show}
        </button>
      </div>

      <div id={regionId} hidden={!visible} className="flex flex-col gap-3 p-4">
        <form method="get" className="flex flex-wrap items-end gap-3">
          <label className="flex flex-col gap-1">
            <span className="font-semibold">{text.date}</span>
            <input
              type="date"
              name="fecha"
              defaultValue={date}
              className="h-10 rounded-[var(--radius-control)] border border-border-strong bg-background px-3 tabular-nums"
            />
          </label>
          <button
            type="submit"
            className="h-10 rounded-[var(--radius-control)] border border-border-strong px-4 font-semibold"
          >
            {text.search}
          </button>
          {canUse ? (
            <button
              type="button"
              onClick={openComposer}
              disabled={composing || busy}
              className="h-10 rounded-[var(--radius-control)] bg-primary px-4 font-semibold text-primary-foreground disabled:opacity-60"
            >
              {text.add}
            </button>
          ) : null}
        </form>

        {composing ? (
          <div className="flex flex-col gap-3 rounded-[var(--radius-control)] border border-border bg-sunken p-3">
            <p className="font-semibold">{text.composerTitle}</p>
            <label className="flex flex-col gap-1">
              <span className="font-semibold">{text.textLabel}</span>
              <textarea
                ref={textareaRef}
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                rows={4}
                disabled={busy}
                className="min-h-24 rounded-[var(--radius-control)] border border-border-strong bg-background px-3 py-2"
              />
            </label>
            <p className="text-sm text-muted-foreground">{text.privacyCaption}</p>
            {localError ? (
              <p role="alert" className="font-semibold text-flag-blocked">
                {localError}
              </p>
            ) : null}
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={busy}
                onClick={onSave}
                className="h-10 rounded-[var(--radius-control)] bg-primary px-4 font-semibold text-primary-foreground disabled:opacity-60"
              >
                {busy ? text.saving : text.save}
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={closeComposer}
                className="h-10 rounded-[var(--radius-control)] border border-border-strong px-4 font-semibold disabled:opacity-60"
              >
                {text.cancel}
              </button>
            </div>
          </div>
        ) : null}

        {rows.length === 0 ? (
          <p className="text-muted-foreground">{text.empty}</p>
        ) : (
          <ul aria-label={text.listLabel} className="flex flex-col divide-y divide-border rounded-[var(--radius-card)] border border-border">
            {rows.map((row) => {
              const open = expandedId === row.id
              return (
                <li key={row.id} className="flex flex-col gap-2 px-3 py-3">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-muted-foreground">
                        <span className="font-semibold text-foreground">{row.authorName}</span>
                        {' · '}
                        <span className="tabular-nums">{row.date}</span>
                      </p>
                      <p className="mt-1 whitespace-pre-wrap">{open ? row.text : row.preview}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        className="h-9 rounded-[var(--radius-control)] border border-border px-3 text-sm font-semibold"
                        onClick={() => setExpandedId(open ? null : row.id)}
                      >
                        {open ? text.collapse : text.expand}
                      </button>
                      {row.canRetract ? (
                        <button
                          type="button"
                          disabled={busy}
                          className="h-9 rounded-[var(--radius-control)] border border-flag-blocked px-3 text-sm font-semibold text-flag-blocked disabled:opacity-60"
                          onClick={() => setRetractId(row.id)}
                        >
                          {text.retract}
                        </button>
                      ) : null}
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      <ConfirmDialog
        open={retractId !== null}
        title={text.retractTitle}
        body={text.retractBody}
        confirmLabel={text.retractConfirm}
        cancelLabel={text.cancel}
        onConfirm={() => onRetractConfirm()}
        onCancel={() => setRetractId(null)}
      />
    </section>
  )
}
