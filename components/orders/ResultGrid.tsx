'use client'

import { useState, useTransition } from 'react'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { StatusChip } from '@/components/shared/StatusChip'
import { resolveIncoming, saveResult, saveSectionNote } from '@/app/actions/results'
import { strings } from '@/lib/strings'
import type { GridRow, GridSection, ResultGridView, ResultMark } from '@/types/orders/result.types'

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
  const [cells, setCells] = useState(() => initialCells(view.sections))
  const [drafts, setDrafts] = useState<Record<string, string>>({})
  const [notes, setNotes] = useState<Record<string, string>>(() =>
    Object.fromEntries(view.sections.filter((section) => section.note !== '').map((section) => [section.title, section.note])),
  )
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [conflict, setConflict] = useState<Conflict | null>(null)
  const [pending, setPending] = useState<Pending | null>(null)
  const [message, setMessage] = useState('')
  const [, startTransition] = useTransition()

  const readOnly = !view.canEnter

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

      {view.sections.length === 0 ? <p className="text-muted-foreground">{text.empty}</p> : null}

      {view.sections.map((section) => (
        <section
          key={`${section.title}-${section.subsection ?? ''}`}
          aria-label={section.subsection ? `${section.title}, ${section.subsection}` : section.title}
          className="flex flex-col gap-3"
        >
          <div className="flex flex-col">
            <h2 className="text-lg font-semibold">{section.title}</h2>
            {section.subsection ? <p className="text-muted-foreground">{section.subsection}</p> : null}
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
                    <tr key={row.lineId} className="border-t border-border align-top">
                      <th scope="row" className="p-3 font-normal">
                        {row.name}
                        {cell?.byName && cell.at ? (
                          <span className="block text-sm text-muted-foreground">
                            {cell.byName}, {timeFormat.format(new Date(cell.at))}
                          </span>
                        ) : null}
                      </th>
                      <td className="p-3">
                        <input
                          type="text"
                          inputMode={row.numeric ? 'decimal' : 'text'}
                          aria-label={`${text.colResult}: ${row.name}`}
                          aria-invalid={error ? true : undefined}
                          aria-describedby={error ? errorId : undefined}
                          disabled={readOnly}
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
                        {view.isBioanalyst && view.canEnter ? (
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
