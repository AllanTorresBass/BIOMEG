'use client'

import { useRouter } from 'next/navigation'
import { useMemo, useRef, useState, useTransition } from 'react'
import { cancelDraft, goToStep } from '@/app/actions/order-draft'
import { savePayment, saveOrder } from '@/app/actions/order-save'
import { PatientHeader } from '@/components/orders/PatientHeader'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { PAYMENT_METHODS } from '@/lib/config/payment-methods'
import { computeOrderTotals, parsePercentBp } from '@/lib/domain/order-totals'
import { strings } from '@/lib/strings'
import { formatMoney, formatRate } from '@/lib/utils/format'
import type { DraftPayment } from '@/types/orders/draft.types'
import type { PaymentStepProps } from '@/types/orders/screen.types'

const text = strings.pendingReview.orders

const FIELD = 'h-10 rounded-[var(--radius-control)] border border-border-strong bg-background px-3'

export function PaymentStep(props: PaymentStepProps) {
  const { draftId, patient, isEmpresa, convenios, rate, rateDate, ivaRate, igtfRate, linePrices, discountLimit } = props
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [message, setMessage] = useState('')
  const [rateQuestion, setRateQuestion] = useState('')
  const attemptKey = useRef(crypto.randomUUID())

  const [payments, setPayments] = useState<DraftPayment[]>(props.payments)
  const [convenioId, setConvenioId] = useState(props.convenioId ?? '')
  const [titular, setTitular] = useState(props.titular)
  const [razonSocial, setRazonSocial] = useState(props.razonSocial)
  const [discountPct, setDiscountPct] = useState(props.discountPct === '0' ? '' : props.discountPct)
  const [discountMotivo, setDiscountMotivo] = useState(props.discountMotivo)

  const convenio = convenios.find((option) => option.id === convenioId) ?? null
  const discountBp = parsePercentBp(discountPct)
  const overLimit = discountBp !== null && discountBp > Math.round(discountLimit * 100)

  const totals = useMemo(
    () =>
      computeOrderTotals({
        lines: linePrices.map((priceUsd) => ({ priceUsd })),
        rate: rate === '' ? null : rate,
        ivaRate,
        igtfRate,
        discountPct,
        payments,
      }),
    [linePrices, rate, ivaRate, igtfRate, discountPct, payments],
  )

  function setRow(method: string, patch: Partial<DraftPayment>) {
    setPayments((rows) => rows.map((row) => (row.method === method ? { ...row, ...patch } : row)))
  }

  function persist() {
    return savePayment({
      draftId,
      convenioId: isEmpresa && convenioId !== '' ? convenioId : null,
      titular,
      razonSocial,
      payments,
      discountPct,
      discountMotivo,
    })
  }

  function save(confirmRate: boolean) {
    startTransition(async () => {
      setRateQuestion('')
      const stored = await persist()
      if (!stored.ok) {
        setMessage(stored.message)
        return
      }
      const result = await saveOrder({ draftId, key: attemptKey.current, rateSeen: rate, confirmRate })
      if (result.ok || result.reload) {
        if (result.message) setMessage(result.message)
        router.refresh()
        return
      }
      if (result.need === 'RATE_CHANGED') {
        setRateQuestion(result.message)
        return
      }
      setMessage(result.message)
    })
  }

  function back() {
    startTransition(async () => {
      const moved = await goToStep(draftId, 3)
      setMessage(moved.message)
    })
  }

  function cancel() {
    startTransition(async () => {
      await cancelDraft(draftId)
      router.push('/')
    })
  }

  const totalRows: [string, string][] = [
    [text.subTotal, formatMoney(totals.subTotal)],
    [text.exento, formatMoney(totals.exento)],
    [text.base, formatMoney(totals.base)],
    [text.iva, formatMoney(totals.iva)],
    [text.igtf, formatMoney(totals.igtf)],
    [text.desc, formatMoney(totals.discount)],
    [text.totalUsdLabel, formatMoney(totals.totalUsd)],
    [text.totalBsLabel, totals.totalBs === null ? strings.empty.dash : formatMoney(totals.totalBs)],
    [text.abono, formatMoney(totals.abono)],
    [text.resta, formatMoney(totals.resta)],
  ]

  return (
    <div className="flex flex-col gap-4">
      <PatientHeader patient={patient} />

      {isEmpresa ? (
        <fieldset className="flex flex-col gap-3 rounded-[var(--radius-card)] border border-border bg-card p-4">
          <legend className="px-1 font-semibold">{text.convenio}</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1">
              <span className="font-semibold">{text.convenio}</span>
              <select value={convenioId} onChange={(event) => setConvenioId(event.target.value)} className={FIELD}>
                <option value="">{text.convenioPick}</option>
                {convenios.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1">
              <span className="font-semibold">{strings.pendingReview.orders.razonSocial}</span>
              <input value={razonSocial} onChange={(event) => setRazonSocial(event.target.value)} className={FIELD} />
            </label>
            {convenio?.requiresTitular ? (
              <label className="flex flex-col gap-1">
                <span className="font-semibold">{text.titular}</span>
                <input value={titular} onChange={(event) => setTitular(event.target.value)} className={FIELD} />
                <span className="text-sm text-muted-foreground">{text.titularHint}</span>
              </label>
            ) : null}
          </div>
        </fieldset>
      ) : (
        <p className="text-sm text-muted-foreground">{strings.orders.billedToPatient}</p>
      )}

      <fieldset className="flex flex-col gap-3 rounded-[var(--radius-card)] border border-border bg-card p-4">
        <legend className="px-1 font-semibold">{text.paymentTitle}</legend>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border">
                <th scope="col" className="px-2 py-2">{text.colMethod}</th>
                <th scope="col" className="px-2 py-2">{text.colAmount}</th>
                <th scope="col" className="px-2 py-2">{text.colBank}</th>
                <th scope="col" className="px-2 py-2">{text.colReference}</th>
              </tr>
            </thead>
            <tbody>
              {PAYMENT_METHODS.map((method) => {
                const row = payments.find((candidate) => candidate.method === method.id)
                if (!row) return null
                const currency = method.currency === 'USD' ? 'USD' : 'Bs'
                return (
                  <tr key={method.id} className="border-b border-border last:border-0">
                    <th scope="row" className="px-2 py-2 font-normal">
                      {method.label}
                    </th>
                    <td className="px-2 py-2">
                      <input
                        inputMode="decimal"
                        value={row.amount}
                        onChange={(event) => setRow(method.id, { amount: event.target.value })}
                        aria-label={text.amountLabel(method.label, currency)}
                        placeholder={currency}
                        className={`${FIELD} w-32 text-right`}
                      />
                    </td>
                    <td className="px-2 py-2">
                      {method.electronic ? (
                        <input
                          value={row.bank}
                          onChange={(event) => setRow(method.id, { bank: event.target.value })}
                          aria-label={text.bankLabel(method.label)}
                          className={`${FIELD} w-40`}
                        />
                      ) : null}
                    </td>
                    <td className="px-2 py-2">
                      {method.electronic ? (
                        <input
                          value={row.reference}
                          onChange={(event) => setRow(method.id, { reference: event.target.value })}
                          aria-label={text.referenceLabel(method.label)}
                          className={`${FIELD} w-40`}
                        />
                      ) : null}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-3 rounded-[var(--radius-card)] border border-border bg-card p-4">
        <legend className="px-1 font-semibold">{text.desc}</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1">
            <span className="font-semibold">{text.discountPct}</span>
            <input
              inputMode="decimal"
              value={discountPct}
              onChange={(event) => setDiscountPct(event.target.value)}
              aria-invalid={discountBp === null}
              className={`${FIELD} w-32`}
            />
          </label>
          {discountBp !== null && discountBp > 0 ? (
            <label className="flex flex-col gap-1">
              <span className="font-semibold">{text.discountMotivo}</span>
              <input value={discountMotivo} onChange={(event) => setDiscountMotivo(event.target.value)} className={FIELD} />
              {overLimit ? <span className="text-sm text-muted-foreground">{text.discountOverLimit(discountLimit)}</span> : null}
            </label>
          ) : null}
        </div>
        {discountBp === null ? <p className="text-sm">{text.discountInvalid}</p> : null}
      </fieldset>

      <dl className="grid gap-x-6 gap-y-1 rounded-[var(--radius-card)] border border-border bg-card p-4 sm:grid-cols-2">
        {totalRows.map(([label, value]) => (
          <div key={label} className="flex justify-between gap-4">
            <dt className="text-muted-foreground">{label}</dt>
            <dd className="font-semibold tabular-nums">{value}</dd>
          </div>
        ))}
        <p className="text-sm text-muted-foreground sm:col-span-2">
          {rate === '' ? text.noRateTotal : text.rateUsed(`${formatRate(rate)} (${rateDate})`)}
        </p>
        {!totals.ivaConfigured || !totals.igtfConfigured ? (
          <p className="text-sm text-muted-foreground sm:col-span-2">{text.taxNotConfigured}</p>
        ) : null}
      </dl>

      <p role="status" className="min-h-6 text-sm">
        {message}
      </p>

      <div className="flex flex-wrap justify-between gap-2">
        <button
          type="button"
          onClick={cancel}
          disabled={pending}
          className="h-11 rounded-[var(--radius-control)] border border-border-strong px-4 font-semibold disabled:opacity-50"
        >
          {text.cancel}
        </button>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={back}
            disabled={pending}
            className="h-11 rounded-[var(--radius-control)] border border-border-strong px-4 font-semibold disabled:opacity-50"
          >
            {text.back}
          </button>
          <button
            type="button"
            onClick={() => save(false)}
            disabled={pending}
            className="h-11 rounded-[var(--radius-control)] bg-primary px-4 font-semibold text-primary-foreground disabled:opacity-50"
          >
            {pending ? text.saving : text.save}
          </button>
        </div>
      </div>

      <ConfirmDialog
        open={rateQuestion !== ''}
        title={text.rateChangedTitle}
        body={rateQuestion}
        confirmLabel={text.rateChangedConfirm}
        cancelLabel={strings.auth.cancel}
        onConfirm={() => save(true)}
        onCancel={() => setRateQuestion('')}
      />
    </div>
  )
}
