'use client'

import Link from 'next/link'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState, useTransition, type ClipboardEvent } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { StatusChip } from '@/components/shared/StatusChip'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useClientCommands } from '@/hooks/use-clients'
import { useUnsavedEdits } from '@/components/shell/UnsavedEditsContext'
import { strings } from '@/lib/strings'
import { CEDULA_TYPES, formatCedula, formatDate, parseCedulaPaste } from '@/lib/utils/format'
import { clientCardSchema } from '@/types/clients/clients.schemas'
import type { ClientCardData } from '@/types/clients/card.types'
import type { ClientFormState, ClientFieldName } from '@/types/domain/client.types'
import type { ClientCardProps, Values } from '@/types/clients/client-card.props'

const INITIAL: ClientFormState = {
  error: null,
  field: null,
  similar: [],
  duplicate: null,
  conflict: null,
  needsConfirm: false,
  savedId: null,
}

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

export function ClientCard({ data, canEdit, canOpenOrder, justSaved }: ClientCardProps) {
  const { saveClient } = useClientCommands()
  const text = strings.pendingReview.clients
  const [state, setState] = useState<ClientFormState>(INITIAL)
  const [pending, startSave] = useTransition()
  const form = useForm<Values>({ resolver: zodResolver(clientCardSchema), defaultValues: pick(data) })
  const { setDirty } = useUnsavedEdits()
  const cedulaType = useWatch({ control: form.control, name: 'cedulaType' })
  const cedulaNumber = useWatch({ control: form.control, name: 'cedulaNumber' })
  const fullName = useWatch({ control: form.control, name: 'fullName' })
  const birthDate = useWatch({ control: form.control, name: 'birthDate' })
  const changed = form.formState.isDirty
  const canSave = canEdit && fullName.trim() !== '' && birthDate.trim() !== ''

  useEffect(() => {
    setDirty(canEdit && changed)
    return () => setDirty(false)
  }, [canEdit, changed, setDirty])

  useEffect(() => {
    if (!state.field || !state.error) return
    form.setError(state.field as ClientFieldName, { type: 'server', message: state.error })
  }, [state.field, state.error, form])

  const onPaste = (event: ClipboardEvent<HTMLInputElement>) => {
    const parsed = parseCedulaPaste(event.clipboardData.getData('text'))
    if (!parsed) return
    event.preventDefault()
    form.setValue('cedulaType', parsed.type, { shouldDirty: true })
    form.setValue('cedulaNumber', parsed.digits, { shouldDirty: true })
  }

  /** The server judges the fields, so its one rule set decides. A confirm comes back as needsConfirm. */
  const save = (confirm: { similar?: boolean; gesture?: boolean } = {}) =>
    form.handleSubmit((current) => {
      startSave(async () => {
        form.clearErrors()
        const result = await saveClient({
          ...current,
          id: data.id,
          version: data.version,
          confirmSimilar: confirm.similar === true,
          confirmGesture: confirm.gesture === true,
        })
        setState({ ...INITIAL, ...result })
        if (!result.error && result.redirectTo) setDirty(false)
      })
    })()

  const cedulaPreview = cedulaType && cedulaNumber ? formatCedula(cedulaType as 'V', cedulaNumber) : ''
  const cedulaDisabled = !canEdit || pending || data.cedulaLocked

  return (
    <Form {...form}>
      <form
        onSubmit={(event) => {
          event.preventDefault()
          void save()
        }}
        className="flex flex-col gap-4 rounded-[var(--radius-card)] border border-border bg-card p-4"
      >
        <div className="flex flex-col gap-2 border-b-2 border-[var(--color-burgundy)] pb-3">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-lg font-semibold">{data.id ? text.cardTitle : text.newTitle}</h2>
            {data.id ? (
              data.verified ? (
                <Badge className="rounded-[var(--radius-control)] border-transparent bg-flag-released-bg text-xs font-semibold text-flag-released uppercase">
                  {strings.clients.verified}
                </Badge>
              ) : (
                <StatusChip status="SIN_VERIFICAR" />
              )
            ) : null}
            {data.id && !data.active ? <StatusChip status="INACTIVO" /> : null}
          </div>
        </div>

        {justSaved ? (
          <Alert className="border-flag-released bg-flag-released-bg text-flag-released">
            <AlertDescription>{text.saved}</AlertDescription>
          </Alert>
        ) : null}
        {!canEdit ? <p className="text-muted-foreground">{text.readOnly}</p> : null}

        <fieldset disabled={!canEdit || pending} className="flex flex-col gap-4">
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{text.name}</FormLabel>
                <FormControl describedBy={state.field === 'fullName' ? 'client-error' : undefined}>
                  <Input {...field} autoComplete="off" className="h-10 rounded-[var(--radius-control)]" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex flex-col gap-1">
            <span className="font-semibold" id="cedula-label">
              {text.cedula}
            </span>
            <div className="flex flex-wrap gap-2" role="group" aria-labelledby="cedula-label">
              <FormField
                control={form.control}
                name="cedulaType"
                render={({ field }) => (
                  <FormItem className="w-24">
                    <FormControl describedBy={state.field === 'cedulaType' ? 'client-error' : undefined}>
                      <select
                        {...field}
                        disabled={cedulaDisabled}
                        aria-label={text.cedulaType}
                        className="h-10 w-full rounded-[var(--radius-control)] border border-input bg-background px-3 disabled:bg-sunken disabled:text-muted-foreground"
                      >
                        <option value="">{strings.empty.dash}</option>
                        {CEDULA_TYPES.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="cedulaNumber"
                render={({ field }) => (
                  <FormItem className="min-w-48 flex-1">
                    <FormControl describedBy={state.field === 'cedulaNumber' ? 'client-error' : undefined}>
                      <Input
                        {...field}
                        disabled={cedulaDisabled}
                        aria-label={text.cedulaNumber}
                        inputMode="numeric"
                        onPaste={onPaste}
                        autoComplete="off"
                        className="h-10 rounded-[var(--radius-control)] tabular-nums"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            {cedulaPreview ? <span className="text-muted-foreground tabular-nums">{cedulaPreview}</span> : null}
            {data.cedulaLocked ? (
              <p className="text-sm text-muted-foreground">
                {strings.clients.cedulaLocked} {strings.clients.cedulaLockedHelp}
              </p>
            ) : canEdit ? (
              <span className="text-sm text-muted-foreground">{text.pasteHint}</span>
            ) : null}
          </div>

          <div className="flex flex-wrap gap-4">
            <FormField
              control={form.control}
              name="birthDate"
              render={({ field }) => (
                <FormItem className="min-w-40">
                  <FormLabel>{strings.clients.birthDate}</FormLabel>
                  <FormControl describedBy={state.field === 'birthDate' ? 'client-error' : undefined}>
                    <Input
                      {...field}
                      placeholder={strings.clients.birthDatePlaceholder}
                      inputMode="numeric"
                      autoComplete="off"
                      className="h-10 rounded-[var(--radius-control)] tabular-nums"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex min-w-32 flex-col gap-1">
              <span className="font-semibold">{strings.clients.age}</span>
              <span className="flex h-10 items-center tabular-nums">{data.ageText}</span>
            </div>
            <FormField
              control={form.control}
              name="sex"
              render={({ field }) => (
                <FormItem className="min-w-40">
                  <FormLabel>{text.sex}</FormLabel>
                  <FormControl>
                    <select
                      {...field}
                      className="h-10 w-full rounded-[var(--radius-control)] border border-input bg-background px-3"
                    >
                      <option value="">{text.noSex}</option>
                      <option value="M">{strings.clients.male}</option>
                      <option value="F">{strings.clients.female}</option>
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex flex-wrap gap-4">
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem className="min-w-48 flex-1">
                  <FormLabel>{text.phone}</FormLabel>
                  <FormControl>
                    <Input {...field} type="tel" autoComplete="off" className="h-10 rounded-[var(--radius-control)]" />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="min-w-48 flex-1">
                  <FormLabel>{text.email}</FormLabel>
                  <FormControl describedBy={state.field === 'email' ? 'client-error' : undefined}>
                    <Input {...field} type="email" autoComplete="off" className="h-10 rounded-[var(--radius-control)]" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <fieldset className="flex flex-col gap-2 rounded-[var(--radius-control)] border border-border p-3">
            <legend className="px-1 font-semibold">{text.consentTitle}</legend>
            <FormField
              control={form.control}
              name="consentWhatsapp"
              render={({ field }) => (
                <label className="flex items-center gap-2">
                  <Checkbox checked={field.value} onCheckedChange={(value) => field.onChange(value === true)} />
                  <span>{text.consentWhatsapp}</span>
                </label>
              )}
            />
            <FormField
              control={form.control}
              name="consentEmail"
              render={({ field }) => (
                <label className="flex items-center gap-2">
                  <Checkbox checked={field.value} onCheckedChange={(value) => field.onChange(value === true)} />
                  <span>{text.consentEmail}</span>
                </label>
              )}
            />
            <span className="text-sm text-muted-foreground">{text.consentNote}</span>
          </fieldset>
        </fieldset>

        {state.error && !state.field ? (
          <Alert variant="destructive" id="client-error">
            <AlertDescription>{state.error}</AlertDescription>
          </Alert>
        ) : null}
        {state.error && state.field ? (
          <p id="client-error" role="alert" className="sr-only">
            {state.error}
          </p>
        ) : null}

        {state.duplicate ? (
          <p>
            <Link href={`/clientes?id=${state.duplicate.id}`} className="font-semibold text-primary underline">
              {text.openExisting}: {state.duplicate.fullName},{' '}
              {formatCedula(state.duplicate.cedulaType ?? 'V', state.duplicate.cedulaDigits ?? '')}
            </Link>
          </p>
        ) : null}

        {state.similar.length > 0 ? (
          <Alert className="border-flag-incomplete bg-flag-incomplete-bg">
            <AlertDescription className="flex flex-col gap-2 text-flag-incomplete">
              <p className="font-semibold">{text.similarTitle}</p>
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
              <Button
                type="button"
                variant="outline"
                onClick={() => void save({ similar: true })}
                disabled={pending}
                className="h-10 self-start rounded-[var(--radius-control)]"
              >
                {text.similarConfirm}
              </Button>
            </AlertDescription>
          </Alert>
        ) : null}

        {state.conflict ? (
          <Alert variant="destructive">
            <AlertDescription className="flex flex-col gap-2">
              <p>{text.conflict(state.conflict.savedBy, state.conflict.savedAt)}</p>
              {data.id ? (
                <Link href={`/clientes?id=${data.id}`} className="font-semibold underline">
                  {text.reload}
                </Link>
              ) : null}
            </AlertDescription>
          </Alert>
        ) : null}

        <div className="flex flex-wrap gap-2">
          {canEdit ? (
            <Button
              type="submit"
              disabled={pending || !canSave}
              className="h-10 rounded-[var(--radius-control)] px-6 font-semibold"
            >
              {pending ? text.saving : text.save}
            </Button>
          ) : null}
          {data.id && data.active && canOpenOrder ? (
            <Button asChild variant="outline" className="h-10 rounded-[var(--radius-control)] px-4 font-semibold">
              <Link href={`/ordenes/nueva?via=particular&clientId=${encodeURIComponent(data.id)}`}>
                {strings.clients.newOrder}
              </Link>
            </Button>
          ) : null}
        </div>

        <ConfirmDialog
          open={state.needsConfirm}
          title={text.confirmChangeTitle}
          body={text.confirmChangeBody}
          confirmLabel={text.save}
          cancelLabel={strings.auth.cancel}
          onConfirm={() => void save({ gesture: true })}
          onCancel={() => setState(INITIAL)}
        />
      </form>
    </Form>
  )
}
