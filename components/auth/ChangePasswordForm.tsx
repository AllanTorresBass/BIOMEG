'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { useSessionCommands } from '@/hooks/use-session'
import { strings } from '@/lib/strings'
import { errorMessage } from '@/lib/utils/errors'
import { changePasswordSchema, type ChangePasswordInput } from '@/types/session/session.schemas'
import type { FormState } from '@/types/session/session.types'

const FIELD = 'h-10 rounded-[var(--radius-control)] border border-border-strong bg-background px-3'

export function ChangePasswordForm() {
  const { changePassword } = useSessionCommands()
  const [state, setState] = useState<FormState>({ error: null })
  const form = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { current: '', next: '' },
  })

  async function submit(values: ChangePasswordInput) {
    try {
      const result = await changePassword(values)
      setState(result)
      if (result.done) form.reset()
    } catch (failure: unknown) {
      setState({ error: errorMessage(failure, strings.pendingReview.api.failed) })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(submit)} noValidate className="flex max-w-sm flex-col gap-4">
        <FormField
          control={form.control}
          name="current"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{strings.auth.currentPassword}</FormLabel>
              <FormControl>
                <input {...field} type="password" autoComplete="current-password" className={FIELD} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="next"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{strings.auth.newPassword}</FormLabel>
              <FormControl>
                <input {...field} type="password" autoComplete="new-password" className={FIELD} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
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
