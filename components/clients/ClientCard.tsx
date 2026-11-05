'use client'

import Link from 'next/link'
import { useActionState, useEffect, useState, type ClipboardEvent } from 'react'
import { saveClient } from '@/app/actions/clients'
import { useUnsavedEdits } from '@/components/shell/UnsavedEditsContext'
import { strings } from '@/lib/strings'
import { CEDULA_TYPES, formatCedula, formatDate, parseCedulaPaste } from '@/lib/utils/format'
import type { ClientCardData } from '@/types/clients/card.types'
import type { ClientFormState, ClientFieldName } from '@/types/domain/client.types'

const INITIAL: ClientFormState = { error: null, field: null, similar: [], duplicate: null, conflict: null, needsConfirm: false, savedId: null }

const INPUT =
  'h-10 rounded-[var(--radius-control)] border border-border-strong bg-background px-3 disabled:bg-sunken disabled:text-muted-foreground'

interface ClientCardProps {
  data: ClientCardData
  canEdit: boolean
  justSaved: boolean
  returnQuery: string
}

type Values = Pick<
  ClientCardData,
  'fullName' | 'cedulaType' | 'cedulaNumber' | 'birthDate' | 'sex' | 'phone' | 'email' | 'consentWhatsapp' | 'consentEmail'
>

function pick(data: ClientCardData): Values {
  return {
    fullName: data.fullName,
    cedulaType: data.cedulaType,
    cedulaNumber: data.cedulaNumber,
    birthDate: data.birthDate,
    sex: data.sex,
    phone: data.phone,
    email: data.email,
    consentWhatsapp: data.consentWhatsapp,
    consentEmail: data.consentEmail,
  }
}

