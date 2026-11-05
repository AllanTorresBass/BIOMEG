'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { useSessionCommands } from '@/hooks/use-session'
import { strings } from '@/lib/strings'
import { signInSchema, type SignInInput } from '@/types/session/session.schemas'

const FIELD = 'h-10 rounded-[var(--radius-control)] border border-border-strong bg-background px-3'

export function SignInForm() {
  const { signIn } = useSessionCommands()
  const [error, setError] = useState<string | null>(null)
  const form = useForm<SignInInput>({
    resolver: zodResolver(signInSchema),
    defaultValues: { username: '', password: '' },
  })

  async function submit(values: SignInInput) {
    setError(null)
    const result = await signIn(values)
    if (result.error) setError(result.error)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(submit)} noValidate className="flex flex-col gap-4">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{strings.auth.username}</FormLabel>
              <FormControl>
                <input {...field} autoComplete="username" autoCapitalize="none" spellCheck={false} className={FIELD} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{strings.auth.password}</FormLabel>
              <FormControl describedBy={error ? 'sign-in-error' : undefined}>
                <input {...field} type="password" autoComplete="current-password" className={FIELD} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {error ? (
          <p id="sign-in-error" role="alert" className="text-flag-blocked">
            {error}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={form.formState.isSubmitting}
          className="h-10 rounded-[var(--radius-control)] bg-primary px-4 font-semibold text-primary-foreground disabled:opacity-60"
        >
          {strings.auth.submit}
        </button>
      </form>
    </Form>
  )
}
