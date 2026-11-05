'use client'

import { useRouter } from 'next/navigation'
import { useMemo, useState, useTransition } from 'react'
import { useOrderCommands } from '@/hooks/use-orders'
import { PatientHeader } from '@/components/orders/PatientHeader'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { StatusChip } from '@/components/shared/StatusChip'
import { COST_TYPES, COST_TYPE_LABELS, PRICE_COLUMNS, PRICE_COLUMN_LABELS } from '@/lib/config/price-defaults'
import { strings } from '@/lib/strings'
import type { AddLineInput, CostType, PriceColumn } from '@/types/orders/draft.types'
import type { ExamsStepProps } from '@/types/orders/screen.types'
import type { Question } from '@/types/orders/exams-step.props'

const text = strings.pendingReview.orders

const FIELD = 'h-10 rounded-[var(--radius-control)] border border-border-strong bg-background px-3'

export function ExamsStep({ draftId, patient, costType, billing, catalog, lines, totals, rateMissing }: ExamsStepProps) {
  const { saveBilling, addLine, removeLine, goToStep, cancelDraft } = useOrderCommands()
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [message, setMessage] = useState('')
  const [question, setQuestion] = useState<Question | null>(null)

  const [filter, setFilter] = useState('')
  const [examId, setExamId] = useState('')
  const [column, setColumn] = useState<PriceColumn | ''>('')

  const [cost, setCost] = useState<CostType | ''>(costType ?? '')
  const [cedula, setCedula] = useState(billing.cedula)
  const [razonSocial, setRazonSocial] = useState(billing.razonSocial)
  const [direccion, setDireccion] = useState(billing.direccion)

  const visible = useMemo(() => {
    const needle = filter.trim().toLowerCase()
    return needle === '' ? catalog : catalog.filter((option) => option.name.toLowerCase().includes(needle))
  }, [catalog, filter])

  function submitAdd(input: AddLineInput, examName: string) {
    startTransition(async () => {
      const result = await addLine(input)
      if (result.ok) {
        setQuestion(null)
        setMessage(result.message)
        setExamId('')
        return
      }
      if (result.need) {
        setQuestion({ need: result.need, examName, input })
        return
      }
      setQuestion(null)
      setMessage(result.message)
    })
  }

  function add() {
    const exam = catalog.find((option) => option.id === examId)
    if (!exam) return
    submitAdd({ draftId, examId, column: column === '' ? null : column }, exam.name)
  }

  function answer(motivo: string | null) {
    if (!question) return
    const { need, input, examName } = question
    if (need === 'CONFIRM_NO_DISP') submitAdd({ ...input, confirmNoDisp: true }, examName)
    else if (need === 'SAME_DAY') submitAdd({ ...input, repeatMotivo: motivo ?? '' }, examName)
    else submitAdd({ ...input, confirmOverride: true, overrideMotivo: motivo ?? '' }, examName)
  }

  function remove(lineId: string) {
    startTransition(async () => {
      const result = await removeLine(draftId, lineId)
      setMessage(result.message)
    })
  }

  function saveBillingCard() {
    startTransition(async () => {
      const result = await saveBilling({
        draftId,
        costType: cost === '' ? null : cost,
        cedula,
        razonSocial,
        direccion,
      })
      setMessage(result.message)
    })
  }

  function move(step: 1 | 3) {
    startTransition(async () => {
      const result = await goToStep(draftId, step)
      setMessage(result.message)
    })
  }

  function cancel() {
    startTransition(async () => {
      await cancelDraft(draftId)
      router.push('/')
    })
  }

  const dialog = question ? dialogFor(question) : null

  return (
    <div className="flex flex-col gap-4">
      <PatientHeader patient={patient} />

      <fieldset className="flex flex-col gap-3 rounded-[var(--radius-card)] border border-border bg-card p-4">
        <legend className="px-1 font-semibold">{text.billingTitle}</legend>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <label className="flex flex-col gap-1">
            <span className="font-semibold">{text.costType}</span>
            <select value={cost} onChange={(event) => setCost(event.target.value as CostType | '')} className={FIELD}>
              <option value="">{strings.empty.dash}</option>
              {COST_TYPES.map((value) => (
                <option key={value} value={value}>
                  {COST_TYPE_LABELS[value]}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="font-semibold">{text.cedula}</span>
            <input value={cedula} maxLength={20} onChange={(event) => setCedula(event.target.value)} className={FIELD} />
          </label>
          <label className="flex flex-col gap-1 sm:col-span-2">
            <span className="font-semibold">{text.razonSocial}</span>
            <input value={razonSocial} maxLength={120} onChange={(event) => setRazonSocial(event.target.value)} className={FIELD} />
          </label>
          <label className="flex flex-col gap-1 sm:col-span-2 lg:col-span-4">
            <span className="font-semibold">{text.direccion}</span>
            <input value={direccion} maxLength={200} onChange={(event) => setDireccion(event.target.value)} className={FIELD} />
          </label>
        </div>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
          <span>
            {text.invoiceNumber}: {strings.orders.controlPending}
          </span>
          <span>
            {text.controlNumber}: {strings.orders.controlPending}
          </span>
          {razonSocial.trim() === '' ? <span>{strings.orders.billedToPatient}</span> : null}
          <button
            type="button"
            disabled={pending}
            onClick={saveBillingCard}
            className="ml-auto h-10 rounded-[var(--radius-control)] border border-border-strong px-4 font-semibold text-foreground"
          >
            {text.saveBilling}
          </button>
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-3 rounded-[var(--radius-card)] border border-border bg-card p-4">
        <legend className="px-1 font-semibold">{text.pickExam}</legend>
        {rateMissing ? (
          <p className="flex items-center gap-2">
            <StatusChip status="SIN_TASA" />
            <span>{text.noRate}</span>
          </p>
        ) : null}
        <div className="grid gap-3 md:grid-cols-[minmax(0,2fr)_minmax(0,2fr)_minmax(0,1fr)_auto] md:items-end">
          <label className="flex flex-col gap-1">
            <span className="font-semibold">{text.pickExamPlaceholder}</span>
            <input value={filter} onChange={(event) => setFilter(event.target.value)} className={FIELD} />
          </label>
          <label className="flex flex-col gap-1">
            <span className="font-semibold">{text.colExam}</span>
            <select value={examId} onChange={(event) => setExamId(event.target.value)} className={FIELD}>
              <option value="">{strings.empty.dash}</option>
              {visible.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.available ? option.name : `${option.name} (${text.unavailable})`}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="font-semibold">{text.priceColumn}</span>
            <select value={column} onChange={(event) => setColumn(event.target.value as PriceColumn | '')} className={FIELD}>
              <option value="">{text.priceColumnNone}</option>
              {PRICE_COLUMNS.map((value) => (
                <option key={value} value={value}>
                  {PRICE_COLUMN_LABELS[value]}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            disabled={pending || examId === '' || rateMissing}
            onClick={add}
            className="h-10 rounded-[var(--radius-control)] bg-primary px-4 font-semibold text-primary-foreground disabled:opacity-60"
          >
            {text.add}
          </button>
        </div>
      </fieldset>

      {lines.length === 0 ? (
        <p className="text-muted-foreground">{strings.orders.noLines}</p>
      ) : (
        <div className="overflow-x-auto rounded-[var(--radius-card)] border border-border bg-card">
          <table className="w-full min-w-[44rem] text-left">
            <thead className="bg-sunken text-sm">
              <tr>
                <th scope="col" className="px-3 py-2">{text.colExam}</th>
                <th scope="col" className="px-3 py-2">{text.colCostType}</th>
                <th scope="col" className="px-3 py-2">{text.colColumn}</th>
                <th scope="col" className="px-3 py-2">{text.colCurrency}</th>
                <th scope="col" className="px-3 py-2 text-right">{text.colPrice}</th>
                <th scope="col" className="px-3 py-2">{text.colStatus}</th>
                <th scope="col" className="px-3 py-2">
                  <span className="sr-only">{text.remove}</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {lines.map((line) => (
                <tr key={line.id} className="border-t border-border">
                  <td className="px-3 py-2 font-semibold">{line.examName}</td>
                  <td className="px-3 py-2">{line.costTypeLabel}</td>
                  <td className="px-3 py-2">{line.columnLabel}</td>
                  <td className="px-3 py-2">{line.currency}</td>
                  <td className="px-3 py-2 text-right tabular-nums">
                    {line.sinPrecio ? (
                      <StatusChip status="INCOMPLETO" />
                    ) : (
                      <span className="flex flex-col items-end">
                        <span>{line.priceText}</span>
                        <span className="text-xs text-muted-foreground">{line.basisLabel}</span>
                      </span>
                    )}
                    {line.sinPrecio ? <span className="sr-only">{line.priceText}</span> : null}
                  </td>
                  <td className="px-3 py-2">
                    <StatusChip status={line.available ? 'DISPONIBLE' : 'NO_DISP'} />
                  </td>
                  <td className="px-3 py-2 text-right">
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => remove(line.id)}
                      aria-label={`${text.removeLabel} ${line.examName}`}
                      className="h-10 rounded-[var(--radius-control)] border border-border-strong px-3 font-semibold"
                    >
                      {text.remove}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <dl className="flex flex-wrap items-baseline gap-x-6 gap-y-1 rounded-[var(--radius-card)] border border-border bg-card px-4 py-3 tabular-nums">
        <dt className="sr-only">{text.totalTitle}</dt>
        <dd className="font-semibold">{totals.countText}</dd>
        <div className="flex gap-2">
          <dt className="text-muted-foreground">{text.totalUsd}</dt>
          <dd className="font-semibold">{totals.usd}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="text-muted-foreground">{text.totalRate}</dt>
          <dd>{totals.rate ?? strings.empty.dash}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="text-muted-foreground">{text.totalBs}</dt>
          <dd className="font-semibold">{totals.bs ?? strings.empty.dash}</dd>
        </div>
        {totals.hasSinPrecio ? <p className="basis-full text-sm text-muted-foreground">{text.sinPrecioNote}</p> : null}
      </dl>

      <p role="status" className="min-h-6">
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
        <div className="flex gap-2">
          <button
            type="button"
            disabled={pending}
            onClick={() => move(1)}
            className="h-10 rounded-[var(--radius-control)] border border-border-strong px-4 font-semibold"
          >
            {text.back}
          </button>
          <button
            type="button"
            disabled={pending || lines.length === 0}
            onClick={() => move(3)}
            className="h-10 rounded-[var(--radius-control)] bg-primary px-4 font-semibold text-primary-foreground disabled:opacity-60"
          >
            {text.next}
          </button>
        </div>
      </div>

      {question && dialog ? (
        <ConfirmDialog
          key={`${question.need}-${question.examName}`}
          open
          title={dialog.title}
          body={dialog.body}
          confirmLabel={dialog.confirmLabel}
          cancelLabel={strings.auth.cancel}
          motivoRequired={dialog.motivoRequired}
          onConfirm={answer}
          onCancel={() => setQuestion(null)}
        />
      ) : null}
    </div>
  )
}

function dialogFor({ need, examName }: Question) {
  if (need === 'CONFIRM_NO_DISP') {
    return {
      title: text.noDispTitle,
      body: text.noDispBody(examName),
      confirmLabel: text.noDispConfirm,
      motivoRequired: false,
    }
  }
  if (need === 'SAME_DAY') {
    return {
      title: text.sameDayTitle,
      body: text.sameDayBody(examName),
      confirmLabel: text.sameDayConfirm,
      motivoRequired: true,
    }
  }
  return { title: text.overrideTitle, body: text.overrideBody, confirmLabel: text.overrideConfirm, motivoRequired: true }
}