export function ClientCard({ data, canEdit, justSaved, returnQuery }: ClientCardProps) {
  const text = strings.pendingReview.clients
  const [state, action, pending] = useActionState(saveClient, INITIAL)
  const [values, setValues] = useState<Values>(() => pick(data))
  const { setDirty } = useUnsavedEdits()

  const initial = pick(data)
  const changed = (Object.keys(initial) as (keyof Values)[]).some((key) => initial[key] !== values[key])
  useEffect(() => {
    setDirty(canEdit && changed)
    return () => setDirty(false)
  }, [canEdit, changed, setDirty])

  const set = <K extends keyof Values>(key: K, value: Values[K]) => setValues((previous) => ({ ...previous, [key]: value }))

  const onPaste = (event: ClipboardEvent<HTMLInputElement>) => {
    const parsed = parseCedulaPaste(event.clipboardData.getData('text'))
    if (!parsed) return
    event.preventDefault()
    setValues((previous) => ({ ...previous, cedulaType: parsed.type, cedulaNumber: parsed.digits }))
  }

  const errorId = (field: ClientFieldName) => (state.field === field ? 'client-error' : undefined)
  const invalid = (field: ClientFieldName) => (state.field === field ? true : undefined)
  const cedulaPreview = values.cedulaType && values.cedulaNumber ? formatCedula(values.cedulaType as 'V', values.cedulaNumber) : ''

  return (
    <form action={action} className="flex flex-col gap-4 rounded-[var(--radius-card)] border border-border bg-card p-4">
      <input type="hidden" name="id" value={data.id ?? ''} />
      <input type="hidden" name="version" value={data.version ?? ''} />

      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-lg font-semibold">{data.id ? text.cardTitle : text.newTitle}</h2>
        {data.id ? (
          data.verified ? (
            <span className="rounded-[var(--radius-control)] bg-flag-released-bg px-2 py-1 text-xs font-semibold text-flag-released">
              {strings.clients.verified}
            </span>
          ) : (
            <span className="rounded-[var(--radius-control)] bg-flag-incomplete-bg px-2 py-1 text-xs font-semibold text-flag-incomplete">
              {strings.clients.unverified}
            </span>
          )
        ) : null}
        {data.id && !data.active ? (
          <span className="rounded-[var(--radius-control)] bg-sunken px-2 py-1 text-xs font-semibold text-muted-foreground">
            {strings.clients.inactive}
          </span>
        ) : null}
      </div>

      {justSaved ? (
        <p role="status" className="rounded-[var(--radius-control)] bg-flag-released-bg px-3 py-2 text-flag-released">
          {text.saved}
        </p>
      ) : null}
      {!canEdit ? <p className="text-muted-foreground">{text.readOnly}</p> : null}

      <fieldset disabled={!canEdit || pending} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1">
          <span className="font-semibold">{text.name}</span>
          <input
            name="fullName"
            value={values.fullName}
            onChange={(event) => set('fullName', event.target.value)}
            autoComplete="off"
            aria-invalid={invalid('fullName')}
            aria-describedby={errorId('fullName')}
            className={INPUT}
          />
        </label>

        <div className="flex flex-col gap-1">
          <span className="font-semibold" id="cedula-label">{text.cedula}</span>
          <div className="flex flex-wrap gap-2" role="group" aria-labelledby="cedula-label">
            <select
              name="cedulaType"
              aria-label={text.cedulaType}
              value={values.cedulaType}
              onChange={(event) => set('cedulaType', event.target.value)}
              aria-invalid={invalid('cedulaType')}
              aria-describedby={errorId('cedulaType')}
              className={`${INPUT} w-24`}
            >
              <option value="">{strings.empty.dash}</option>
              {CEDULA_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            <input
              name="cedulaNumber"
              aria-label={text.cedulaNumber}
              inputMode="numeric"
              value={values.cedulaNumber}
              onChange={(event) => set('cedulaNumber', event.target.value)}
              onPaste={onPaste}
              autoComplete="off"
              aria-invalid={invalid('cedulaNumber')}
              aria-describedby={errorId('cedulaNumber')}
              className={`${INPUT} min-w-48 flex-1 tabular-nums`}
            />
          </div>
          {cedulaPreview ? <span className="text-muted-foreground tabular-nums">{cedulaPreview}</span> : null}
          {canEdit ? <span className="text-sm text-muted-foreground">{text.pasteHint}</span> : null}
        </div>

        <div className="flex flex-wrap gap-4">
          <label className="flex min-w-40 flex-col gap-1">
            <span className="font-semibold">{strings.clients.birthDate}</span>
            <input
              name="birthDate"
              value={values.birthDate}
              onChange={(event) => set('birthDate', event.target.value)}
              placeholder={strings.clients.birthDatePlaceholder}
              inputMode="numeric"
              autoComplete="off"
              aria-invalid={invalid('birthDate')}
              aria-describedby={errorId('birthDate')}
              className={`${INPUT} tabular-nums`}
            />
          </label>
          <div className="flex min-w-32 flex-col gap-1">
            <span className="font-semibold">{strings.clients.age}</span>
            <span className="flex h-10 items-center tabular-nums">{data.ageText}</span>
          </div>
          <label className="flex min-w-40 flex-col gap-1">
            <span className="font-semibold">{text.sex}</span>
            <select
              name="sex"
              value={values.sex}
              onChange={(event) => set('sex', event.target.value)}
              aria-invalid={invalid('sex')}
              aria-describedby={errorId('sex')}
              className={INPUT}
            >
              <option value="">{text.noSex}</option>
              <option value="M">{strings.clients.male}</option>
              <option value="F">{strings.clients.female}</option>
            </select>
          </label>
        </div>

        <div className="flex flex-wrap gap-4">
          <label className="flex min-w-48 flex-1 flex-col gap-1">
            <span className="font-semibold">{text.phone}</span>
            <input
              name="phone"
              type="tel"
              value={values.phone}
              onChange={(event) => set('phone', event.target.value)}
              autoComplete="off"
              className={INPUT}
            />
          </label>
          <label className="flex min-w-48 flex-1 flex-col gap-1">
            <span className="font-semibold">{text.email}</span>
            <input
              name="email"
              type="email"
              value={values.email}
              onChange={(event) => set('email', event.target.value)}
              autoComplete="off"
              aria-invalid={invalid('email')}
              aria-describedby={errorId('email')}
              className={INPUT}
            />
          </label>
        </div>

        <fieldset className="flex flex-col gap-2 rounded-[var(--radius-control)] border border-border p-3">
          <legend className="px-1 font-semibold">{text.consentTitle}</legend>
          <label className="flex items-center gap-2">
            <input
              name="consentWhatsapp"
              type="checkbox"
              checked={values.consentWhatsapp}
              onChange={(event) => set('consentWhatsapp', event.target.checked)}
              className="size-4"
            />
            <span>{text.consentWhatsapp}</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              name="consentEmail"
              type="checkbox"
              checked={values.consentEmail}
              onChange={(event) => set('consentEmail', event.target.checked)}
              className="size-4"
            />
            <span>{text.consentEmail}</span>
          </label>
          <span className="text-sm text-muted-foreground">{text.consentNote}</span>
        </fieldset>
      </fieldset>

      {state.error ? (
        <p id="client-error" role="alert" className="rounded-[var(--radius-control)] bg-flag-blocked-bg px-3 py-2 text-flag-blocked">
          {state.error}
        </p>
      ) : null}

      {state.duplicate ? (
        <p>
          <Link href={`/clientes?id=${state.duplicate.id}`} className="font-semibold text-primary underline">
            {text.openExisting}: {state.duplicate.fullName}, {formatCedula(state.duplicate.cedulaType ?? 'V', state.duplicate.cedulaDigits ?? '')}
          </Link>
        </p>
      ) : null}

      {state.similar.length > 0 ? (
        <div role="alert" className="flex flex-col gap-2 rounded-[var(--radius-control)] border border-flag-incomplete bg-flag-incomplete-bg p-3">
          <p className="font-semibold text-flag-incomplete">{text.similarTitle}</p>
          <p>{text.similarBody}</p>
          <ul className="flex flex-col gap-1">
            {state.similar.map((match) => (
              <li key={match.id} className="tabular-nums">
                <Link href={`/clientes?id=${match.id}`} className="font-semibold text-primary underline">
                  {match.fullName}
                </Link>
                {match.cedulaType && match.cedulaDigits ? `, ${formatCedula(match.cedulaType, match.cedulaDigits)}` : ''}
                {`, ${formatDate(match.birthDate)}`}
              </li>
            ))}
          </ul>
          <button
            type="submit"
            name="confirmSimilar"
            value="on"
            disabled={pending}
            className="h-10 self-start rounded-[var(--radius-control)] border border-border-strong bg-card px-4 font-semibold"
          >
            {text.similarConfirm}
          </button>
        </div>
      ) : null}

      {state.conflict ? (
        <div role="alert" className="flex flex-col gap-2 rounded-[var(--radius-control)] bg-flag-blocked-bg p-3 text-flag-blocked">
          <p>{text.conflict(state.conflict.savedBy, state.conflict.savedAt)}</p>
          {data.id ? (
            <Link href={`/clientes?id=${data.id}${returnQuery}`} className="font-semibold underline">
              {text.reload}
            </Link>
          ) : null}
        </div>
      ) : null}

      {canEdit ? (
        <div className="flex">
          <button
            type="submit"
            disabled={pending}
            className="h-10 rounded-[var(--radius-control)] bg-primary px-6 font-semibold text-primary-foreground disabled:opacity-60"
          >
            {pending ? text.saving : text.save}
          </button>
        </div>
      ) : null}
    </form>
  )
}
