'use client'

import { Fragment, useState, useTransition } from 'react'
import { useResultCommands } from '@/hooks/use-results'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { StatusChip } from '@/components/shared/StatusChip'
import { StepUpDialog } from '@/components/shared/StepUpDialog'
import { strings } from '@/lib/strings'
import type { GridRow, GridSection, ResultGridView, ResultMark, RowHistoryEntry } from '@/types/orders/result.types'

const text = strings.pendingReview.results

interface CellState {
  value: string
  mark: ResultMark | null
  version: number
  byName: string | null
  at: string | null
  incoming: GridRow['incoming']
}

type Pending =
  | { kind: 'save'; lineId: string; value: string; manualMark?: ResultMark | '' }
  | { kind: 'incoming'; lineId: string; choice: 'use' | 'keep' }

type CorrectionOperation =
  | { kind: 'open'; section: string; motivo: string }
  | { kind: 'cancel'; section: string }
  | { kind: 'release'; section: string }

interface Conflict {
  lineId: string
  message: string
  yourValue: string
  version: number
}

const timeFormat = new Intl.DateTimeFormat('es-VE', { timeZone: 'America/Caracas', timeStyle: 'short' })

function without<T>(record: Record<string, T>, key: string): Record<string, T> {
  return Object.fromEntries(Object.entries(record).filter(([name]) => name !== key))
}

function initialCells(sections: readonly GridSection[]): Record<string, CellState> {
  const cells: Record<string, CellState> = {}
  for (const section of sections) {
    for (const row of section.rows) {
      cells[row.lineId] = {
        value: row.value,
        mark: row.mark,
        version: row.version,
        byName: row.byName,
        at: row.at,
        incoming: row.incoming,
      }
    }
  }
  return cells
}

