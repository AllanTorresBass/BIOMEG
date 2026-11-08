'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useRef, useState, type ReactNode } from 'react'
import { useForm, useWatch, type UseFormReturn } from 'react-hook-form'
import { z } from 'zod'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { useSessionCommands } from '@/hooks/use-session'
import { SESSION_SETTINGS } from '@/lib/config/session'
import { strings } from '@/lib/strings'
import { errorMessage } from '@/lib/utils/errors'
import { changePasswordSchema } from '@/types/session/session.schemas'
import type { ChangePasswordFormProps, FormState } from '@/types/session/session.types'

const FIELD = 'h-10 w-full rounded-[var(--radius-control)] border border-border-strong bg-background px-3'

const formSchema = changePasswordSchema
  .extend({ confirm: z.string().max(200) })
  .superRefine((value, ctx) => {
    if (value.next.length < SESSION_SETTINGS.minPasswordLength) {
      ctx.addIssue({ code: 'custom', path: ['next'], message: strings.auth.passwordTooShort(SESSION_SETTINGS.minPasswordLength) })
    } else if (value.next === value.current) {
      ctx.addIssue({ code: 'custom', path: ['next'], message: strings.auth.passwordSame })
    }
    if (value.confirm === '') {
      ctx.addIssue({ code: 'custom', path: ['confirm'], message: strings.pendingReview.api.required })
    } else if (value.confirm !== value.next) {
      ctx.addIssue({ code: 'custom', path: ['confirm'], message: strings.auth.passwordMismatch })
    }
  })

type PasswordFormValues = z.infer<typeof formSchema>

export function ChangePasswordForm({ replaceFirst }: ChangePasswordFormProps) {
  const { changePassword } = useSessionCommands()
  const [state, setState] = useState<FormState>({ error: null })
  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { current: '', next: '', confirm: '' },
  })
  const current = useWatch({ control: form.control, name: 'current' })

  async function submit(values: PasswordFormValues) {
    setState({ error: null })
    form.clearErrors('current')
    try {
      const result = await changePassword({ current: values.current, next: values.next })
      if (result.error === strings.auth.passwordWrongCurrent) {
        form.setError('current', { message: result.error })
        return
      }
      setState(result)
      if (result.done) form.reset()
    } catch (failure: unknown) {
      setState({ error: errorMessage(failure, strings.pendingReview.api.failed) })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(submit)} noValidate className="flex flex-col gap-4">
        <PasswordField
          form={form}
          name="current"
          label={strings.auth.currentPassword}
          autoComplete={replaceFirst ? 'off' : 'current-password'}
          blockBrowserFill={replaceFirst}
          hint={
            <>
              {replaceFirst ? <p className="text-sm text-muted-foreground">{strings.auth.passwordUsedAtSignIn}</p> : null}
              {current.length > 0 ? <p className="text-sm text-muted-foreground">{strings.auth.characterCount(current.length)}</p> : null}
            </>
          }
        />
        <PasswordField
          form={form}
          name="next"
          label={strings.auth.newPassword}
          autoComplete="new-password"
          hint={<p className="text-sm text-muted-foreground">{strings.auth.passwordTooShort(SESSION_SETTINGS.minPasswordLength)}</p>}
        />
        <PasswordField form={form} name="confirm" label={strings.auth.repeatPassword} autoComplete="new-password" />
        {state.error ? (
          <p role="alert" className="text-flag-blocked">
            {state.error}
          </p>
        ) : null}
        {state.done ? <p role="status">{strings.auth.passwordChanged}</p> : null}
        <button
          type="submit"
          disabled={form.formState.isSubmitting}
          className="h-10 self-start rounded-[var(--radius-control)] bg-primary px-4 font-semibold text-primary-foreground disabled:opacity-60"
        >
          {strings.auth.changePassword}
        </button>
      </form>
    </Form>
  )
}

function PasswordField({
  form,
  name,
  label,
  autoComplete,
  blockBrowserFill = false,
  hint,
}: {
  form: UseFormReturn<PasswordFormValues>
  name: keyof PasswordFormValues
  label: string
  autoComplete: string
  blockBrowserFill?: boolean
  hint?: ReactNode
}) {
  const [visible, setVisible] = useState(false)
  const typed = useRef(false)
  const [blockedFill, setBlockedFill] = useState(false)

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <div className="flex items-center justify-between gap-3">
            <FormLabel>{label}</FormLabel>
            <button
              type="button"
              className="text-sm font-semibold text-primary"
              aria-pressed={visible}
              aria-label={`${visible ? strings.auth.hidePassword : strings.auth.showPassword} ${label}`}
              onClick={() => setVisible((value) => !value)}
            >
              {visible ? strings.auth.hidePassword : strings.auth.showPassword}
            </button>
          </div>
          <FormControl describedBy={blockedFill ? `${field.name}-browser` : undefined}>
            <input
              {...field}
              type={visible ? 'text' : 'password'}
              autoComplete={autoComplete}
              autoCapitalize="none"
              spellCheck={false}
              className={FIELD}
              onKeyDown={() => {
                typed.current = true
              }}
              onPaste={() => {
                typed.current = true
              }}
              onChange={(event) => {
                const native = event.nativeEvent
                const inputType = native instanceof InputEvent ? native.inputType : ''
                const personTyped = typed.current || inputType === 'insertText' || inputType === 'insertFromPaste'
                if (blockBrowserFill && !personTyped) {
                  event.currentTarget.value = ''
                  field.onChange('')
                  setBlockedFill(true)
                  return
                }
                setBlockedFill(false)
                field.onChange(event.target.value)
              }}
            />
          </FormControl>
          {blockedFill ? (
            <p id={`${field.name}-browser`} className="text-sm text-flag-blocked">
              {strings.auth.passwordBrowserFilled}
            </p>
          ) : null}
          {hint}
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
