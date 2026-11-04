import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { SignInForm } from '@/components/auth/SignInForm'
import { LogoLockup } from '@/components/brand/LogoLockup'
import { getStaffContext } from '@/lib/server/session/current'
import { strings } from '@/lib/strings'

export const metadata: Metadata = { title: strings.auth.signInTitle }

export default async function SignInPage() {
  if (await getStaffContext()) redirect('/')

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 p-6">
      <LogoLockup />
      <section className="w-full max-w-sm rounded-[var(--radius-card)] border border-border bg-card p-5">
        <h1 className="mb-4 text-xl font-semibold">{strings.auth.signInTitle}</h1>
        <SignInForm />
      </section>
    </main>
  )
}
