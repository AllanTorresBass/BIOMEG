'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form'
import { usePortalCommands } from '@/hooks/use-portal'
import { strings } from '@/lib/strings'
import { CEDULA_TYPES } from '@/lib/utils/format'
import { portalCodeCheckSchema, portalCodeRequestSchema, type PortalCodeCheckInput, type PortalCodeRequestInput } from '@/types/portal/portal.schemas'

const FIELD = 'h-11 min-w-0 w-full rounded-[var(--radius-control)] border border-border-strong bg-background px-3'
const BUTTON =
  'h-11 rounded-[var(--radius-control)] bg-primary px-4 font-semibold text-primary-foreground disabled:opacity-60'
const text = strings.portal

/** The schema stays loose so a malformed cédula gets the same answer as a wrong one. Errors stay inline (rule 9). */
export function PortalSignIn() {
  const { requestPortalCode, verifyPortalCode } = usePortalCommands()
  const router = useRouter()
  const [step, setStep] = useState<'data' | 'code'>('data')
  const [error, setError] = useState<string | null>(null)
  const [demoCode, setDemoCode] = useState<string | null>(null)
  const dataForm = useForm<PortalCodeRequestInput>({
    resolver: zodResolver(portalCodeRequestSchema),
    defaultValues: { type: 'V', digits: '', birth: '' },
  })
  const codeForm = useForm<PortalCodeCheckInput>({
    resolver: zodResolver(portalCodeCheckSchema),
    defaultValues: { code: '' },
  })
  const code = useWatch({ control: codeForm.control, name: 'code' })
  const describedBy = error ? 'portal-error' : undefined

  async function askForCode(values: PortalCodeRequestInput) {
    setError(null)
    try {
      const result = await requestPortalCode(values)
      if (result.kind === 'PAUSED') return setError(text.paused)
      setDemoCode(result.demoCode)
      setStep('code')
    } catch {
      setError(text.paused)
    }
  }

  async function submitCode({ code }: PortalCodeCheckInput) {
    setError(null)
    try {
      const result = await verifyPortalCode(code)
      if (result.kind === 'OK') return router.push('/portal')
      setError(result.kind === 'WRONG' ? text.wrongCode : result.kind === 'LOCKED' ? text.lockedCode : text.expiredCode)
      if (result.kind !== 'WRONG') setStep('data')
    } catch {
      setError(text.paused)
    }
  }

  const message = error ? (
    <p id="portal-error" role="alert" className="text-flag-blocked">
      {error}
    </p>
  ) : null

  if (step === 'code') {
    return (
      <Form {...codeForm}>
        <form onSubmit={codeForm.handleSubmit(submitCode)} className="flex flex-col gap-4">
          <p>{text.answered}</p>
          {demoCode ? (
            <p className="rounded-[var(--radius-control)] border border-border bg-muted px-3 py-2">
              {text.demoCode} <strong className="font-mono">{demoCode}</strong>
            </p>
          ) : null}
          <FormField
            control={codeForm.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{text.codeLabel}</FormLabel>
                <FormControl describedBy={describedBy}>
                  <input
                    {...field}
                    onChange={(event) => field.onChange(event.target.value.replace(/\D/g, '').slice(0, 6))}
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    className={`${FIELD} font-mono tracking-widest`}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          {message}
          <button type="submit" disabled={codeForm.formState.isSubmitting || code.length !== 6} className={BUTTON}>
            {text.verify}
          </button>
          <button type="button" onClick={() => setStep('data')} className="h-11 font-semibold underline">
            {text.changeData}
          </button>
        </form>
      </Form>
    )
  }

  return (
    <Form {...dataForm}>
      <form onSubmit={dataForm.handleSubmit(askForCode)} className="flex flex-col gap-4">
        <p>{text.intro}</p>
        <div className="flex gap-3">
          <FormField
            control={dataForm.control}
            name="type"
            render={({ field }) => (
              <FormItem className="w-20 shrink-0">
                <FormLabel>{text.typeLabel}</FormLabel>
                <FormControl>
                  <select {...field} className={FIELD}>
                    {CEDULA_TYPES.map((value) => (
                      <option key={value} value={value}>
                        {value}
                      </option>
                    ))}
                  </select>
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={dataForm.control}
            name="digits"
            render={({ field }) => (
              <FormItem className="min-w-0 flex-1">
                <FormLabel>{text.cedulaLabel}</FormLabel>
                <FormControl>
                  <input
                    {...field}
                    onChange={(event) => field.onChange(event.target.value.replace(/\D/g, '').slice(0, 9))}
                    inputMode="numeric"
                    autoComplete="off"
                    required
                    className={FIELD}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={dataForm.control}
          name="birth"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{text.birthLabel}</FormLabel>
              <FormControl describedBy={describedBy}>
                <input
                  {...field}
                  onChange={(event) => field.onChange(event.target.value.replace(/[^\d/]/g, '').slice(0, 10))}
                  placeholder={text.birthHint}
                  inputMode="numeric"
                  autoComplete="bday"
                  required
                  className={FIELD}
                />
              </FormControl>
            </FormItem>
          )}
        />
        {message}
        <button type="submit" disabled={dataForm.formState.isSubmitting} className={BUTTON}>
          {text.requestCode}
        </button>
      </form>
    </Form>
  )
}