export function ResultGrid({ view }: { view: ResultGridView }) {
  const { saveResult, resolveIncoming, releaseResults, rowHistory, openCorrection, cancelCorrection, releaseCorrection } = useResultCommands()
  const [cells, setCells] = useState(() => initialCells(view.sections))
  const [drafts, setDrafts] = useState<Record<string, string>>({})
  const [notes, setNotes] = useState<Record<string, string>>(() =>
    Object.fromEntries(view.sections.filter((section) => section.note !== '').map((section) => [section.title, section.note])),
  )
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [conflict, setConflict] = useState<Conflict | null>(null)
  const [pending, setPending] = useState<Pending | null>(null)
  const [message, setMessage] = useState('')
  const [selected, setSelected] = useState<string[]>([])
  const [stepUpOpen, setStepUpOpen] = useState(false)
  const [releaseMessage, setReleaseMessage] = useState('')
  const [history, setHistory] = useState<{ lineId: string; entries: RowHistoryEntry[] | null; error: string } | null>(null)
  const [, startTransition] = useTransition()
  const [seenRevision, setSeenRevision] = useState(view.revision)
  const [correctionDialog, setCorrectionDialog] = useState<{ kind: CorrectionOperation['kind']; section: string } | null>(null)
  const [correctionStepUp, setCorrectionStepUp] = useState<CorrectionOperation | null>(null)
  const [correctionMessage, setCorrectionMessage] = useState('')

  if (seenRevision !== view.revision) {
    setSeenRevision(view.revision)
    setCells(initialCells(view.sections))
    setDrafts({})
    setErrors({})
    setConflict(null)
  }

  const readOnly = !view.canEnter

  function runCorrection(operation: CorrectionOperation) {
    setCorrectionMessage('')
    startTransition(async () => {
      const result =
        operation.kind === 'open'
          ? await openCorrection({ orderId: view.orderId, section: operation.section, motivo: operation.motivo })
          : operation.kind === 'cancel'
            ? await cancelCorrection({ orderId: view.orderId, section: operation.section })
            : await releaseCorrection({ orderId: view.orderId, section: operation.section })
      if (result.need === 'STEP_UP') return setCorrectionStepUp(operation)
      setCorrectionStepUp(null)
      setCorrectionDialog(null)
      setCorrectionMessage(result.message)
    })
  }
  const releasableTitles = [...new Set(view.sections.filter((section) => section.releasable).map((section) => section.title))]

  function toggleSection(title: string) {
    setSelected((current) => (current.includes(title) ? current.filter((entry) => entry !== title) : [...current, title]))
  }

  function release() {
    if (selected.length === 0) return setReleaseMessage(text.release.none)
    setReleaseMessage('')
    startTransition(async () => {
      const result = await releaseResults({ orderId: view.orderId, sections: selected })
      if (result.need === 'STEP_UP') return setStepUpOpen(true)
      setStepUpOpen(false)
      setReleaseMessage(result.message)
      if (result.ok) setSelected([])
    })
  }

  function openHistory(lineId: string) {
    if (history?.lineId === lineId) return setHistory(null)
    setHistory({ lineId, entries: null, error: '' })
    startTransition(async () => {
      const result = await rowHistory({ orderId: view.orderId, lineId })
      setHistory({ lineId, entries: result.ok ? result.entries : null, error: result.ok ? '' : text.release.historyLoadFailed })
    })
  }

  function clearError(lineId: string) {
    setErrors((current) => without(current, lineId))
  }

  function run(operation: Pending, motivo?: string) {
    startTransition(async () => {
      if (operation.kind === 'incoming') {
        const result = await resolveIncoming({ orderId: view.orderId, lineId: operation.lineId, choice: operation.choice, motivo })
        if (result.need === 'MOTIVO') return setPending(operation)
        if (!result.ok) return setMessage(result.message)
        setPending(null)
        setCells((current) => {
          const cell = current[operation.lineId]
          if (!cell) return current
          const value = operation.choice === 'use' && cell.incoming ? cell.incoming.value : cell.value
          return { ...current, [operation.lineId]: { ...cell, value, incoming: null, version: cell.version + 1 } }
        })
        return
      }
      const cell = cells[operation.lineId]
      const result = await saveResult({
        orderId: view.orderId,
        lineId: operation.lineId,
        value: operation.value,
        expectedVersion: cell?.version ?? 0,
        manualMark: operation.manualMark,
        motivo,
      })
      if (result.need === 'MOTIVO') return setPending(operation)
      setPending(null)
      if (result.conflict) {
        setConflict({
          lineId: operation.lineId,
          message: result.message,
          yourValue: result.conflict.yourValue,
          version: result.conflict.version,
        })
        setCells((current) => {
          const previous = current[operation.lineId]
          const stored = result.conflict
          if (!previous || !stored) return current
          return { ...current, [operation.lineId]: { ...previous, value: stored.storedValue, version: stored.version } }
        })
        return
      }
      if (!result.ok) {
        setErrors((current) => ({ ...current, [operation.lineId]: result.message }))
        return
      }
      clearError(operation.lineId)
      setConflict(null)
      const saved = result.saved
      if (saved) {
        setCells((current) => ({
          ...current,
          [operation.lineId]: { ...(current[operation.lineId] as CellState), ...saved, incoming: current[operation.lineId]?.incoming ?? null },
        }))
        setDrafts((current) => without(current, operation.lineId))
      }
    })
  }

  function commit(row: GridRow, manualMark?: ResultMark | '') {
    const cell = cells[row.lineId]
    const draft = drafts[row.lineId]
    const value = (draft ?? cell?.value ?? '').trim()
    if (manualMark === undefined && (draft === undefined || value === cell?.value)) return
    if (value === '') return
    run({ kind: 'save', lineId: row.lineId, value, manualMark })
  }

  return (
    <div className="flex flex-col gap-6">
      {message ? (
        <p role="alert" className="font-semibold text-flag-blocked">
          {message}
        </p>
      ) : null}

      {conflict ? (
        <div role="alert" className="flex flex-col gap-3 rounded-[var(--radius-card)] border border-flag-blocked bg-card p-4">
          <p className="font-semibold">{conflict.message}</p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="min-h-11 rounded-[var(--radius-control)] border border-border px-4 font-semibold"
              onClick={() => {
                setDrafts((current) => without(current, conflict.lineId))
                setConflict(null)
              }}
            >
              {text.conflictKeep}
            </button>
            <button
              type="button"
              className="min-h-11 rounded-[var(--radius-control)] bg-primary px-4 font-semibold text-primary-foreground"
              onClick={() => {
                const cell = cells[conflict.lineId]
                if (cell) setCells({ ...cells, [conflict.lineId]: { ...cell, version: conflict.version } })
                run({ kind: 'save', lineId: conflict.lineId, value: conflict.yourValue })
              }}
            >
              {text.conflictMine}
            </button>
          </div>
        </div>
      ) : null}

      {correctionMessage !== '' ? (
        <p role="status" className="font-semibold">
          {correctionMessage}
        </p>
      ) : null}

      {view.sections.length === 0 ? <p className="text-muted-foreground">{text.empty}</p> : null}

      {view.isBioanalyst && releasableTitles.length > 0 ? (
        <div className="flex flex-wrap items-center gap-3 rounded-[var(--radius-card)] border border-border bg-card p-4">
          <button
            type="button"
            onClick={release}
            className="min-h-11 rounded-[var(--radius-control)] bg-primary px-4 font-semibold text-primary-foreground"
          >
            {text.release.button}
          </button>
          <span role="status" className="text-muted-foreground">
            {releaseMessage}
          </span>
        </div>
      ) : releaseMessage !== '' ? (
        <p role="status" className="text-muted-foreground">
          {releaseMessage}
        </p>
      ) : null}

      {view.sections.map((section, index) => (
        <section
          key={`${section.title}-${section.subsection ?? ''}`}
          aria-label={section.subsection ? `${section.title}, ${section.subsection}` : section.title}
          className="flex flex-col gap-3"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex flex-col">
              <h2 className="text-lg font-semibold">{section.title}</h2>
              {section.subsection ? <p className="text-muted-foreground">{section.subsection}</p> : null}
              {section.released ? (
                <p className="text-sm text-muted-foreground">
                  {text.release.releasedBy(section.released.byName, timeFormat.format(new Date(section.released.at)))}
                </p>
              ) : null}
              {section.correction ? (
                <p className="text-sm font-semibold text-flag-blocked">
                  {text.release.correct.openedBy(section.correction.byName, timeFormat.format(new Date(section.correction.at)))}
                  <span className="block font-normal text-muted-foreground">{text.release.correct.reason(section.correction.motivo)}</span>
                </p>
              ) : null}
            </div>
            {view.isBioanalyst && section.correctable ? (
              <button
                type="button"
                onClick={() => setCorrectionDialog({ kind: 'open', section: section.title })}
                className="min-h-11 rounded-[var(--radius-control)] border border-border px-4 font-semibold"
              >
                {text.release.correct.open}
              </button>
            ) : null}
            {view.isBioanalyst && section.correction ? (
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setCorrectionDialog({ kind: 'cancel', section: section.title })}
                  className="min-h-11 rounded-[var(--radius-control)] border border-border px-4 font-semibold"
                >
                  {text.release.correct.cancel}
                </button>
                <button
                  type="button"
                  onClick={() => setCorrectionDialog({ kind: 'release', section: section.title })}
                  className="min-h-11 rounded-[var(--radius-control)] bg-primary px-4 font-semibold text-primary-foreground"
                >
                  {text.release.correct.release}
                </button>
              </div>
            ) : null}
            {view.isBioanalyst && section.releasable && view.sections.findIndex((entry) => entry.title === section.title) === index ? (
              <label className="flex min-h-11 items-center gap-2 font-semibold">
                <input
                  type="checkbox"
                  className="size-5"
                  checked={selected.includes(section.title)}
                  onChange={() => toggleSection(section.title)}
                  aria-label={text.release.selectSection(section.title)}
                />
                {text.release.selectSection(section.title)}
              </label>
            ) : null}
          </div>
          <div className="overflow-x-auto rounded-[var(--radius-card)] border border-border bg-card">
            <table aria-label={text.gridLabel} className="w-full min-w-[44rem] text-left">
              <thead className="bg-sunken text-sm text-muted-foreground">
                <tr>
                  <th scope="col" className="p-3">{text.colName}</th>
                  <th scope="col" className="p-3">{text.colResult}</th>
                  <th scope="col" className="p-3">{text.colMark}</th>
                  <th scope="col" className="p-3">{text.colUnit}</th>
                  <th scope="col" className="p-3">{text.colReference}</th>
                </tr>
              </thead>
              <tbody>
                {section.rows.map((row) => {
                  const cell = cells[row.lineId]
                  const shown = drafts[row.lineId] ?? cell?.value ?? ''
                  const error = errors[row.lineId]
                  const errorId = `err-${row.lineId}`
                  return (
                    <Fragment key={row.lineId}>
                    <tr className="border-t border-border align-top">
                      <th scope="row" className="p-3 font-normal">
                        {row.name}
                        {cell?.byName && cell.at ? (
                          <span className="block text-sm text-muted-foreground">
                            {cell.byName}, {timeFormat.format(new Date(cell.at))}
                          </span>
                        ) : null}
                        {cell?.byName ? (
                          <button
                            type="button"
                            aria-expanded={history?.lineId === row.lineId}
                            onClick={() => openHistory(row.lineId)}
                            className="mt-1 min-h-11 text-sm font-semibold underline"
                          >
                            {text.release.history}
                          </button>
                        ) : null}
                      </th>
                      <td className="p-3">
                        <input
                          type="text"
                          inputMode={row.numeric ? 'decimal' : 'text'}
                          aria-label={`${text.colResult}: ${row.name}`}
                          aria-invalid={error ? true : undefined}
                          aria-describedby={error ? errorId : undefined}
                          disabled={readOnly || section.released !== null}
                          value={shown}
                          onChange={(event) => setDrafts({ ...drafts, [row.lineId]: event.target.value })}
                          onBlur={() => commit(row)}
                          onKeyDown={(event) => {
                            if (event.key === 'Enter' && !event.nativeEvent.isComposing) commit(row)
                          }}
                          className="min-h-11 w-32 rounded-[var(--radius-control)] border border-border bg-background px-3 tabular-nums disabled:opacity-100"
                        />
                        {error ? (
                          <p id={errorId} role="alert" className="mt-1 text-sm font-semibold text-flag-blocked">
                            {error}
                          </p>
                        ) : null}
                        {cell?.incoming ? (
                          <div className="mt-2 flex flex-col gap-1 text-sm">
                            <span>
                              {text.incomingLabel}: <span className="font-semibold tabular-nums">{cell.incoming.value}</span>
                            </span>
                            {view.isBioanalyst ? (
                              <span className="flex flex-wrap gap-2">
                                <button
                                  type="button"
                                  className="min-h-11 rounded-[var(--radius-control)] border border-border px-3 font-semibold"
                                  onClick={() => run({ kind: 'incoming', lineId: row.lineId, choice: 'use' })}
                                >
                                  {text.incomingUse}
                                </button>
                                <button
                                  type="button"
                                  className="min-h-11 rounded-[var(--radius-control)] border border-border px-3 font-semibold"
                                  onClick={() => run({ kind: 'incoming', lineId: row.lineId, choice: 'keep' })}
                                >
                                  {text.incomingKeep}
                                </button>
                              </span>
                            ) : null}
                          </div>
                        ) : null}
                      </td>
                      <td className="p-3">
                        {view.isBioanalyst && view.canEnter && section.released === null ? (
                          <select
                            aria-label={`${text.colMark}: ${row.name}`}
                            value={cell?.mark ?? ''}
                            onChange={(event) => commit(row, event.target.value as ResultMark | '')}
                            className="min-h-11 rounded-[var(--radius-control)] border border-border bg-background px-2"
                          >
                            <option value="">{text.markBlank}</option>
                            <option value="ALTO">ALTO</option>
                            <option value="BAJO">BAJO</option>
                          </select>
                        ) : cell?.mark ? (
                          <StatusChip status={cell.mark} />
                        ) : null}
                      </td>
                      <td className="p-3 text-muted-foreground">{row.unit ?? strings.empty.dash}</td>
                      <td className="p-3 tabular-nums text-muted-foreground">{row.reference}</td>
                    </tr>
                    {history?.lineId === row.lineId ? (
                      <tr className="bg-sunken">
                        <td colSpan={5} className="p-3">
                          <p className="font-semibold">{text.release.historyTitle(row.name)}</p>
                          {history.error ? (
                            <p role="alert" className="text-flag-blocked">
                              {history.error}
                            </p>
                          ) : history.entries === null ? null : history.entries.length === 0 ? (
                            <p className="text-muted-foreground">{text.release.historyEmpty}</p>
                          ) : (
                            <table className="mt-2 w-full text-left text-sm">
                              <thead className="text-muted-foreground">
                                <tr>
                                  <th scope="col" className="py-1 pr-3">{text.release.historyOperator}</th>
                                  <th scope="col" className="py-1 pr-3">{text.release.historyAt}</th>
                                  <th scope="col" className="py-1 pr-3">{text.release.historyBefore}</th>
                                  <th scope="col" className="py-1 pr-3">{text.release.historyAfter}</th>
                                  <th scope="col" className="py-1">{text.release.historyMotivo}</th>
                                </tr>
                              </thead>
                              <tbody>
                                {history.entries.map((entry) => (
                                  <tr key={`${entry.at}-${entry.after}`} className="border-t border-border">
                                    <td className="py-1 pr-3">{entry.operator}</td>
                                    <td className="py-1 pr-3">{timeFormat.format(new Date(entry.at))}</td>
                                    <td className="py-1 pr-3 tabular-nums">{entry.before}</td>
                                    <td className="py-1 pr-3 tabular-nums">{entry.after}</td>
                                    <td className="py-1">{entry.motivo}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          )}
                        </td>
                      </tr>
                    ) : null}
                    </Fragment>
                  )
                })}
              </tbody>
            </table>
          </div>

          {section.note !== '' || notes[section.title] !== undefined || view.canEnter ? (
            <NoteField
              orderId={view.orderId}
              section={section.title}
              readOnly={readOnly}
              value={notes[section.title] ?? ''}
              onChange={(value) => setNotes({ ...notes, [section.title]: value })}
            />
          ) : null}
        </section>
      ))}

      <StepUpDialog
        open={stepUpOpen}
        title={text.release.stepUpTitle}
        description={text.release.stepUpBody}
        submitLabel={text.release.button}
        cancellable
        onVerified={release}
        onCancel={() => setStepUpOpen(false)}
      />

      {correctionDialog ? (
        <ConfirmDialog
          key={`${correctionDialog.kind}-${correctionDialog.section}`}
          open
          title={
            correctionDialog.kind === 'open'
              ? text.release.correct.openTitle(correctionDialog.section)
              : correctionDialog.kind === 'cancel'
                ? text.release.correct.cancelTitle
                : text.release.correct.releaseTitle(correctionDialog.section)
          }
          body={
            correctionDialog.kind === 'open'
              ? text.release.correct.openBody
              : correctionDialog.kind === 'cancel'
                ? text.release.correct.cancelBody
                : text.release.correct.releaseBody
          }
          confirmLabel={
            correctionDialog.kind === 'open'
              ? text.release.correct.confirmOpen
              : correctionDialog.kind === 'cancel'
                ? text.release.correct.confirmCancel
                : text.release.correct.release
          }
          cancelLabel={correctionDialog.kind === 'cancel' ? text.release.correct.keepEditing : text.cancel}
          motivoRequired={correctionDialog.kind === 'open'}
          onConfirm={(motivo) => {
            const { kind, section } = correctionDialog
            if (kind === 'open') {
              if (motivo) runCorrection({ kind, section, motivo })
              return
            }
            runCorrection({ kind, section })
          }}
          onCancel={() => setCorrectionDialog(null)}
        />
      ) : null}

      <StepUpDialog
        open={correctionStepUp !== null}
        title={text.release.stepUpTitle}
        description={text.release.correct.releaseBody}
        submitLabel={text.release.correct.release}
        cancellable
        onVerified={() => {
          if (correctionStepUp) runCorrection(correctionStepUp)
        }}
        onCancel={() => setCorrectionStepUp(null)}
      />

      <ConfirmDialog
        open={pending !== null}
        title={text.motivoTitle}
        body={text.motivoLabel}
        confirmLabel={text.motivoConfirm}
        cancelLabel={text.cancel}
        motivoRequired
        onConfirm={(motivo) => {
          if (pending && motivo) run(pending, motivo)
        }}
        onCancel={() => setPending(null)}
      />
    </div>
  )
}

function NoteField({
  orderId,
  section,
  readOnly,
  value,
  onChange,
}: {
  orderId: string
  section: string
  readOnly: boolean
  value: string
  onChange: (value: string) => void
}) {
  const { saveSectionNote } = useResultCommands()
  const [status, setStatus] = useState('')
  const [, startTransition] = useTransition()
  const id = `note-${section}`
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="font-semibold">
        {text.noteLabel}
      </label>
      <textarea
        id={id}
        rows={2}
        value={value}
        disabled={readOnly}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-[var(--radius-control)] border border-border bg-background p-3 disabled:opacity-100"
      />
      {readOnly ? null : (
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="min-h-11 rounded-[var(--radius-control)] border border-border px-4 font-semibold"
            onClick={() =>
              startTransition(async () => {
                const result = await saveSectionNote({ orderId, section, text: value })
                setStatus(result.message)
              })
            }
          >
            {text.noteSave}
          </button>
          <span role="status" className="text-muted-foreground">
            {status}
          </span>
        </div>
      )}
    </div>
  )
}
